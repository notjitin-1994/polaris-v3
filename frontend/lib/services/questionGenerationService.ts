/**
 * Question Generation Orchestrator
 * Coordinates between Claude (primary) and Ollama (fallback) for dynamic question generation
 */

import { createServiceLogger } from '@/lib/logging';
import {
  generateWithClaude,
  validateClaudeConfig,
  QuestionGenerationContext,
  ClaudeResponse,
} from './claudeQuestionService';
import { generateWithOllama, isOllamaAvailable } from './ollamaQuestionService';

const logger = createServiceLogger('dynamic-questions');

export interface GenerationResult {
  success: boolean;
  sections: ClaudeResponse['sections'];
  metadata: ClaudeResponse['metadata'] & {
    source: 'claude' | 'ollama';
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
  error?: string;
}

/**
 * Generate dynamic questions with automatic Claude → Ollama fallback
 */
export async function generateDynamicQuestions(
  context: QuestionGenerationContext
): Promise<GenerationResult> {
  const overallStartTime = Date.now();

  logger.info('dynamic_questions.generation.start', 'Starting dynamic question generation', {
    blueprintId: context.blueprintId,
    userId: context.userId,
  });

  // Try Claude first
  const claudeConfig = validateClaudeConfig();

  if (claudeConfig.valid) {
    try {
      const result = await generateWithClaude(context);

      const totalDuration = Date.now() - overallStartTime;

      logger.info(
        'dynamic_questions.generation.complete',
        'Successfully generated questions with Claude',
        {
          blueprintId: context.blueprintId,
          source: 'claude',
          sectionCount: result.sections.length,
          questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
          duration: totalDuration,
          fallbackUsed: false,
        }
      );

      return {
        success: true,
        sections: result.sections,
        metadata: {
          ...result.metadata,
          source: 'claude',
          fallbackUsed: false,
          duration: totalDuration,
        },
      };
    } catch (claudeError) {
      const claudeErrorMessage =
        claudeError instanceof Error ? claudeError.message : String(claudeError);

      logger.warn(
        'dynamic_questions.generation.error',
        'Claude failed, attempting Ollama fallback',
        {
          blueprintId: context.blueprintId,
          error: claudeErrorMessage,
          fallbackActivated: true,
        }
      );

      // Continue to fallback
      return await runFallback(context, claudeErrorMessage, overallStartTime);
    }
  } else {
    logger.warn(
      'dynamic_questions.generation.error',
      'Claude not configured, using Ollama fallback',
      {
        blueprintId: context.blueprintId,
        errors: claudeConfig.errors,
        fallbackActivated: true,
      }
    );

    return await runFallback(
      context,
      `Claude not configured: ${claudeConfig.errors.join(', ')}`,
      overallStartTime
    );
  }
}

/**
 * Use Ollama fallback when Claude fails
 */
async function runFallback(
  context: QuestionGenerationContext,
  reason: string,
  overallStartTime: number
): Promise<GenerationResult> {
  // Check Ollama availability
  const ollamaHealthy = await isOllamaAvailable();

  if (!ollamaHealthy) {
    const totalDuration = Date.now() - overallStartTime;

    logger.error('dynamic_questions.generation.error', 'Both Claude and Ollama failed', {
      blueprintId: context.blueprintId,
      claudeReason: reason,
      ollamaAvailable: false,
      duration: totalDuration,
    });

    return {
      success: false,
      sections: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'none',
        source: 'ollama',
        fallbackUsed: true,
        fallbackReason: 'Both services unavailable',
        duration: totalDuration,
      },
      error: `Question generation failed. Claude: ${reason}. Ollama: Service unavailable.`,
    };
  }

  try {
    const result = await generateWithOllama(context, reason);
    const totalDuration = Date.now() - overallStartTime;

    logger.info(
      'dynamic_questions.generation.complete',
      'Successfully generated questions with Ollama fallback',
      {
        blueprintId: context.blueprintId,
        source: 'ollama',
        sectionCount: result.sections.length,
        questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
        duration: totalDuration,
        fallbackUsed: true,
        fallbackReason: reason,
      }
    );

    return {
      success: true,
      sections: result.sections,
      metadata: {
        ...result.metadata,
        source: 'ollama',
        fallbackUsed: true,
        fallbackReason: reason,
        duration: totalDuration,
      },
    };
  } catch (ollamaError) {
    const totalDuration = Date.now() - overallStartTime;
    const ollamaErrorMessage =
      ollamaError instanceof Error ? ollamaError.message : String(ollamaError);

    logger.error('dynamic_questions.generation.error', 'Both Claude and Ollama failed', {
      blueprintId: context.blueprintId,
      claudeError: reason,
      ollamaError: ollamaErrorMessage,
      duration: totalDuration,
    });

    return {
      success: false,
      sections: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'none',
        source: 'ollama',
        fallbackUsed: true,
        fallbackReason: reason,
        duration: totalDuration,
      },
      error: `Question generation failed. Claude: ${reason}. Ollama: ${ollamaErrorMessage}`,
    };
  }
}

/**
 * Validate generation configuration
 */
export function validateGenerationConfig(): {
  claude: { valid: boolean; errors: string[] };
  ollama: { available: boolean };
} {
  return {
    claude: validateClaudeConfig(),
    ollama: { available: true }, // Always true, checked at runtime
  };
}
