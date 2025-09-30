import { z } from 'zod';

// Canonical static questionnaire fields aligned with dynamic-questions-prompt.md
export const staticQuestionsSchema = z.object({
  role: z
    .string({ required_error: 'Role is required' })
    .min(2, 'Please provide at least 2 characters'),
  organization: z
    .string({ required_error: 'Organization is required' })
    .min(2, 'Please provide at least 2 characters'),
  learningGap: z
    .string({ required_error: 'Identified learning gap is required' })
    .min(10, 'Please provide at least 10 characters'),
  resources: z
    .string({ required_error: 'Resources & Budgets are required' })
    .min(3, 'Please provide at least 3 characters'),
  constraints: z.array(z.string()).min(1, 'Please select at least one constraint'),
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
    key: 'role',
    label: 'Role',
    description: 'Your role relevant to this learning initiative',
    fields: ['role'],
  },
  {
    key: 'organization',
    label: 'Organization',
    description: 'Organization or team context',
    fields: ['organization'],
  },
  {
    key: 'learningGap',
    label: 'Identified Learning Gap',
    description: 'What skills or knowledge gaps are you addressing?',
    fields: ['learningGap'],
  },
  {
    key: 'resources',
    label: 'Resources & Budgets',
    description: 'Available resources, tools, and budget',
    fields: ['resources'],
  },
  {
    key: 'constraints',
    label: 'Constraints',
    description: 'Timeline, delivery, or organizational constraints',
    fields: ['constraints'],
  },
];

export const defaultValues: StaticQuestionsFormValues = {
  role: '',
  organization: '',
  learningGap: '',
  resources: '',
  constraints: [],
};
