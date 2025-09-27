import { z } from 'zod';

// Enhanced question types for dynamic form system
export const inputTypeSchema = z.enum([
  'text',
  'select',
  'multiselect',
  'scale',
  'textarea',
  'number',
  'date',
  'email',
  'url',
]);

// Validation rule schema for dynamic validation
export const validationRuleSchema = z.object({
  type: z.enum([
    'required',
    'minLength',
    'maxLength',
    'pattern',
    'min',
    'max',
    'email',
    'url',
    'custom',
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
  customValidator: z.string().optional(), // Function name for custom validation
});

// Base question schema with enhanced features
const baseQuestionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  label: z.string().min(1, 'Question label is required'),
  type: inputTypeSchema,
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  validation: z.array(validationRuleSchema).optional(),
  conditional: z
    .object({
      field: z.string(),
      operator: z.enum([
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'greaterThan',
        'lessThan',
      ]),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
    .optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().default(false),
      }),
    )
    .optional(),
  scaleConfig: z
    .object({
      min: z.number().int().min(0).default(1),
      max: z.number().int().min(1).default(5),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
      step: z.number().int().min(1).default(1),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// Specific question type schemas
export const textQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('text'),
  maxLength: z.number().int().min(1).optional(),
});

export const textareaQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('textarea'),
  rows: z.number().int().min(1).max(20).default(3),
  maxLength: z.number().int().min(1).optional(),
});

export const selectQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('select'),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().default(false),
      }),
    )
    .min(1, 'Select questions require options'),
  allowClear: z.boolean().default(false),
});

export const multiselectQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('multiselect'),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().default(false),
      }),
    )
    .min(1, 'Multiselect questions require options'),
  maxSelections: z.number().int().min(1).optional(),
});

export const scaleQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('scale'),
  scaleConfig: z
    .object({
      min: z.number().int().min(0).default(1),
      max: z.number().int().min(1).default(5),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
      step: z.number().int().min(1).default(1),
    })
    .refine((config) => config.min < config.max, {
      message: 'Scale minimum must be less than maximum',
    }),
});

export const numberQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  precision: z.number().int().min(0).max(10).optional(),
});

export const dateQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('date'),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

export const emailQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('email'),
});

export const urlQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('url'),
});

// Union of all question types
export const questionSchema = z.discriminatedUnion('type', [
  textQuestionSchema,
  textareaQuestionSchema,
  selectQuestionSchema,
  multiselectQuestionSchema,
  scaleQuestionSchema,
  numberQuestionSchema,
  dateQuestionSchema,
  emailQuestionSchema,
  urlQuestionSchema,
]);

// Section schema
export const sectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  title: z.string().min(1, 'Section title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'Each section must have at least one question'),
  order: z.number().int().min(0).optional(),
  isCollapsible: z.boolean().default(true),
  isRequired: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

// Form schema
export const formSchema = z.object({
  id: z.string().min(1, 'Form ID is required'),
  title: z.string().min(1, 'Form title is required'),
  description: z.string().optional(),
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
  settings: z
    .object({
      allowSaveProgress: z.boolean().default(true),
      autoSaveInterval: z.number().int().min(1000).default(2000), // milliseconds
      showProgress: z.boolean().default(true),
      allowSectionJump: z.boolean().default(true),
      submitButtonText: z.string().default('Submit'),
      saveButtonText: z.string().default('Save Progress'),
      theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// Form state schema for persistence
export const formStateSchema = z.object({
  formId: z.string(),
  currentSection: z.string().optional(),
  answers: z.record(z.any()),
  progress: z.object({
    completedSections: z.array(z.string()),
    overallProgress: z.number().min(0).max(100),
  }),
  lastSaved: z.string().datetime().optional(),
  version: z.string().default('1.0.0'),
});

// Validation result schema
export const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(
    z.object({
      fieldId: z.string(),
      message: z.string(),
      type: z.string(),
    }),
  ),
  warnings: z
    .array(
      z.object({
        fieldId: z.string(),
        message: z.string(),
        type: z.string(),
      }),
    )
    .optional(),
});

// Export types
export type InputType = z.infer<typeof inputTypeSchema>;
export type ValidationRule = z.infer<typeof validationRuleSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type FormSchema = z.infer<typeof formSchema>;
export type FormState = z.infer<typeof formStateSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;

// Specific question types
export type TextQuestion = z.infer<typeof textQuestionSchema>;
export type TextareaQuestion = z.infer<typeof textareaQuestionSchema>;
export type SelectQuestion = z.infer<typeof selectQuestionSchema>;
export type MultiselectQuestion = z.infer<typeof multiselectQuestionSchema>;
export type ScaleQuestion = z.infer<typeof scaleQuestionSchema>;
export type NumberQuestion = z.infer<typeof numberQuestionSchema>;
export type DateQuestion = z.infer<typeof dateQuestionSchema>;
export type EmailQuestion = z.infer<typeof emailQuestionSchema>;
export type UrlQuestion = z.infer<typeof urlQuestionSchema>;

// Type guards
export const isTextQuestion = (question: Question): question is TextQuestion =>
  question.type === 'text';
export const isTextareaQuestion = (question: Question): question is TextareaQuestion =>
  question.type === 'textarea';
export const isSelectQuestion = (question: Question): question is SelectQuestion =>
  question.type === 'select';
export const isMultiselectQuestion = (question: Question): question is MultiselectQuestion =>
  question.type === 'multiselect';
export const isScaleQuestion = (question: Question): question is ScaleQuestion =>
  question.type === 'scale';
export const isNumberQuestion = (question: Question): question is NumberQuestion =>
  question.type === 'number';
export const isDateQuestion = (question: Question): question is DateQuestion =>
  question.type === 'date';
export const isEmailQuestion = (question: Question): question is EmailQuestion =>
  question.type === 'email';
export const isUrlQuestion = (question: Question): question is UrlQuestion =>
  question.type === 'url';

// Utility functions
export const createEmptyFormState = (formId: string): FormState => ({
  formId,
  answers: {},
  progress: {
    completedSections: [],
    overallProgress: 0,
  },
  version: '1.0.0',
});

export const validateFormSchema = (
  data: unknown,
): { success: boolean; data?: FormSchema; error?: string } => {
  try {
    const result = formSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};
