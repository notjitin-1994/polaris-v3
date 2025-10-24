/**
 * Ollama Schema Module (Refactored)
 *
 * This module provides backward-compatible schemas for Ollama question and blueprint generation.
 * Now uses centralized schemas from lib/schemas with compatibility layers for legacy formats.
 *
 * @module lib/ollama/schema
 */

import { z } from 'zod';
import {
  // Import centralized schemas
  questionTypeSchema as centralQuestionTypeSchema,
  questionSchema as _centralQuestionSchema,
  dynamicQuestionSchema as _centralDynamicQuestionSchema,
  optionSchema as _centralOptionSchema,
  scaleConfigSchema as _centralScaleConfigSchema,
  blueprintSchema as centralBlueprintSchema,
  fullBlueprintSchema as centralFullBlueprintSchema,
  blueprintModuleSchema as _centralBlueprintModuleSchema,
  blueprintResourceSchema as _centralBlueprintResourceSchema,

  // Import types
  type QuestionType as CentralQuestionType,
  type Question as CentralQuestion,
  type Blueprint as CentralBlueprint,
} from '@/lib/schemas';

/**
 * Re-export question type schema for backward compatibility
 */
export const questionTypeSchema = centralQuestionTypeSchema;
export type QuestionType = CentralQuestionType;

/**
 * Validation schema for Ollama (simplified version)
 */
const validationSchema = z.object({
  required: z.boolean().default(true),
  data_type: z.enum(['string', 'number', 'date', 'currency', 'boolean', 'array']).default('string'),
});

/**
 * Option schema that accepts both simple strings and rich objects
 * (Backward compatible with existing Ollama format)
 */
const optionSchema = z.union([
  z.string(), // Simple string option (backward compatible)
  z.object({
    value: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    description: z.string().optional(),
    disabled: z.boolean().optional(),
  }),
]);

/**
 * Scale configuration schema for Ollama
 * Uses snake_case to match Ollama conventions
 */
const scaleConfigSchema = z
  .object({
    min: z.number().default(1),
    max: z.number().default(5),
    min_label: z.string().optional(),
    max_label: z.string().optional(),
    labels: z.array(z.string()).optional(), // Emojis for each step
    step: z.number().default(1),
  })
  .optional();

/**
 * Slider configuration schema
 */
const sliderConfigSchema = z
  .object({
    min: z.number().default(0),
    max: z.number().default(100),
    step: z.number().default(1),
    unit: z.string().optional(), // e.g., "hours/week", "%"
    markers: z.array(z.number()).optional(),
  })
  .optional();

/**
 * Number input configuration schema
 */
const numberConfigSchema = z
  .object({
    min: z.number().default(0),
    max: z.number().default(999),
    step: z.number().default(1),
  })
  .optional();

/**
 * New question shape (preferred) - matches Ollama's snake_case conventions
 */
const baseQuestionSchemaNew = z.object({
  id: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .pipe(z.string().min(1, 'id is required')),
  question_text: z.string().min(1, 'question_text is required'),
  input_type: questionTypeSchema,
  validation: validationSchema.optional(),
  options: z.array(optionSchema).optional(),
  max_selections: z.number().int().min(1).optional(), // For checkbox types
  scale_config: scaleConfigSchema,
  slider_config: sliderConfigSchema,
  number_config: numberConfigSchema,
  currency_symbol: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * Dynamic questions schema for new format
 */
const dynamicQuestionSchemaNew = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().min(1, 'section title required'),
        description: z.string().optional(),
        questions: z
          .array(baseQuestionSchemaNew)
          .min(1, 'each section must have at least one question'),
      })
    )
    .min(1, 'at least one section is required'),
});

/**
 * Legacy question type for backward compatibility
 */
const legacyQuestionType = z.enum(['text', 'select', 'multiselect', 'scale', 'date', 'number']);

/**
 * Legacy question schema
 */
