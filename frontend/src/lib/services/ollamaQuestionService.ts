/**
 * Ollama Question Generation Service (Fallback)
 * Wraps existing Ollama client for dynamic question generation fallback
 */

import { OllamaClient } from '@/lib/ollama/client';
import { GenerationInput, DynamicQuestions } from '@/lib/ollama/schema';
import { createServiceLogger } from '@/lib/logging';
import { Section } from '@/lib/dynamic-form/schema';
import { QuestionGenerationContext, PerplexityResponse } from './perplexityQuestionService';

const logger = createServiceLogger('ollama');

/**
 * Convert static answers to Ollama GenerationInput format
 */
function convertToOllamaInput(context: QuestionGenerationContext): GenerationInput {
  const { staticAnswers } = context;

  return {
    role: staticAnswers.role || 'Unknown',
    organization: staticAnswers.organization?.name || staticAnswers.organization || 'Unknown',
    learningGap:
      staticAnswers.learningGap?.description || staticAnswers.learningGap || 'Not specified',
    resources: staticAnswers.resources ? JSON.stringify(staticAnswers.resources) : 'Not specified',
    constraints: Array.isArray(staticAnswers.constraints)
      ? staticAnswers.constraints.join(', ')
      : staticAnswers.constraints || 'None',
    numSections: 5,
    questionsPerSection: 7,
  };
}

/**
 * Convert Ollama DynamicQuestions format to Perplexity response format
 */
function convertOllamaToPerplexityFormat(
  ollamaQuestions: DynamicQuestions,
  context: QuestionGenerationContext,
  duration: number
): PerplexityResponse {
  const sections: Section[] = ollamaQuestions.sections.map((section, index) => ({
    id: `s${index + 1}`,
    title: section.title,
    description: section.description || '',
    order: index + 1,
    questions: section.questions.map((q, qIndex) => ({
      id: `q${qIndex + 1}_s${index + 1}`,
      label: q.question_text,
      type: mapOllamaType(q.input_type),
      required: q.validation?.required ?? true,
      helpText: q.help_text,
      placeholder: q.placeholder,
      options: q.options?.map((opt, optIndex) => ({
        value: typeof opt === 'string' ? opt : `option_${optIndex + 1}`,
        label: typeof opt === 'string' ? opt : opt,
        disabled: false,
      })),
      scaleConfig:
        q.input_type === 'slider'
          ? {
              min: 1,
              max: 5,
              minLabel: 'Low',
              maxLabel: 'High',
              step: 1,
            }
          : undefined,
      metadata: {},
    })),
  }));

  return {
    sections,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: 'qwen3:30b-a3b',
      duration,
    },
  };
}

/**
 * Map Ollama input types to our standardized types
 * Handles both modern types (from updated prompts) and legacy types (for backward compatibility)
 */
function mapOllamaType(ollamaType: string): string {
  // Modern types (pass through as-is - these are already correct)
  const modernTypes = [
    'radio_pills',
    'radio_cards',
    'checkbox_pills',
    'checkbox_cards',
    'toggle_switch',
    'scale',
    'enhanced_scale',
    'labeled_slider',
    'text',
    'textarea',
    'currency',
    'number_spinner',
    'number',
    'date',
    'email',
    'url',
  ];

  // If it's already a modern type, return it as-is
  if (modernTypes.includes(ollamaType)) {
    return ollamaType;
  }

  // Legacy type mapping (for backward compatibility with old prompts)
  const legacyTypeMap: Record<string, string> = {
    single_select: 'radio_pills',
    multi_select: 'checkbox_pills',
    slider: 'scale',
    calendar_date: 'date',
    calendar_range: 'date',
    calendar: 'date',
    boolean: 'toggle_switch',
  };

  const mapped = legacyTypeMap[ollamaType] || 'text';

  if (!legacyTypeMap[ollamaType] && !modernTypes.includes(ollamaType)) {
    logger.warn('dynamic_questions.input_type.unknown', 'Unknown Ollama input type', {
      originalType: ollamaType,
      mappedType: mapped,
    });
  }

  return mapped;
}

/**
 * Generate dynamic questions using Ollama fallback
 */
export async function generateWithOllama(
  context: QuestionGenerationContext,
  reason: string = 'Fallback activated'
): Promise<PerplexityResponse> {
  const startTime = Date.now();

  logger.info('ollama.fallback.activated', 'Ollama fallback triggered', {
    blueprintId: context.blueprintId,
    userId: context.userId,
    reason,
  });

  try {
    const ollamaClient = new OllamaClient({
      model: 'qwen3:30b-a3b',
      fallbackModel: 'qwen3:14b',
      temperature: 0.2,
      maxTokens: 16384, // Increased for 10 sections (50-70 questions)
    });

    // Check Ollama health
    const isHealthy = await ollamaClient.health();
    if (!isHealthy) {
      logger.error('ollama.fallback.failure', 'Ollama service is not available', {
        blueprintId: context.blueprintId,
      });
      throw new Error('Ollama service is unavailable');
    }

    logger.info('ollama.request', 'Sending request to Ollama', {
      blueprintId: context.blueprintId,
      model: 'qwen3:30b-a3b',
    });

    const ollamaInput = convertToOllamaInput(context);
    const ollamaQuestions = await ollamaClient.generateQuestions(ollamaInput);

    const duration = Date.now() - startTime;

    logger.info('ollama.success', 'Ollama successfully generated questions', {
      blueprintId: context.blueprintId,
      sectionCount: ollamaQuestions.sections.length,
      questionCount: ollamaQuestions.sections.reduce((sum, s) => sum + s.questions.length, 0),
      duration,
    });

    const result = convertOllamaToPerplexityFormat(ollamaQuestions, context, duration);

    logger.info('ollama.fallback.success', 'Ollama fallback completed successfully', {
      blueprintId: context.blueprintId,
      sectionCount: result.sections.length,
      questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Check for memory error
    if (error instanceof Error && error.message.includes('memory')) {
      logger.error('ollama.memory_error', 'Ollama out of memory', {
        blueprintId: context.blueprintId,
        error: error.message,
        duration,
      });
    } else {
      logger.error('ollama.fallback.failure', 'Ollama fallback failed', {
        blueprintId: context.blueprintId,
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
    }

    throw error;
  }
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const ollamaClient = new OllamaClient();
    return await ollamaClient.health();
  } catch {
    return false;
  }
}
