import { z } from 'zod';

export const deliveryMethods = ['online', 'hybrid', 'in-person'] as const;

export const staticQuestionsSchema = z.object({
  learningObjective: z
    .string({ required_error: 'Learning objective is required' })
    .min(10, 'Please provide at least 10 characters'),
  targetAudience: z
    .string({ required_error: 'Target audience is required' })
    .min(5, 'Please provide at least 5 characters'),
  deliveryMethod: z.enum(deliveryMethods, {
    required_error: 'Please select a delivery method',
  }),
  duration: z.coerce
    .number({ invalid_type_error: 'Duration must be a number' })
    .int('Duration must be an integer number of hours')
    .min(1, 'Duration must be at least 1 hour'),
  assessmentType: z
    .string({ required_error: 'Assessment type is required' })
    .min(3, 'Please provide at least 3 characters'),
});

export type StaticQuestionsFormValues = z.infer<typeof staticQuestionsSchema>;

export type StepKey = keyof StaticQuestionsFormValues;

export type WizardStepConfig = {
  key: StepKey;
  label: string;
  description?: string;
  fields: StepKey[];
};

export const wizardSteps: WizardStepConfig[] = [
  {
    key: 'learningObjective',
    label: 'Learning Objective',
    description: 'Describe what the learner should achieve',
    fields: ['learningObjective'],
  },
  {
    key: 'targetAudience',
    label: 'Target Audience',
    description: 'Describe who this is intended for',
    fields: ['targetAudience'],
  },
  {
    key: 'deliveryMethod',
    label: 'Delivery Method',
    description: 'Choose how the content will be delivered',
    fields: ['deliveryMethod'],
  },
  {
    key: 'duration',
    label: 'Duration',
    description: 'How many hours will this take?',
    fields: ['duration'],
  },
  {
    key: 'assessmentType',
    label: 'Assessment Type',
    description: 'How will learning be assessed?',
    fields: ['assessmentType'],
  },
];

export const defaultValues: StaticQuestionsFormValues = {
  learningObjective: '',
  targetAudience: '',
  deliveryMethod: 'online',
  duration: 1,
  assessmentType: '',
};
