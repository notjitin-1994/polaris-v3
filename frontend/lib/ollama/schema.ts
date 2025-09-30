import { z } from 'zod';

// Question types supported by the dynamic questions system (new shape)
export const questionTypeSchema = z.enum([
  'text',
  'single_select',
  'multi_select',
  'slider',
  'calendar',
  'currency',
]);

const validationSchema = z.object({
  required: z.boolean().default(true),
  data_type: z.enum(['string', 'number', 'date', 'currency']).default('string'),
});

// New question shape (preferred)
const baseQuestionSchemaNew = z.object({
  id: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .pipe(z.string().min(1, 'id is required')),
  question_text: z.string().min(1, 'question_text is required'),
  input_type: questionTypeSchema,
  // Many models omit validation; tolerate absence
  validation: validationSchema.optional(),
});

const textQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('text'),
});

const singleSelectQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('single_select'),
  // Some outputs omit options; accept optional and empty
  options: z.array(z.string().min(1)).optional(),
});

const multiSelectQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('multi_select'),
  options: z.array(z.string().min(1)).optional(),
});

const sliderQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('slider'),
});

const calendarQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('calendar'),
});

const currencyQuestionSchemaNew = baseQuestionSchemaNew.extend({
  input_type: z.literal('currency'),
});

const dynamicQuestionSchemaNew = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().min(1, 'section title required'),
        // Some models omit description; make it optional
        description: z.string().optional(),
        questions: z
          .array(
            z.discriminatedUnion('input_type', [
              textQuestionSchemaNew,
              singleSelectQuestionSchemaNew,
              multiSelectQuestionSchemaNew,
              sliderQuestionSchemaNew,
              calendarQuestionSchemaNew,
              currencyQuestionSchemaNew,
            ])
          )
          .min(1, 'each section must have at least one question'),
      })
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

// Extremely tolerant schema for real-world LLM variations
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
                // Accept either new or legacy label keys
                question_text: z.string().optional(),
                question: z.string().optional(),
                // Accept either new or legacy type keys
                input_type: z.string().optional(),
                type: z.string().optional(),
                options: z.array(z.string()).optional(),
                validation: z.any().optional(),
                scaleMin: z.number().optional(),
                scaleMax: z.number().optional(),
              })
              .superRefine((val, ctx) => {
                // Enforce legacy scale bounds when present even in loose mode
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

export const dynamicQuestionSchema = z.union([
  dynamicQuestionSchemaNew,
  dynamicQuestionSchemaLegacy,
  dynamicQuestionSchemaLoose,
]);

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
      })
    )
    .min(1, 'At least one module is required'),
  timeline: z.record(z.string(), z.string()).optional(), // Assuming timeline is a map of string to string, e.g., "Week 1": "Introduction"
  resources: z
    .array(
      z.object({
        name: z.string().min(1, 'Resource name is required'),
        type: z.string().min(1, 'Resource type is required'),
        url: z.string().url('Resource URL must be a valid URL').optional(),
      })
    )
    .optional(),
});

export type Blueprint = z.infer<typeof blueprintSchema>;

// Extended blueprint schema matching the generation prompt (non-breaking: kept separate)
export const fullBlueprintSchema = z.object({
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
    .default([]),
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
        .default([]),
      cohort_model: z.string().min(1).optional(),
      accessibility_considerations: z.array(z.string()).optional(),
    })
    .optional(),
  content_outline: z
    .array(
      z.object({
        module: z.string().min(1),
        title: z.string().min(1),
        topics: z.array(z.string().min(1)).default([]),
        duration: z.string().min(1),
        delivery_method: z.string().min(1),
        prerequisites: z.array(z.string()).optional(),
      })
    )
    .default([]),
  resources: z
    .object({
      human: z
        .array(
          z.object({ role: z.string().min(1), name: z.string().min(1), fte: z.number().min(0) })
        )
        .optional(),
      tools: z.array(z.object({ category: z.string().min(1), name: z.string().min(1) })).optional(),
      budget: z
        .array(
          z.object({
            item: z.string().min(1),
            currency: z.string().min(1),
            amount: z.number().min(0),
          })
        )
        .optional(),
    })
    .optional(),
  assessment: z
    .object({
      kpis: z.array(z.object({ name: z.string().min(1), target: z.string().min(1) })).optional(),
      methods: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  timeline: z
    .object({
      phases: z
        .array(
          z.object({
            name: z.string().min(1),
            start: z.string().min(1),
            end: z.string().min(1),
            milestones: z
              .array(z.object({ name: z.string().min(1), date: z.string().min(1) }))
              .optional(),
          })
        )
        .default([]),
    })
    .optional(),
  implementation_roadmap: z
    .array(
      z.object({
        step: z.string().min(1),
        owner_role: z.string().min(1),
        dependencies: z.array(z.string()).optional(),
        risks: z.array(z.string()).optional(),
        mitigations: z.array(z.string()).optional(),
      })
    )
    .default([]),
  infographics: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        type: z.enum(['bar', 'line', 'pie', 'funnel', 'gantt', 'radar', 'heatmap']),
        library_hint: z.enum(['echarts', 'chartjs', 'vega', 'plotly']).optional(),
        data: z.object({
          labels: z.array(z.string()).default([]),
          datasets: z
            .array(
              z.object({
                label: z.string().min(1),
                data: z.array(z.number()),
                color: z.string().min(1),
              })
            )
            .default([]),
        }),
        description: z.string().min(1).optional(),
        accessibility: z
          .object({ alt_text: z.string().min(1), long_description: z.string().min(1).optional() })
          .optional(),
      })
    )
    .default([]),
  animations: z
    .array(
      z.object({
        id: z.string().min(1),
        target: z.string().min(1),
        type: z.enum(['lottie', 'countup', 'css', 'svg']),
        spec: z.object({
          lottie_url_or_json: z.string().min(1),
          duration_ms: z.number().min(0),
          easing: z.string().min(1),
          trigger: z.enum(['on_load', 'on_view', 'on_tab_change']),
          loop: z.boolean().default(false),
        }),
        accessibility: z
          .object({
            reduced_motion_alternative: z.string().min(1),
            respect_prefers_reduced_motion: z.boolean().default(true),
          })
          .optional(),
      })
    )
    .default([]),
  dashboard: z
    .object({
      layout: z.enum(['grid', 'tabs']),
      sections: z
        .array(
          z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            widgets: z
              .array(
                z.object({
                  type: z.enum(['kpi', 'chart', 'table', 'text']),
                  id: z.string().min(1),
                  title: z.string().min(1),
                  ref: z.string().optional(),
                  animation: z.string().optional(),
                })
              )
              .default([]),
          })
        )
        .default([]),
      theme: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional(),
  render_hints: z
    .object({
      markdown: z
        .object({
          include_sections: z.array(z.string()).optional(),
          tables: z
            .array(
              z.object({
                name: z.string().min(1),
                source_path: z.string().min(1),
                columns: z.array(z.string().min(1)),
              })
            )
            .optional(),
          callouts: z
            .array(z.object({ type: z.enum(['note', 'warning', 'tip']), text: z.string().min(1) }))
            .optional(),
        })
        .optional(),
      dashboard: z
        .object({
          primary_kpis: z.array(z.string().min(1)).optional(),
          landing_section: z.string().min(1).optional(),
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
