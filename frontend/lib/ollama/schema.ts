import { z } from 'zod';

// Question types supported by the dynamic questions system (new shape)
export const questionTypeSchema = z.enum(['text', 'single_select', 'multi_select', 'slider', 'calendar', 'currency']);

const validationSchema = z.object({
  required: z.boolean().default(true),
  data_type: z.enum(['string', 'number', 'date', 'currency']).default('string'),
});

// New question shape (preferred)
const baseQuestionSchemaNew = z.object({
  id: z.string().min(1, 'id is required'),
  question_text: z.string().min(1, 'question_text is required'),
  input_type: questionTypeSchema,
  validation: validationSchema,
});

const textQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('text'),
});

const singleSelectQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('single_select'),
  options: z.array(z.string().min(1)).min(1, 'single_select requires options'),
});

const multiSelectQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('multi_select'),
  options: z.array(z.string().min(1)).min(1, 'multi_select requires options'),
});

const sliderQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('slider'),
  validation: validationSchema.extend({
    data_type: z.literal('number'),
  }),
});

const calendarQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('calendar'),
  validation: validationSchema.extend({
    data_type: z.literal('date'),
  }),
});

const currencyQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('currency'),
  validation: validationSchema.extend({
    data_type: z.literal('currency'),
  }),
});

const dynamicQuestionSchemaNew = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().min(1, 'section title required'),
        description: z.string().min(1, 'section description required'),
        questions: z
          .array(
            z.discriminatedUnion('input_type', [
              textQuestionSchemaNew,
              singleSelectQuestionSchemaNew,
              multiSelectQuestionSchemaNew,
              sliderQuestionSchemaNew,
              calendarQuestionSchemaNew,
              currencyQuestionSchemaNew,
            ]),
          )
          .min(1, 'each section must have at least one question'),
      }),
    )
    .min(1, 'at least one section is required'),
});

// Legacy question shape (used by tests and prior API)
const legacyQuestionType = z.enum(['text', 'select', 'multiselect', 'scale', 'date', 'number']);

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
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'scale requires scaleMin and scaleMax' });
      } else if (val.scaleMin >= val.scaleMax) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'scaleMin must be less than scaleMax' });
      }
    }
  });

const dynamicQuestionSchemaLegacy = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        questions: z.array(legacyQuestionSchema).min(1),
      }),
    )
    .min(1),
});

export const dynamicQuestionSchema = z.union([dynamicQuestionSchemaNew, dynamicQuestionSchemaLegacy]);

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type DynamicQuestions = z.infer<typeof dynamicQuestionSchema>;

// Input context used to generate dynamic questions from the LLM
const generationInputSchemaNew = z.object({
  role: z.string().min(1),
  organization: z.string().min(1),
  learningGap: z.string().min(1),
  resources: z.string().min(1),
  constraints: z.string().min(1),
  numSections: z.number().int().min(1).max(6).default(5),
  questionsPerSection: z.number().int().min(1).max(10).default(7),
});

const generationInputSchemaLegacy = z.object({
  assessmentType: z.string().min(1),
  deliveryMethod: z.string().min(1),
  duration: z.string().min(1),
  learningObjectives: z.array(z.string().min(1)).min(1),
  targetAudience: z.string().min(1),
  numSections: z.number().int().min(1).max(6).optional(),
  questionsPerSection: z.number().int().min(1).max(10).optional(),
});

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

// Blueprint Schema based on task 7 details
export const blueprintSchema = z.object({
  title: z.string().min(1, 'Blueprint title is required'),
  overview: z.string().min(1, 'Blueprint overview is required'),
  learningObjectives: z
    .array(z.string().min(1))
    .min(1, 'At least one learning objective is required'),
  modules: z
    .array(
      z.object({
        title: z.string().min(1, 'Module title is required'),
        duration: z.number().int().min(0, 'Duration must be a non-negative number'),
        topics: z.array(z.string().min(1)).min(1, 'At least one topic is required'),
        activities: z.array(z.string().min(1)).min(1, 'At least one activity is required'),
        assessments: z.array(z.string().min(1)).min(1, 'At least one assessment is required'),
      }),
    )
    .min(1, 'At least one module is required'),
  timeline: z.record(z.string(), z.string()).optional(), // Assuming timeline is a map of string to string, e.g., "Week 1": "Introduction"
  resources: z
    .array(
      z.object({
        name: z.string().min(1, 'Resource name is required'),
        type: z.string().min(1, 'Resource type is required'),
        url: z.string().url('Resource URL must be a valid URL').optional(),
      }),
    )
    .optional(),
});

export type Blueprint = z.infer<typeof blueprintSchema>;
