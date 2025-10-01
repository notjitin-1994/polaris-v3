import {
  dynamicQuestionSchema,
  generationInputSchema,
  type DynamicQuestions,
  type GenerationInput,
  fullBlueprintSchema,
  type FullBlueprint,
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
  fallbackModel?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  fetchImpl?: FetchLike;
};

export class OllamaClient {
  private readonly baseUrl: string;
  public readonly modelConfig: ModelConfig;
  private readonly fallbackModel: string | undefined;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: OllamaClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.modelConfig = {
      model: options.model || DEFAULT_MODEL_CONFIG.model,
      temperature: options.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      maxTokens: options.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
    };
    this.fallbackModel = options.fallbackModel || 'qwen3:14b'; // Default fallback to 14B model
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
    // Treat non-positive timeout as "no timeout"
    if (!(ms > 0)) {
      return promise;
    }
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
    const requestPromise = this.fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Important for streaming to ensure connection isn't closed prematurely
      // @ts-expect-error duplex property is not in the standard fetch types but is supported by Node.js
      duplex: 'half',
    });
    // For streaming requests, do not apply a timeout to avoid premature cancellation
    return stream ? requestPromise : this.withTimeout(requestPromise, this.timeoutMs);
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
    const canonicalInput = parse.data; // Use canonical (transformed) shape for prompts

    // Build chat payload for Ollama's /api/chat endpoint
    const createPayload = (model: string) =>
      ({
        model,
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
          { role: 'user', content: buildUserPrompt(canonicalInput) },
        ],
      }) as const;

    let responseText: string;
    let usedModel = this.modelConfig.model;

    try {
      // Try primary model first
      const payload = createPayload(this.modelConfig.model);
      responseText = await this.retry(async () => {
        const res = await this.postJson('/api/chat', payload);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = (errorData as any).error || '';

          // Check if it's a memory error
          if (errorMsg.includes('system memory') || errorMsg.includes('more memory')) {
            throw new Error('MEMORY_ERROR');
          }
          throw new ServiceUnavailableError(`Ollama chat failed with ${res.status}`);
        }
        const data = (await res.json()) as
          | { message?: { content?: string } }
          | { response?: string };
        const content = 'message' in data ? data.message?.content : data.response;
        if (typeof content !== 'string' || content.trim().length === 0) {
          throw new ServiceUnavailableError('Empty response from Ollama');
        }
        return content;
      });
    } catch (error) {
      // If primary model failed due to memory and we have a fallback, try it
      if (error instanceof Error && error.message === 'MEMORY_ERROR' && this.fallbackModel) {
        console.warn(
          `[OllamaClient] Primary model ${this.modelConfig.model} failed due to insufficient memory, trying fallback model ${this.fallbackModel}`
        );
        usedModel = this.fallbackModel;
        const fallbackPayload = createPayload(this.fallbackModel);

        responseText = await this.retry(async () => {
          const res = await this.postJson('/api/chat', fallbackPayload);
          if (!res.ok) {
            throw new ServiceUnavailableError(`Ollama fallback chat failed with ${res.status}`);
          }
          const data = (await res.json()) as
            | { message?: { content?: string } }
            | { response?: string };
          const content = 'message' in data ? data.message?.content : data.response;
          if (typeof content !== 'string' || content.trim().length === 0) {
            throw new ServiceUnavailableError('Empty response from Ollama fallback');
          }
          return content;
        });

        console.log(
          `[OllamaClient] Successfully generated questions using fallback model: ${this.fallbackModel}`
        );
      } else {
        // Re-throw if not a memory error or no fallback available
        throw error;
      }
    }

    // If first parse fails due to common trailing issues, attempt a stricter re-prompt once
    try {
      const jsonString = extractJson(responseText);
      let json: unknown;
      try {
        json = JSON.parse(jsonString);
      } catch {
        const repaired = repairJsonString(jsonString);
        json = JSON.parse(repaired);
      }

      // Log the parsed JSON for debugging
      console.log(
        '[OllamaClient] Parsed JSON structure:',
        JSON.stringify(json, null, 2).substring(0, 500)
      );

      const validated = dynamicQuestionSchema.safeParse(json);
      if (!validated.success) {
        console.error('[OllamaClient] Schema validation failed:', validated.error);
        console.error('[OllamaClient] Received JSON:', JSON.stringify(json, null, 2));
        throw new ValidationError('LLM JSON failed schema validation', validated.error);
      }
      return validated.data;
    } catch (e) {
      // Second attempt: ask the model to output ONLY valid JSON without commentary
      const strictPayload = {
        model: usedModel, // Use the same model (primary or fallback) that succeeded
        format: 'json',
        stream: false,
        options: {
          temperature: this.modelConfig.temperature,
          num_predict: this.modelConfig.maxTokens,
        },
        temperature: this.modelConfig.temperature,
        max_tokens: this.modelConfig.maxTokens,
        num_predict: this.modelConfig.maxTokens,
        messages: [
          {
            role: 'system',
            content: `${buildSystemPrompt()}\n\nReturn ONLY valid JSON. No commentary. No markdown fences.`,
          },
          {
            role: 'user',
            content: `${buildUserPrompt(canonicalInput)}\n\nIMPORTANT: Output only a JSON object. No extra text.`,
          },
        ],
      } as const;
      const res2 = await this.postJson('/api/chat', strictPayload);
      if (!res2.ok) {
        throw new ServiceUnavailableError(`Ollama strict chat failed with ${res2.status}`);
      }
      const data2 = (await res2.json()) as
        | { message?: { content?: string } }
        | { response?: string };
      const content2 = 'message' in data2 ? data2.message?.content : data2.response;
      if (typeof content2 !== 'string' || content2.trim().length === 0) {
        throw new ServiceUnavailableError('Empty response from Ollama (strict)');
      }
      responseText = content2;
      const jsonString2 = extractJson(responseText);
      let json2: unknown;
      try {
        json2 = JSON.parse(jsonString2);
      } catch {
        const repaired2 = repairJsonString(jsonString2);
        json2 = JSON.parse(repaired2);
      }

      // Log the parsed JSON for debugging
      console.log(
        '[OllamaClient] Strict retry parsed JSON:',
        JSON.stringify(json2, null, 2).substring(0, 500)
      );

      const validated2 = dynamicQuestionSchema.safeParse(json2);
      if (!validated2.success) {
        console.error('[OllamaClient] Strict schema validation failed:', validated2.error);
        console.error('[OllamaClient] Received JSON:', JSON.stringify(json2, null, 2));
        throw new ValidationError('LLM JSON failed schema validation (strict)', validated2.error);
      }
      return validated2.data;
    }

    // Unreachable
  }

  async generateBlueprint(systemContext: string, userPrompt: string): Promise<FullBlueprint> {
    const createPayload = (model: string) => ({
      model,
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
    });

    let responseText: string;

    try {
      // Try primary model first
      const payload = createPayload(this.modelConfig.model);
      responseText = await this.retry(async () => {
        const res = await this.postJson('/api/chat', payload);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = (errorData as any).error || '';

          // Check if it's a memory error
          if (errorMsg.includes('system memory') || errorMsg.includes('more memory')) {
            throw new Error('MEMORY_ERROR');
          }
          throw new ServiceUnavailableError(`Ollama chat failed with ${res.status}`);
        }
        const data = (await res.json()) as
          | { message?: { content?: string } }
          | { response?: string };
        const content = 'message' in data ? data.message?.content : data.response;
        if (typeof content !== 'string' || content.trim().length === 0) {
          throw new ServiceUnavailableError('Empty blueprint response from Ollama');
        }
        return content;
      });
    } catch (error) {
      // If primary model failed due to memory and we have a fallback, try it
      if (error instanceof Error && error.message === 'MEMORY_ERROR' && this.fallbackModel) {
        console.warn(
          `[OllamaClient] Primary model ${this.modelConfig.model} failed due to insufficient memory, trying fallback model ${this.fallbackModel} for blueprint generation`
        );
        const fallbackPayload = createPayload(this.fallbackModel);

        responseText = await this.retry(async () => {
          const res = await this.postJson('/api/chat', fallbackPayload);
          if (!res.ok) {
            throw new ServiceUnavailableError(`Ollama fallback chat failed with ${res.status}`);
          }
          const data = (await res.json()) as
            | { message?: { content?: string } }
            | { response?: string };
          const content = 'message' in data ? data.message?.content : data.response;
          if (typeof content !== 'string' || content.trim().length === 0) {
            throw new ServiceUnavailableError('Empty blueprint response from Ollama fallback');
          }
          return content;
        });

        console.log(
          `[OllamaClient] Successfully generated blueprint using fallback model: ${this.fallbackModel}`
        );
      } else {
        // Re-throw if not a memory error or no fallback available
        throw error;
      }
    }

    const jsonString = extractJson(responseText);
    let json: unknown;
    try {
      json = JSON.parse(jsonString);
    } catch (error: unknown) {
      throw new ValidationError('LLM returned invalid JSON for blueprint', error);
    }

    const validated = fullBlueprintSchema.safeParse(json);
    if (!validated.success) {
      throw new ValidationError('LLM Blueprint JSON failed schema validation', validated.error);
    }
    return validated.data;
  }

  public async streamBlueprint(
    systemContext: string,
    userPrompt: string
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
  const trimmed = text.trim();
  // Fallback: grab substring between first '{' and last '}'
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.substring(start, end + 1).trim();
  }
  return trimmed;
}

// Best-effort cleanup for JSON-like strings from LLMs
function repairJsonString(input: string): string {
  let s = input
    // Normalize Windows newlines
    .replace(/\r\n/g, '\n')
    // Remove single-line comments
    .replace(/^\s*\/\/.*$/gm, '')
    // Remove block comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Replace smart quotes with straight quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Remove trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1')
    // Remove stray backticks
    .replace(/`+/g, '')
    .trim();

  // If multiple JSON objects are concatenated, take the outermost
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    s = s.substring(start, end + 1);
  }

  return s;
}
