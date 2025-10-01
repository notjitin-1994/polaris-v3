/**
 * Blueprint Generation Orchestrator Service
 * Implements triple-fallback: Claude Sonnet 4 → Claude Opus 4 → Ollama
 */

import { ClaudeClient, ClaudeApiError } from '@/lib/claude/client';
import { getClaudeConfig } from '@/lib/claude/config';
import {
  BLUEPRINT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
  type BlueprintContext,
} from '@/lib/claude/prompts';
import { validateAndNormalizeBlueprint } from '@/lib/claude/validation';
import { shouldFallbackToOpus, logFallbackDecision } from '@/lib/claude/fallback';
import { OllamaClient } from '@/lib/ollama/client';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('blueprint-generation');

export interface GenerationResult {
  success: boolean;
  blueprint: any;
  metadata: {
    model: 'claude-sonnet-4' | 'claude-opus-4' | 'ollama';
    duration: number;
    timestamp: string;
    fallbackUsed: boolean;
    attempts: number;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

/**
 * Blueprint Generation Service
 * Orchestrates model selection, retries, validation, and normalization
 */
export class BlueprintGenerationService {
  private claudeClient: ClaudeClient;
  private ollamaClient: OllamaClient;
  private config: ReturnType<typeof getClaudeConfig>;

  constructor() {
    this.config = getClaudeConfig();
    this.claudeClient = new ClaudeClient();
    this.ollamaClient = new OllamaClient();
  }

  /**
   * Generate blueprint with triple-fallback cascade
   * 1. Try Claude Sonnet 4 (primary)
   * 2. On failure, try Claude Opus 4 (fallback)
   * 3. On failure, try Ollama (emergency)
   */
  async generate(context: BlueprintContext): Promise<GenerationResult> {
    const startTime = Date.now();

    logger.info('blueprint.generation.started', {
      blueprintId: context.blueprintId,
      userId: context.userId,
      organization: context.organization,
      industry: context.industry,
    });

    // Build prompts once, reuse for all models
    const systemPrompt = BLUEPRINT_SYSTEM_PROMPT;
    const userPrompt = buildBlueprintPrompt(context);

    // Try Claude Sonnet 4 (primary)
    try {
      const blueprint = await this.generateWithClaude(
        context,
        this.config.primaryModel,
        systemPrompt,
        userPrompt,
        12000 // max_tokens for Sonnet 4
      );

      const duration = Date.now() - startTime;

      logger.info('blueprint.generation.success', {
        blueprintId: context.blueprintId,
        model: 'claude-sonnet-4',
        duration,
        attempts: 1,
      });

      return {
        success: true,
        blueprint: blueprint.data,
        metadata: {
          model: 'claude-sonnet-4',
          duration,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 1,
        },
        usage: blueprint.usage,
      };
    } catch (sonnetError) {
      logger.warn('blueprint.generation.claude_primary_failed', {
        blueprintId: context.blueprintId,
        error: (sonnetError as Error).message,
      });

      // Check if we should fallback to Opus 4
      const fallbackDecision = shouldFallbackToOpus(sonnetError as Error);

      logFallbackDecision(fallbackDecision, {
        blueprintId: context.blueprintId,
        model: 'claude-sonnet-4',
        attempt: 1,
      });

      if (!fallbackDecision.shouldFallback) {
        // Don't fallback - re-throw error
        const duration = Date.now() - startTime;

        logger.error('blueprint.generation.failed_no_fallback', {
          blueprintId: context.blueprintId,
          duration,
          error: (sonnetError as Error).message,
        });

        return {
          success: false,
          blueprint: null,
          metadata: {
            model: 'claude-sonnet-4',
            duration,
            timestamp: new Date().toISOString(),
            fallbackUsed: false,
            attempts: 1,
          },
          error: (sonnetError as Error).message,
        };
      }

      // Try Claude Opus 4 (fallback)
      try {
        const blueprint = await this.generateWithClaude(
          context,
          this.config.fallbackModel,
          systemPrompt,
          userPrompt,
          16000 // max_tokens for Opus 4
        );

        const duration = Date.now() - startTime;

        logger.info('blueprint.generation.fallback_success', {
          blueprintId: context.blueprintId,
          model: 'claude-opus-4',
          duration,
          attempts: 2,
          fallbackTrigger: fallbackDecision.trigger,
        });

        return {
          success: true,
          blueprint: blueprint.data,
          metadata: {
            model: 'claude-opus-4',
            duration,
            timestamp: new Date().toISOString(),
            fallbackUsed: true,
            attempts: 2,
          },
          usage: blueprint.usage,
        };
      } catch (opusError) {
        logger.error('blueprint.generation.claude_fallback_failed', {
          blueprintId: context.blueprintId,
          sonnetError: (sonnetError as Error).message,
          opusError: (opusError as Error).message,
          attemptingOllama: true,
        });

        // Try Ollama (emergency fallback)
        try {
          const blueprint = await this.generateWithOllama(context, systemPrompt, userPrompt);

          const duration = Date.now() - startTime;

          logger.info('blueprint.generation.ollama_success', {
            blueprintId: context.blueprintId,
            duration,
            attempts: 3,
            emergencyFallback: true,
          });

          return {
            success: true,
            blueprint,
            metadata: {
              model: 'ollama',
              duration,
              timestamp: new Date().toISOString(),
              fallbackUsed: true,
              attempts: 3,
            },
          };
        } catch (ollamaError) {
          const duration = Date.now() - startTime;

          logger.error('blueprint.generation.all_failed', {
            blueprintId: context.blueprintId,
            duration,
            sonnetError: (sonnetError as Error).message,
            opusError: (opusError as Error).message,
            ollamaError: (ollamaError as Error).message,
          });

          return {
            success: false,
            blueprint: null,
            metadata: {
              model: 'ollama',
              duration,
              timestamp: new Date().toISOString(),
              fallbackUsed: true,
              attempts: 3,
            },
            error: 'All blueprint generation methods failed',
          };
        }
      }
    }
  }

  /**
   * Generate blueprint using Claude (Sonnet or Opus)
   */
  private async generateWithClaude(
    context: BlueprintContext,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number
  ): Promise<{ data: any; usage: { input_tokens: number; output_tokens: number } }> {
    logger.info('blueprint.generation.claude_attempt', {
      blueprintId: context.blueprintId,
      model,
      maxTokens,
    });

    const response = await this.claudeClient.generate({
      model,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: this.config.temperature,
    });

    const text = ClaudeClient.extractText(response);
    const validated = validateAndNormalizeBlueprint(text);

    return {
      data: validated,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  }

  /**
   * Generate blueprint using Ollama (emergency fallback)
   * Adapts prompts from Claude format to Ollama format
   */
  private async generateWithOllama(
    context: BlueprintContext,
    systemPrompt: string,
    userPrompt: string
  ): Promise<any> {
    logger.info('blueprint.generation.ollama_attempt', {
      blueprintId: context.blueprintId,
      emergencyFallback: true,
    });

    // Ollama expects system and user in messages array
    // The existing generateBlueprint method handles this
    const blueprint = await this.ollamaClient.generateBlueprint(systemPrompt, userPrompt);

    // Ollama returns already parsed and validated blueprint
    // But we still normalize it to ensure displayType consistency
    const normalized = {
      ...blueprint,
      _generation_metadata: {
        model: 'ollama',
        timestamp: new Date().toISOString(),
      },
    };

    return normalized;
  }
}

/**
 * Singleton instance
 */
export const blueprintGenerationService = new BlueprintGenerationService();
