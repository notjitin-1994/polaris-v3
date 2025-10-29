/**
 * Blueprint Generation Orchestrator Service
 * Implements dual-fallback: Claude Sonnet 4.5 → Claude Sonnet 4
 */

import { ClaudeClient } from '@/lib/claude/client';
import { getClaudeConfig } from '@/lib/claude/config';
import {
  BLUEPRINT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
  type BlueprintContext,
} from '@/lib/claude/prompts';
import { validateAndNormalizeBlueprint } from '@/lib/claude/validation';
import { shouldFallbackToSonnet4, logFallbackDecision } from '@/lib/claude/fallback';
import { createServiceLogger } from '@/lib/logging';
import { getCachedBlueprint, getSimilarBlueprint, cacheBlueprint } from '@/lib/cache/blueprintCache';
import { performanceMonitor } from '@/lib/performance/performanceMonitor';

const logger = createServiceLogger('blueprint-generation');

export interface GenerationResult {
  success: boolean;
  blueprint: any;
  metadata: {
    model: 'claude-sonnet-4-5' | 'claude-sonnet-4';
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
  private config: ReturnType<typeof getClaudeConfig>;

  constructor() {
    this.config = getClaudeConfig();
    this.claudeClient = new ClaudeClient();
  }

  /**
   * Generate blueprint with dual-fallback cascade
   * 1. Try Claude Sonnet 4.5 (primary) - if API key available
   * 2. On failure or missing key, try Claude Sonnet 4 (fallback) - if API key available
   */
  async generate(context: BlueprintContext): Promise<GenerationResult> {
    const endTimer = performanceMonitor.startTimer('blueprint_generation', {
      blueprintId: context.blueprintId,
      userId: context.userId
    }, { type: 'api' });

    // Check cache first for exact matches
    const staticAnswers = context.staticAnswers || {};
    const cachedBlueprint = await getCachedBlueprint(staticAnswers);

    if (cachedBlueprint) {
      const metric = endTimer();
      logger.info('blueprint.generation.cache_hit', 'Blueprint found in cache', {
        blueprintId: context.blueprintId,
        userId: context.userId,
        cacheHit: true,
        duration: metric.duration
      });

      return {
        success: true,
        blueprint: cachedBlueprint,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration: metric.duration,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0
        }
      };
    }

    // Check for similar blueprints
    const similarBlueprint = await getSimilarBlueprint(staticAnswers);

    if (similarBlueprint) {
      const metric = endTimer();
      logger.info('blueprint.generation.similar_cache_hit', 'Similar blueprint found in cache', {
        blueprintId: context.blueprintId,
        userId: context.userId,
        cacheHit: true,
        similar: true,
        duration: metric.duration
      });

      // Cache the similar blueprint for this exact questionnaire too
      await cacheBlueprint(staticAnswers, similarBlueprint);

      return {
        success: true,
        blueprint: similarBlueprint,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration: metric.duration,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0
        }
      };
    }

    const startTime = Date.now();

    logger.info('blueprint.generation.started', 'Blueprint generation started', {
      blueprintId: context.blueprintId,
      userId: context.userId,
      organization: context.organization,
      industry: context.industry,
      cacheHit: false
    });

    // Build prompts once, reuse for all models
    const systemPrompt = BLUEPRINT_SYSTEM_PROMPT;
    const userPrompt = buildBlueprintPrompt(context);

    // Check if Claude API key is available
    const hasClaudeKey = this.config.apiKey && this.config.apiKey.trim().length > 0;