const legacyQuestionSchema = z
  .object({
    id: z.string().min(1),
    question: z.string().min(1),
    type: legacyQuestionType,
    required: z.boolean(),
    options: z.array(z.string().min(1)).optional(),
    scaleMin: z.number().int().optional(),
    scaleMax: z.number().int().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'scale') {
      if (typeof val.scaleMin !== 'number' || typeof val.scaleMax !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'scale requires scaleMin and scaleMax',
        });
      } else if (val.scaleMin >= val.scaleMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'scaleMin must be less than scaleMax',
        });
      }
    }
  });

/**
 * Legacy dynamic questions schema
 */
const dynamicQuestionSchemaLegacy = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        questions: z.array(legacyQuestionSchema).min(1),
      })
    )
    .min(1),
});

/**
 * Extremely tolerant schema for real-world LLM variations
 */
const dynamicQuestionSchemaLoose = z.object({
  sections: z
    .array(
      z.object({
        title: z
          .union([z.string(), z.number()])
          .transform((v) => String(v))
          .optional(),
        description: z.string().optional(),
        questions: z
          .array(
            z
              .object({
                id: z.union([z.string(), z.number()]).transform((v) => String(v)),
                question_text: z.string().optional(),
                question: z.string().optional(),
                input_type: z.string().optional(),
                type: z.string().optional(),
                options: z.array(z.string()).optional(),
                validation: z.any().optional(),
                scaleMin: z.number().optional(),
                scaleMax: z.number().optional(),
              })
              .superRefine((val, ctx) => {
                if (val.type === 'scale') {
                  if (typeof val.scaleMin === 'number' && typeof val.scaleMax === 'number') {
                    if (val.scaleMin >= val.scaleMax) {
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'scaleMin must be less than scaleMax',
                      });
                    }
                  }
                }
              })
          )
          .min(1),
      })
    )
    .min(1),
});

/**
 * Union of all supported dynamic question formats
 * Tries new format first, then legacy, then loose
 */
export const dynamicQuestionSchema = z.union([
  dynamicQuestionSchemaNew,
  dynamicQuestionSchemaLegacy,
  dynamicQuestionSchemaLoose,
]);

export type DynamicQuestions = z.infer<typeof dynamicQuestionSchema>;

/**
 * Generation input schema (new format)
 */
const generationInputSchemaNew = z.object({
  role: z.string().min(1),
  organization: z.string().min(1),
  learningGap: z.string().min(1),
  resources: z.string().min(1),
  constraints: z.string().min(1),
  numSections: z.number().int().min(1).max(12).default(10),
  questionsPerSection: z.number().int().min(1).max(10).default(7),
});

/**
 * Generation input schema (legacy format)
 */
const generationInputSchemaLegacy = z.object({
  assessmentType: z.string().min(1),
  deliveryMethod: z.string().min(1),
  duration: z.string().min(1),
  learningObjectives: z.array(z.string().min(1)).min(1),
  targetAudience: z.string().min(1),
  numSections: z.number().int().min(1).max(6).optional(),
  questionsPerSection: z.number().int().min(1).max(10).optional(),
});

/**
 * Generation input schema with backward compatibility transformation
 */
export const generationInputSchema = z
  .union([generationInputSchemaNew, generationInputSchemaLegacy])
  .transform((input) => {
    if ('role' in input) {
      return input;
    }
    // Map legacy fields into the new canonical shape
    return {
      role: 'Learning Professional',
      organization: input.targetAudience,
      learningGap: Array.isArray(input.learningObjectives)
        ? input.learningObjectives.join(', ')
        : String(input.learningObjectives),
      resources: input.deliveryMethod,
      constraints: `${input.assessmentType} • ${input.duration}`,
      numSections: input.numSections ?? 5,
      questionsPerSection: input.questionsPerSection ?? 7,
    } as const;
  });

export type GenerationInput = z.infer<typeof generationInputSchema>;

/**
 * Blueprint schema - re-exported from centralized schemas
 * This ensures consistency across the application
 */
export const blueprintSchema = centralBlueprintSchema;
export type Blueprint = CentralBlueprint;

/**
 * Extended blueprint schema with additional metadata
 * Merges Ollama-specific fields with centralized schema
 */
