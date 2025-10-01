import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import path from 'path';
import { OllamaClient } from '@/lib/ollama/client';
import { answerAggregationService } from '@/lib/services/answerAggregation';
import { ValidationError, ServiceUnavailableError, TimeoutError } from '@/lib/ollama/errors';
import { Blueprint, AnyBlueprint } from '@/lib/ollama/schema';
import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';
import { markdownGeneratorService } from '@/lib/services/markdownGenerator';
import { blueprintFallbackService } from '@/lib/fallbacks/blueprintFallbacks';
import { createServerBlueprintService } from '@/lib/db/blueprints.server';
import { getSupabaseServerClient, getServerSession } from '@/lib/supabase/server';

// Define the request body schema for the API route
const RequestBodySchema = z.object({
  blueprintId: z.string().uuid().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const ollamaClient = new OllamaClient();

  // Check Ollama health before proceeding
  const isOllamaHealthy = await ollamaClient.health();
  if (!isOllamaHealthy) {
    const fallbackBlueprint = blueprintFallbackService.getFallbackBlueprint();
    const fallbackMarkdown = markdownGeneratorService.generateMarkdown(fallbackBlueprint);
    return NextResponse.json(
      {
        error: 'Ollama service is unavailable. Please ensure Ollama is running.',
        blueprint: fallbackBlueprint,
        markdown: fallbackMarkdown,
      },
      { status: 503 }
    );
  }

  let requestBody: z.infer<typeof RequestBodySchema>;
  // Support both POST body and GET query param `bid` for flexibility
  try {
    let body: unknown = null;
    if (req.method === 'GET') {
      // GET requests may not have a body; allow query param
      const url = new URL(req.url);
      const bid = url.searchParams.get('bid');
      const parsed = RequestBodySchema.safeParse(bid ? { blueprintId: bid } : {});
      if (!parsed.success) throw parsed.error;
      requestBody = parsed.data;
    } else {
      // For POST, invalid JSON should produce 400 (per tests)
      body = await req.json();
      const parsed = RequestBodySchema.safeParse(body ?? {});
      if (!parsed.success) throw parsed.error;
      requestBody = parsed.data;
    }
  } catch (error: unknown) {
    console.error('Request body validation failed:', error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Invalid request body', details: errorDetails },
      { status: 400 }
    );
  }

  const { session } = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    let staticResponses: Array<{ questionId: string; answer: unknown }> = [];
    let dynamicResponses: Array<{ questionId: string; answer: unknown }> = [];
    if (requestBody.blueprintId) {
      // Fetch static and dynamic answers for this blueprint on the server (authoritative)
      const supabase = await getSupabaseServerClient();
      const { data: blueprintRow, error: blueprintError } = await supabase
        .from('blueprint_generator')
        .select('id, user_id, static_answers, dynamic_answers')
        .eq('id', requestBody.blueprintId)
        .eq('user_id', userId)
        .single();

      if (blueprintError || !blueprintRow) {
        return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
      }

      const staticObj = (blueprintRow.static_answers || {}) as Record<string, unknown>;
      const dynamicObj = (blueprintRow.dynamic_answers || {}) as Record<string, unknown>;
      staticResponses = Object.entries(staticObj).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      dynamicResponses = Object.entries(dynamicObj).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
    } else {
      // Fallback: use client-side aggregation service (keeps tests compatible)
      const aggregated = await answerAggregationService.getAggregatedAnswers();
      staticResponses = aggregated.staticResponses;
      dynamicResponses = aggregated.dynamicResponses;
    }

    // Load the system prompt from the .taskmaster file
    const systemPromptPrimary = path.join(
      process.cwd(),
      '.taskmaster',
      'blueprint-generation-prompt.md'
    );
    const systemPromptSecondary = path.join(
      process.cwd(),
      '..',
      '.taskmaster',
      'blueprint-generation-prompt.md'
    );
    let systemPrompt = '';
    try {
      systemPrompt = await readFile(systemPromptPrimary, 'utf8');
    } catch {
      try {
        systemPrompt = await readFile(systemPromptSecondary, 'utf8');
      } catch {
        systemPrompt =
          'You are an AI assistant. Return JSON only matching the required blueprint schema.';
      }
    }

    // Build user prompt with static and dynamic answers; keep output contract JSON-only per prompt file
    let userPrompt =
      'Use the following answers to generate the JSON blueprint. Return JSON only.\n\n';
    userPrompt += 'Static Answers (key: value):\n';
    for (const { questionId, answer } of staticResponses) {
      userPrompt += `- ${questionId}: ${typeof answer === 'string' ? answer : JSON.stringify(answer)}\n`;
    }
    if (dynamicResponses.length > 0) {
      userPrompt += '\nDynamic Answers (key: value):\n';
      for (const { questionId, answer } of dynamicResponses) {
        userPrompt += `- ${questionId}: ${typeof answer === 'string' ? answer : JSON.stringify(answer)}\n`;
      }
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        let currentBlueprint: AnyBlueprint | null = null;
        let validationError: Error | null = null;
        let hadOllamaError = false;
        let isClosed = false;
        let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

        const sendEvent = (type: string, data: unknown): boolean => {
          if (isClosed) return false;
          try {
            controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
            return true;
          } catch (err) {
            // Stream controller likely already closed by client disconnect
            isClosed = true;
            try {
              // Cancel upstream reader to stop reading more chunks
              reader?.cancel().catch(() => {
                // Ignore cancellation errors
              });
            } catch {}
            return false;
          }
        };

        const safeClose = (): void => {
          if (isClosed) return;
          isClosed = true;
          try {
            controller.close();
          } catch {}
        };

        // Close stream if client disconnects
        try {
          req.signal.addEventListener('abort', () => {
            safeClose();
          });
        } catch {}

        try {
          const stream = await ollamaClient.streamBlueprint(systemPrompt, userPrompt);
          reader = stream.getReader();

          let done: boolean | undefined;
          let value: Uint8Array | undefined;
          while (!done) {
            ({ value, done } = await reader.read());
            if (done) {
              break;
            }

            const chunk = new TextDecoder().decode(value);
            // Ollama sends newline-delimited JSON objects
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
              try {
                const message = JSON.parse(line);
                if (message.done === false) {
                  const content = message.message?.content || message.response || '';
                  fullContent += content;
                  // Send progress update (e.g., partial content)
                  if (!sendEvent('progress', { partialBlueprint: fullContent })) {
                    return;
                  }
                } else if (message.done === true) {
                  // Stream is complete, attempt final validation
                  try {
                    currentBlueprint = parseAndValidateBlueprintJSON(fullContent);
                  } catch (e: unknown) {
                    validationError = e instanceof Error ? e : new Error(String(e));
                    console.error('Final blueprint validation failed during streaming:', e);
                  }
                }
              } catch {
                console.error('Error parsing Ollama stream chunk');
                if (!sendEvent('error', { message: 'Error parsing LLM response chunk' })) {
                  return;
                }
              }
            }
          }
        } catch (error: unknown) {
          hadOllamaError = true;
          console.error('Streaming blueprint generation failed:', error);
          const fallbackBlueprint = blueprintFallbackService.getFallbackBlueprint();
          const fallbackMarkdown = markdownGeneratorService.generateMarkdown(fallbackBlueprint);
          const errorMessage =
            error instanceof ValidationError ? error.message : 'Internal Server Error';
          // Try to persist fallback so the user can still view a result
          try {
            const serverBlueprintService = await createServerBlueprintService();
            const hasCompleted = requestBody.blueprintId
              ? await serverBlueprintService.hasCompletedGeneration(requestBody.blueprintId)
              : false;
            if (!hasCompleted) {
              const saved = await serverBlueprintService.saveBlueprint(
                userId,
                fallbackBlueprint as Blueprint,
                fallbackMarkdown,
                { staticResponses, dynamicResponses },
                requestBody.blueprintId
              );
              const savedFallbackId = saved.id as string;
              sendEvent('error', {
                message: errorMessage,
                details: error instanceof Error ? error.message : '',
                blueprint: fallbackBlueprint,
                markdown: fallbackMarkdown,
                savedBlueprintId: savedFallbackId,
              });
            }
          } catch (persistError) {
            console.error('Failed to save fallback blueprint:', persistError);
            sendEvent('error', {
              message: errorMessage,
              details: error instanceof Error ? error.message : '',
              blueprint: fallbackBlueprint,
              markdown: fallbackMarkdown,
            });
          }
          safeClose();
          return;
        }

        if (validationError) {
          const fallbackBlueprint = blueprintFallbackService.getFallbackBlueprint();
          const fallbackMarkdown = markdownGeneratorService.generateMarkdown(fallbackBlueprint);
          sendEvent('error', {
            message: 'Blueprint validation failed',
            details: validationError.message,
            blueprint: fallbackBlueprint,
            markdown: fallbackMarkdown,
          });
          safeClose();
          return;
        }

        if (currentBlueprint) {
          const markdown = markdownGeneratorService.generateMarkdown(currentBlueprint);
          // Save the blueprint to the database
          try {
            // Check if blueprint already has a completed generation
            const serverBlueprintService = await createServerBlueprintService();
            const hasCompleted = requestBody.blueprintId
              ? await serverBlueprintService.hasCompletedGeneration(requestBody.blueprintId)
              : false;
            if (hasCompleted) {
              sendEvent('warning', {
                message:
                  'Blueprint already has a completed generation. Skipping save to prevent duplicates.',
              });
              safeClose();
              return;
            }

            const savedBlueprint = await serverBlueprintService.saveBlueprint(
              userId,
              currentBlueprint,
              markdown,
              { staticResponses, dynamicResponses },
              requestBody.blueprintId
            );
            sendEvent('complete', {
              blueprint: currentBlueprint,
              markdown,
              savedBlueprintId: savedBlueprint.id,
            });
          } catch (dbError: unknown) {
            console.error('Error saving blueprint to database:', dbError);
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
            sendEvent('error', { message: 'Failed to save blueprint', details: errorMessage });
          }
        } else if (!hadOllamaError) {
          // Only provide a generic error if Ollama didn't already provide a fallback
          sendEvent('error', { message: 'Failed to generate a valid blueprint' });
        }
        safeClose();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Blueprint generation API route error:', error);
    const fallbackBlueprint = blueprintFallbackService.getFallbackBlueprint();
    const fallbackMarkdown = markdownGeneratorService.generateMarkdown(fallbackBlueprint);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: error.message,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 400 }
      );
    } else if (error instanceof TimeoutError) {
      return NextResponse.json(
        {
          error: 'Ollama Timeout',
          details: error.message,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 504 }
      );
    } else if (error instanceof ServiceUnavailableError) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          details: error.message,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 503 }
      );
    } else {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: errorMessage,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 500 }
      );
    }
  }
}

// Support GET requests for clients that call with a query param (?bid=...)
// Note: We stream SSE over POST and parse it on the client. No GET handler is exported.