    if (hasClaudeKey) {
      // Try Claude Sonnet 4.5 (primary)
      try {
        const blueprint = await this.generateWithClaude(
          context,
          this.config.primaryModel,
          systemPrompt,
          userPrompt,
          12000 // max_tokens for Sonnet 4.5
        );

        const duration = Date.now() - startTime;

        // Cache the generated blueprint for future use
        try {
          await cacheBlueprint(staticAnswers, blueprint.data);
        } catch (cacheError) {
          logger.warn('blueprint.generation.cache_error', 'Failed to cache generated blueprint', {
            blueprintId: context.blueprintId,
            error: (cacheError as Error).message
          });
        }

        const metric = endTimer();

        logger.info('blueprint.generation.success', 'Blueprint generation succeeded', {
          blueprintId: context.blueprintId,
          model: 'claude-sonnet-4-5',
          duration,
          attempts: 1,
          cached: true
        });

        return {
          success: true,
          blueprint: blueprint.data,
          metadata: {
            model: 'claude-sonnet-4-5',
            duration: metric.duration,
            timestamp: new Date().toISOString(),
            fallbackUsed: false,
            attempts: 1,
          },
          usage: blueprint.usage,
        };
      } catch (sonnetError) {
        logger.warn('blueprint.generation.claude_primary_failed', 'Claude primary failed', {
          blueprintId: context.blueprintId,
          error: (sonnetError as Error).message,
        });

        // Check if we should fallback to Sonnet 4
        const fallbackDecision = shouldFallbackToSonnet4(sonnetError as Error);

        logFallbackDecision(fallbackDecision, {
          blueprintId: context.blueprintId,
          model: 'claude-sonnet-4-5',
          attempt: 1,
        });

        if (!fallbackDecision.shouldFallback) {
          // Don't fallback - return error
          const duration = Date.now() - startTime;

          logger.error(
            'blueprint.generation.failed_no_fallback',
            'Generation failed without fallback',
            {
              blueprintId: context.blueprintId,
              duration,
              error: (sonnetError as Error).message,
            }
          );

          return {
            success: false,
            blueprint: null,
            metadata: {
              model: 'claude-sonnet-4-5',
              duration,
              timestamp: new Date().toISOString(),
              fallbackUsed: false,
              attempts: 1,
            },
            error: (sonnetError as Error).message,
          };
        }

        // Try Claude Sonnet 4 (fallback)
        try {
          const blueprint = await this.generateWithClaude(
            context,
            this.config.fallbackModel,
            systemPrompt,
            userPrompt,
            16000 // max_tokens for Sonnet 4
          );

          const duration = Date.now() - startTime;

          logger.info('blueprint.generation.fallback_success', 'Claude fallback succeeded', {
            blueprintId: context.blueprintId,
            model: 'claude-sonnet-4',
            duration,
            attempts: 2,
            fallbackTrigger: fallbackDecision.trigger,
          });

          return {
            success: true,
            blueprint: blueprint.data,
            metadata: {
              model: 'claude-sonnet-4',
              duration,
              timestamp: new Date().toISOString(),
              fallbackUsed: true,
              attempts: 2,
            },
            usage: blueprint.usage,
          };
        } catch (sonnet4Error) {
          logger.error('blueprint.generation.claude_fallback_failed', 'Claude Sonnet 4 fallback failed', {
            blueprintId: context.blueprintId,
            sonnet45Error: (sonnetError as Error).message,
            sonnet4Error: (sonnet4Error as Error).message,
          });
        }
      }
    } else {
      const duration = Date.now() - startTime;

      logger.error('blueprint.generation.claude_unavailable', 'Claude API key not available', {
        blueprintId: context.blueprintId,
        duration,
      });

      return {
        success: false,
        blueprint: null,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0,
        },
        error: 'Claude API key not available. Please configure ANTHROPIC_API_KEY.',
      };
    }

    // If we reach here, all Claude attempts failed
    const duration = Date.now() - startTime;

    logger.error('blueprint.generation.all_failed', 'All Claude generation methods failed', {
      blueprintId: context.blueprintId,
      duration,
    });

    return {
      success: false,
      blueprint: null,
      metadata: {
        model: 'claude-sonnet-4',
        duration,
        timestamp: new Date().toISOString(),
        fallbackUsed: true,
        attempts: hasClaudeKey ? 2 : 0,
      },
      error: 'All Claude generation methods failed. Please check your API configuration.',
    };
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
    logger.info('blueprint.generation.claude_attempt', 'Attempting Claude generation', {
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
}

/**
 * Singleton instance
 */
export const blueprintGenerationService = new BlueprintGenerationService();
