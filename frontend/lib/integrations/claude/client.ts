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
   * Implements timeout, retry logic, and comprehensive error handling
   */
  async generate(request: ClaudeRequest): Promise<ClaudeResponse> {
    const startTime = Date.now();

    logger.info('claude.client.request', {
      model: request.model || this.config.primaryModel,
      maxTokens: request.max_tokens || this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
    });

    try {
      const response = await withRetry(() => this.makeRequest(request), this.config.retries);

      const duration = Date.now() - startTime;

      logger.info('claude.client.success', {
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('claude.client.error', {
        duration,
        error: (error as Error).message,
      });

      throw error;
    }
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
