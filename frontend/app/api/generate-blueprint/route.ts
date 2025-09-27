import { NextResponse } from 'next/server';
import { z } from 'zod';
import { OllamaClient } from '@/lib/ollama/client';
import { answerAggregationService } from '@/lib/services/answerAggregation';
import { generateSystemPrompt, generateUserPrompt } from '@/lib/prompts/blueprintTemplates';
import { ValidationError, ServiceUnavailableError, TimeoutError } from '@/lib/ollama/errors';
import { Blueprint } from '@/lib/ollama/schema';
import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';
import { markdownGeneratorService } from '@/lib/services/markdownGenerator';
import { blueprintFallbackService } from '@/lib/fallbacks/blueprintFallbacks';
import { blueprintService } from '@/lib/db/blueprints';
import { getSession } from '@/lib/auth/sessionManager';

// Define the request body schema for the API route
const RequestBodySchema = z.object({
  blueprintId: z.string().optional(), // If updating an existing blueprint
  // Add any other direct inputs if necessary, though most will come from aggregated answers
});

export async function POST(req: Request) {
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
      { status: 503 },
    );
  }

  let requestBody: z.infer<typeof RequestBodySchema>;
  try {
    requestBody = RequestBodySchema.parse(await req.json());
  } catch (error: unknown) {
    console.error('Request body validation failed:', error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Invalid request body', details: errorDetails },
      { status: 400 },
    );
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Aggregate static and dynamic answers
    const aggregatedAnswers = await answerAggregationService.getAggregatedAnswers();

    // Generate prompts using the aggregated answers
    const systemPrompt = generateSystemPrompt(
      'You are assisting in generating a learning blueprint.',
    );
    const userPrompt = generateUserPrompt(aggregatedAnswers);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        let currentBlueprint: Blueprint | null = null;
        let validationError: Error | null = null;
        let hadOllamaError = false;

        try {
          const stream = await ollamaClient.streamBlueprint(systemPrompt, userPrompt);
          const reader = stream.getReader();

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
                  controller.enqueue(
                    encoder.encode(
                      `event: progress\ndata: ${JSON.stringify({ partialBlueprint: fullContent })}\n\n`,
                    ),
                  );
                } else if (message.done === true) {
                  // Stream is complete, attempt final validation
                  try {
                    currentBlueprint = parseAndValidateBlueprintJSON(fullContent);
                  } catch (e) {
                    validationError = e;
                    console.error('Final blueprint validation failed during streaming:', e);
                  }
                }
              } catch (parseError) {
                console.error('Error parsing Ollama stream chunk:', parseError);
                controller.enqueue(
                  encoder.encode(
                    `event: error\ndata: ${JSON.stringify({ message: 'Error parsing LLM response chunk' })}\n\n`,
                  ),
                );
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
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: errorMessage,
                details: error instanceof Error ? error.message : '',
                blueprint: fallbackBlueprint,
                markdown: fallbackMarkdown,
              })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        if (validationError) {
          const fallbackBlueprint = blueprintFallbackService.getFallbackBlueprint();
          const fallbackMarkdown = markdownGeneratorService.generateMarkdown(fallbackBlueprint);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: 'Blueprint validation failed',
                details: validationError.message,
                blueprint: fallbackBlueprint,
                markdown: fallbackMarkdown,
              })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        if (currentBlueprint) {
          const markdown = markdownGeneratorService.generateMarkdown(currentBlueprint);
          // Save the blueprint to the database
          try {
            // Check if blueprint already has a completed generation
            if (requestBody.blueprintId) {
              const hasCompleted = await blueprintService.hasCompletedGeneration(requestBody.blueprintId);
              if (hasCompleted) {
                controller.enqueue(
                  encoder.encode(
                    `event: warning\ndata: ${JSON.stringify({ message: 'Blueprint already has a completed generation. Skipping save to prevent duplicates.' })}\n\n`,
                  ),
                );
                controller.close();
                return;
              }
            }

            const savedBlueprint = await blueprintService.saveBlueprint(
              userId,
              currentBlueprint,
              markdown,
              aggregatedAnswers,
              requestBody.blueprintId,
            );
            controller.enqueue(
              encoder.encode(
                `event: complete\ndata: ${JSON.stringify({ blueprint: currentBlueprint, markdown, savedBlueprintId: savedBlueprint.id })}\n\n`,
              ),
            );
          } catch (dbError: unknown) {
            console.error('Error saving blueprint to database:', dbError);
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ message: 'Failed to save blueprint', details: errorMessage })}\n\n`,
              ),
            );
          }
        } else if (!hadOllamaError) {
          // Only provide a generic error if Ollama didn't already provide a fallback
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: 'Failed to generate a valid blueprint' })}\n\n`,
            ),
          );
        }
        controller.close();
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
        { status: 400 },
      );
    } else if (error instanceof TimeoutError) {
      return NextResponse.json(
        {
          error: 'Ollama Timeout',
          details: error.message,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 504 },
      );
    } else if (error instanceof ServiceUnavailableError) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          details: error.message,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 503 },
      );
    } else {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          details: errorMessage,
          blueprint: fallbackBlueprint,
          markdown: fallbackMarkdown,
        },
        { status: 500 },
      );
    }
  }
}
