import {
  dynamicQuestionSchema,
  generationInputSchema,
  type DynamicQuestions,
  type GenerationInput,
  blueprintSchema,
  Blueprint,
} from '@/lib/ollama/schema';
import {
  buildSystemPrompt,
  buildUserPrompt,
  DEFAULT_MODEL_CONFIG,
  type ModelConfig,
} from '@/lib/ollama/prompts';
import { ServiceUnavailableError, TimeoutError, ValidationError } from '@/lib/ollama/errors';

type FetchLike = typeof fetch;

export type OllamaClientOptions = {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  fetchImpl?: FetchLike;
};

export class OllamaClient {
  private readonly baseUrl: string;
  public readonly modelConfig: ModelConfig;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: OllamaClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.modelConfig = {
      model: options.model || DEFAULT_MODEL_CONFIG.model,
      temperature: options.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      maxTokens: options.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
    };
    this.timeoutMs = options.timeoutMs ?? 120000; // Increased to 2 minutes for complex question generation
    this.fetchImpl = options.fetchImpl || fetch;
  }

  async health(): Promise<boolean> {
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/api/tags`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutId = setTimeout(() => reject(new TimeoutError()), ms);
    });
    try {
      const result = await Promise.race([promise, timeout]);
      return result as T;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private async postJson(path: string, body: unknown, stream = false): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    return this.withTimeout(
      this.fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Important for streaming to ensure connection isn't closed prematurely
        // @ts-expect-error duplex property is not in the standard fetch types but is supported by Node.js
        duplex: 'half',
      }),
      stream ? 0 : this.timeoutMs, // No timeout for streaming, handled by client
    );
  }

  private async retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        // backoff: 2^i seconds with jitter up to 200ms
        const delayMs = (1 << i) * 1000 + Math.floor(Math.random() * 200);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastError;
  }

  async generateQuestions(input: GenerationInput): Promise<DynamicQuestions> {
    const parse = generationInputSchema.safeParse(input);
    if (!parse.success) {
      throw new ValidationError('Invalid generation input', parse.error);
    }

    // Build chat payload for Ollama's /api/chat endpoint
    const payload = {
      model: this.modelConfig.model,
      // Prefer JSON mode for structured output where supported
      format: 'json',
      stream: false,
      // Keep options object as recommended by Ollama
      options: {
        temperature: this.modelConfig.temperature,
        num_predict: this.modelConfig.maxTokens,
      },
      // Back-compat fields for older servers
      temperature: this.modelConfig.temperature,
      max_tokens: this.modelConfig.maxTokens,
      num_predict: this.modelConfig.maxTokens,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(input) },
      ],
    } as const;

    const responseText = await this.retry(async () => {
      const res = await this.postJson('/api/chat', payload);
      if (!res.ok) {
        throw new ServiceUnavailableError(`Ollama chat failed with ${res.status}`);
      }
      const data = (await res.json()) as { message?: { content?: string } } | { response?: string };
      const content = 'message' in data ? data.message?.content : data.response;
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new ServiceUnavailableError('Empty response from Ollama');
      }
      return content;
    });

    // Extract JSON from potential markdown fences
    const jsonString = extractJson(responseText);
    let json: unknown;
    try {
      json = JSON.parse(jsonString);
    } catch (error: unknown) {
      throw new ValidationError('LLM returned invalid JSON', error);
    }

    const validated = dynamicQuestionSchema.safeParse(json);
    if (!validated.success) {
      throw new ValidationError('LLM JSON failed schema validation', validated.error);
    }
    return validated.data;
  }

  async generateBlueprint(systemContext: string, userPrompt: string): Promise<Blueprint> {
    const payload = {
      model: this.modelConfig.model,
      format: 'json',
      stream: false,
      options: {
        temperature: this.modelConfig.temperature,
        num_predict: this.modelConfig.maxTokens,
      },
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: userPrompt },
      ],
    };

    const responseText = await this.retry(async () => {
      const res = await this.postJson('/api/chat', payload);
      if (!res.ok) {
        throw new ServiceUnavailableError(`Ollama chat failed with ${res.status}`);
      }
      const data = (await res.json()) as { message?: { content?: string } } | { response?: string };
      const content = 'message' in data ? data.message?.content : data.response;
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new ServiceUnavailableError('Empty blueprint response from Ollama');
      }
      return content;
    });

    const jsonString = extractJson(responseText);
    let json: unknown;
    try {
      json = JSON.parse(jsonString);
    } catch (error: unknown) {
      throw new ValidationError('LLM returned invalid JSON for blueprint', error);
    }

    const validated = blueprintSchema.safeParse(json);
    if (!validated.success) {
      throw new ValidationError('LLM Blueprint JSON failed schema validation', validated.error);
    }
    return validated.data;
  }

  public async streamBlueprint(
    systemContext: string,
    userPrompt: string,
  ): Promise<ReadableStream<Uint8Array>> {
    const payload = {
      model: this.modelConfig.model,
      format: 'json',
      stream: true, // Enable streaming
      options: {
        temperature: this.modelConfig.temperature,
        num_predict: this.modelConfig.maxTokens,
      },
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: userPrompt },
      ],
    };

    try {
      // Use postJson with stream: true to indicate no timeout and duplex half
      const response = await this.postJson('/api/chat', payload, true);

      if (!response.ok || !response.body) {
        throw new ServiceUnavailableError(`Ollama streaming failed with status ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Error in streamBlueprint:', error);
      throw error;
    }
  }
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  return text.trim();
}
