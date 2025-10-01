import { NextResponse } from 'next/server';
import { OllamaClient } from '@/lib/ollama/client';
import { generationInputSchema, type GenerationInput } from '@/lib/ollama/schema';
import { MemoryCache, createCacheKey } from '@/lib/cache/memoryCache';
import { SimpleQueue } from '@/lib/queue/simpleQueue';
import { ValidationError, TimeoutError, ServiceUnavailableError } from '@/lib/ollama/errors';

const cache = new MemoryCache<unknown>(15 * 60 * 1000);
const queue = new SimpleQueue(3);
const client = new OllamaClient();
const inFlight = new Map<string, Promise<unknown>>();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = generationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input: GenerationInput = parsed.data;
  const cacheKey = createCacheKey(input);
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    let promise = inFlight.get(cacheKey);
    if (!promise) {
      promise = queue.add(() => client.generateQuestions(input));
      inFlight.set(cacheKey, promise);
    }
    const result = await promise;
    inFlight.delete(cacheKey);
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof TimeoutError) {
      return NextResponse.json({ error: 'Generation timed out' }, { status: 504 });
    }
    if (error instanceof ServiceUnavailableError) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
