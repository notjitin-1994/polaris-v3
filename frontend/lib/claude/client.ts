/**
 * Claude API Client
 * Robust client with retry logic, timeout handling, and comprehensive error handling
 */

import { getClaudeConfig, type ClaudeConfig } from './config';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('claude-client');

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model?: string;
  system: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeErrorResponse {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff: baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);

        logger.warn('claude.client.retry', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: (error as Error).message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Claude API Client
 */
export class ClaudeClient {
  private config: ClaudeConfig;

  constructor(config?: Partial<ClaudeConfig>) {
    this.config = config ? { ...getClaudeConfig(), ...config } : getClaudeConfig();
  }

  /**
   * Generate content using Claude API
   * Implements timeout, retry logic, comprehensive error handling, and automatic token limit adjustment
   */
  async generate(request: ClaudeRequest): Promise<ClaudeResponse> {
    const startTime = Date.now();
    let currentMaxTokens = request.max_tokens || this.config.maxTokens;
    const maxAllowedTokens = 20000; // Maximum safe token limit for Claude

    logger.info('claude.client.request', {
      model: request.model || this.config.primaryModel,
      maxTokens: currentMaxTokens,
      temperature: request.temperature ?? this.config.temperature,
    });

    // Try generation with increasing token limits if truncated
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const adjustedRequest = {
          ...request,
          max_tokens: currentMaxTokens,
        };

        const response = await withRetry(
          () => this.makeRequest(adjustedRequest),
          this.config.retries
        );

        const duration = Date.now() - startTime;

        // CRITICAL: Check if response was truncated at max_tokens
        if (response.stop_reason === 'max_tokens') {
          attempts++;

          // Calculate new token limit (increase by 50%)
          const newMaxTokens = Math.min(Math.ceil(currentMaxTokens * 1.5), maxAllowedTokens);

          if (newMaxTokens > currentMaxTokens && newMaxTokens <= maxAllowedTokens) {
            logger.warn(
              'claude.client.truncation_retry',
              'Response truncated, retrying with higher limit',
              {
                model: response.model,
                currentMaxTokens,
                newMaxTokens,
                outputTokens: response.usage.output_tokens,
                stopReason: response.stop_reason,
                attempt: attempts,
              }
            );

            currentMaxTokens = newMaxTokens;
            continue; // Retry with higher token limit
          } else {
            // Can't increase further, log and throw error
            logger.error(
              'claude.client.truncation_limit_reached',
              'Response truncated at maximum token limit',
              {
                model: response.model,
                maxTokens: currentMaxTokens,
                outputTokens: response.usage.output_tokens,
                stopReason: response.stop_reason,
              }
            );

            throw new ClaudeApiError(
              `Response was truncated at max_tokens (${currentMaxTokens}). The response is incomplete. ` +
                `Consider simplifying the prompt or breaking it into smaller requests.`,
              429, // Too Many Tokens (custom code)
              'max_tokens_exceeded'
            );
          }
        }

        logger.info('claude.client.success', {
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          stopReason: response.stop_reason,
          duration,
          tokenAdjustmentAttempts: attempts,
        });

        return response;
      } catch (error) {
        // If not a truncation error, throw immediately
        if (!(error instanceof ClaudeApiError) || error.errorType !== 'max_tokens_exceeded') {
          const duration = Date.now() - startTime;
          logger.error('claude.client.error', {
            duration,
            error: (error as Error).message,
          });
          throw error;
        }

        // If it's a truncation error and we've exhausted attempts, throw
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
      }
    }

    // Should not reach here, but throw error if it does
    throw new ClaudeApiError(
      'Failed to generate response after maximum attempts',
      500,
      'generation_failed'
    );
  }

  /**
   * Make a single request to Claude API
   * Implements timeout and error handling
   */
  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.config.version,
        },
        body: JSON.stringify({
          model: request.model || this.config.primaryModel,
          max_tokens: request.max_tokens || this.config.maxTokens,
          temperature: request.temperature ?? this.config.temperature,
          system: request.system,
          messages: request.messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as ClaudeErrorResponse | null;

        throw new ClaudeApiError(
          errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData?.error?.type,
          errorData
        );
      }

      const data = (await response.json()) as ClaudeResponse;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ClaudeApiError(`Request timeout after ${this.config.timeout}ms`, 408, 'timeout');
      }

      // Re-throw ClaudeApiError as-is
      if (error instanceof ClaudeApiError) {
        throw error;
      }

      // Wrap other errors
      throw new ClaudeApiError(
        `Network error: ${(error as Error).message}`,
        undefined,
        'network_error',
        error
      );
    }
  }

  /**
   * Extract text content from Claude response
   */
  static extractText(response: ClaudeResponse): string {
    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }

  /**
   * Parse JSON from Claude response
   * Throws error if response is not valid JSON
   */
  static parseJSON<T = unknown>(response: ClaudeResponse): T {
    const text = this.extractText(response);

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new ClaudeApiError(
        'Failed to parse Claude response as JSON',
        undefined,
        'parse_error',
        { text: text.substring(0, 500), error }
      );
    }
  }
}