export const fullBlueprintSchema = centralFullBlueprintSchema.extend({
  metadata: z
    .object({
      organization: z.string().min(1),
      role: z.string().min(1),
      generated_at: z.string().min(1),
      version: z.string().min(1),
    })
    .optional(),
  objectives: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        metric: z.string().min(1),
        baseline: z.union([z.string(), z.number()]),
        target: z.union([z.string(), z.number()]),
        due_date: z.string().min(1),
      })
    )
    .optional(),
  instructional_strategy: z
    .object({
      modalities: z
        .array(
          z.object({
            type: z.string().min(1),
            rationale: z.string().min(1),
            allocation_percent: z.number().min(0).max(100).default(0),
          })
        )
        .optional(),
      cohort_model: z.string().min(1).optional(),
      accessibility_considerations: z.array(z.string()).optional(),
    })
    .optional(),
  content_outline: z
    .array(
      z.object({
        module: z.string().min(1),
        title: z.string().min(1),
        topics: z.array(z.string().min(1)).optional(),
        duration: z.string().min(1),
        delivery_method: z.string().min(1),
        prerequisites: z.array(z.string()).optional(),
      })
    )
    .optional(),
  resources: z
    .object({
      human: z
        .array(
          z.object({
            role: z.string().min(1),
            name: z.string().min(1),
            fte: z.number().min(0),
          })
        )
        .optional(),
      tools: z.array(z.object({ category: z.string().min(1), name: z.string().min(1) })).optional(),
      budget: z
        .object({
          total: z.number().min(0),
          breakdown: z.record(z.string(), z.number()).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type FullBlueprint = z.infer<typeof fullBlueprintSchema>;

// Union type and type guards for downstream consumers during migration
export type AnyBlueprint = FullBlueprint | Blueprint;

export function isFullBlueprint(value: unknown): value is FullBlueprint {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    'instructional_strategy' in obj ||
    'content_outline' in obj ||
    'implementation_roadmap' in obj ||
    'dashboard' in obj
  );
}

export function isCanonicalBlueprint(value: unknown): value is Blueprint {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return 'title' in obj && 'overview' in obj && 'modules' in obj;
}

/**
 * Blueprint generation input schema
 */
export const blueprintGenerationInputSchema = z.object({
  role: z.string().min(1),
  organization: z.string().min(1),
  learningGap: z.string().min(1),
  resources: z.string().min(1),
  timeline: z.string().min(1),
  constraints: z.string().optional(),
});

export type BlueprintGenerationInput = z.infer<typeof blueprintGenerationInputSchema>;

/**
 * Utility function to convert Ollama question to centralized format
 */
export function ollamaQuestionToCentral(
  ollamaQuestion: z.infer<typeof baseQuestionSchemaNew>
): CentralQuestion {
  return {
    id: ollamaQuestion.id,
    type: ollamaQuestion.input_type,
    question: ollamaQuestion.question_text,
    required: ollamaQuestion.validation?.required,
    options: ollamaQuestion.options?.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    ),
    scaleConfig: ollamaQuestion.scale_config
      ? {
          min: ollamaQuestion.scale_config.min,
          max: ollamaQuestion.scale_config.max,
          minLabel: ollamaQuestion.scale_config.min_label,
          maxLabel: ollamaQuestion.scale_config.max_label,
          labels: ollamaQuestion.scale_config.labels,
          step: ollamaQuestion.scale_config.step,
        }
      : undefined,
  };
}

/**
 * Utility function to convert centralized question to Ollama format
 */
export function centralQuestionToOllama(
  centralQuestion: CentralQuestion
): z.infer<typeof baseQuestionSchemaNew> {
  return {
    id: centralQuestion.id,
    question_text: centralQuestion.question,
    input_type: centralQuestion.type,
    validation: centralQuestion.required ? { required: true, data_type: 'string' } : undefined,
    options: centralQuestion.options?.map((opt) => opt.label || opt.value),
    scale_config: centralQuestion.scaleConfig
      ? {
          min: centralQuestion.scaleConfig.min,
          max: centralQuestion.scaleConfig.max,
          step: centralQuestion.scaleConfig.step ?? 1,
          min_label: centralQuestion.scaleConfig.minLabel,
          max_label: centralQuestion.scaleConfig.maxLabel,
          labels: centralQuestion.scaleConfig.labels,
        }
      : undefined,
  };
}
