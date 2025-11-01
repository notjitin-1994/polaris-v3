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
import {
  getCachedBlueprint,
  getSimilarBlueprint,
  cacheBlueprint,
} from '@/lib/cache/blueprintCache';
import { performanceMonitor } from '@/lib/performance/performanceMonitor';
import {
  validateStaticAnswers,
  validateDynamicAnswers,
  validateBlueprintResponse,
  sanitizeForLLM
} from '@/lib/validation/dataIntegrity';
import {
  WorkflowTracer,
  logDataFlow,
  logLLMRequest,
  logLLMResponse,
  logValidation,
  logTransformation,
  logError as logDetailedError
} from '@/lib/logging/blueprintLogger';

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
    const endTimer = performanceMonitor.startTimer(
      'blueprint_generation',
      {
        blueprintId: context.blueprintId,
        userId: context.userId,
      },
      { type: 'api' }
    );

    // Initialize workflow tracer
    const tracer = new WorkflowTracer({
      blueprintId: context.blueprintId,
      userId: context.userId,
      organization: context.organization,
    });

    tracer.addStep('start', { industry: context.industry, role: context.role });

    // Log initial data
    logDataFlow('input', {
      staticAnswersSize: JSON.stringify(context.staticAnswers).length,
      dynamicAnswersSize: JSON.stringify(context.dynamicAnswers).length,
      objectivesCount: context.learningObjectives?.length || 0,
    }, { blueprintId: context.blueprintId });

    // Validate input data before proceeding
    tracer.addStep('validate-static');
    const staticValidation = validateStaticAnswers(context.staticAnswers);
    logValidation('static-answers', staticValidation.isValid, staticValidation.errors, staticValidation.warnings, {
      blueprintId: context.blueprintId,
    });
    if (!staticValidation.isValid) {
      logger.error('blueprint.generation.invalid_static_answers', 'Static answers validation failed', {
        blueprintId: context.blueprintId,
        errors: staticValidation.errors,
      });

      return {
        success: false,
        blueprint: null,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration: 0,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0,
        },
        error: `Invalid static answers: ${staticValidation.errors.join('; ')}`,
      };
    }

    tracer.addStep('validate-dynamic');
    const dynamicValidation = validateDynamicAnswers(context.dynamicAnswers);
    logValidation('dynamic-answers', dynamicValidation.isValid, dynamicValidation.errors, dynamicValidation.warnings, {
      blueprintId: context.blueprintId,
    });
    if (!dynamicValidation.isValid) {
      logger.error('blueprint.generation.invalid_dynamic_answers', 'Dynamic answers validation failed', {
        blueprintId: context.blueprintId,
        errors: dynamicValidation.errors,
      });

      return {
        success: false,
        blueprint: null,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration: 0,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0,
        },
        error: `Invalid dynamic answers: ${dynamicValidation.errors.join('; ')}`,
      };
    }

    // Sanitize data if needed
    tracer.addStep('sanitize-data');
    const beforeSize = JSON.stringify(context).length;
    const sanitizedContext = {
      ...context,
      staticAnswers: sanitizeForLLM(context.staticAnswers || {}),
      dynamicAnswers: sanitizeForLLM(context.dynamicAnswers || {}),
    };
    const afterSize = JSON.stringify(sanitizedContext).length;
    logTransformation('sanitize', beforeSize, afterSize, { blueprintId: context.blueprintId });

    // Check cache first for exact matches
    const staticAnswers = sanitizedContext.staticAnswers || {};
    const cachedBlueprint = await getCachedBlueprint(staticAnswers);

    if (cachedBlueprint) {
      const metric = endTimer();
      logger.info('blueprint.generation.cache_hit', 'Blueprint found in cache', {
        blueprintId: context.blueprintId,
        userId: context.userId,
        cacheHit: true,
        duration: metric.duration,
      });

      return {
        success: true,
        blueprint: cachedBlueprint,
        metadata: {
          model: 'claude-sonnet-4-5',
          duration: metric.duration,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0,
        },
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
        duration: metric.duration,
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
          attempts: 0,
        },
      };
    }

    const startTime = Date.now();

    logger.info('blueprint.generation.started', 'Blueprint generation started', {
      blueprintId: context.blueprintId,
      userId: context.userId,
      organization: context.organization,
      industry: context.industry,
      cacheHit: false,
    });

    // Build prompts once, reuse for all models
    const systemPrompt = BLUEPRINT_SYSTEM_PROMPT;
    const userPrompt = buildBlueprintPrompt(sanitizedContext);

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
          18000 // Increased max_tokens for Sonnet 4.5 to prevent truncation
        );

        const duration = Date.now() - startTime;

        // Cache the generated blueprint for future use
        try {
          await cacheBlueprint(staticAnswers, blueprint.data);
        } catch (cacheError) {
          logger.warn('blueprint.generation.cache_error', 'Failed to cache generated blueprint', {
            blueprintId: context.blueprintId,
            error: (cacheError as Error).message,
          });
        }

        const metric = endTimer();

        logger.info('blueprint.generation.success', 'Blueprint generation succeeded', {
          blueprintId: context.blueprintId,
          model: 'claude-sonnet-4-5',
          duration,
          attempts: 1,
          cached: true,
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
            20000 // Increased max_tokens for Sonnet 4 to prevent truncation
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
          logger.error(
            'blueprint.generation.claude_fallback_failed',
            'Claude Sonnet 4 fallback failed',
            {
              blueprintId: context.blueprintId,
              sonnet45Error: (sonnetError as Error).message,
              sonnet4Error: (sonnet4Error as Error).message,
            }
          );
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

    // Additional validation for blueprint completeness
    const blueprintValidation = validateBlueprintResponse(validated);
    if (!blueprintValidation.isValid) {
      logger.error('blueprint.generation.incomplete_response', 'Generated blueprint failed validation', {
        blueprintId: context.blueprintId,
        model,
        errors: blueprintValidation.errors,
        warnings: blueprintValidation.warnings,
      });

      // If critical sections are missing, throw error to trigger retry
      if (blueprintValidation.errors.some(e => e.includes('Missing required sections'))) {
        throw new Error(`Incomplete blueprint generated: ${blueprintValidation.errors.join('; ')}`);
      }
    }

    // Log warnings if any
    if (blueprintValidation.warnings.length > 0) {
      logger.warn('blueprint.generation.validation_warnings', 'Blueprint has validation warnings', {
        blueprintId: context.blueprintId,
        warnings: blueprintValidation.warnings,
      });
    }

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
