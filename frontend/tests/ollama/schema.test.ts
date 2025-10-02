import { describe, it, expect } from 'vitest';
import { dynamicQuestionSchema, generationInputSchema } from '@/lib/ollama/schema';

describe('generationInputSchema', () => {
  it('validates minimal valid input', () => {
    const input = {
      assessmentType: 'Quiz',
      deliveryMethod: 'Online',
      duration: '30m',
      learningObjectives: ['Objective 1'],
      targetAudience: 'Developers',
    };
    const res = generationInputSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it('rejects invalid input', () => {
    const res = generationInputSchema.safeParse({});
    expect(res.success).toBe(false);
  });
});

describe('dynamicQuestionSchema', () => {
  it('accepts valid schema', () => {
    const valid = {
      sections: [
        {
          title: 'Section 1',
          questions: [
            { id: 'q1', question: 'Text?', type: 'text', required: true },
            {
              id: 'q2',
              question: 'Choose one',
              type: 'select',
              options: ['A', 'B'],
              required: true,
            },
            {
              id: 'q3',
              question: 'Choose many',
              type: 'multiselect',
              options: ['A', 'B'],
              required: false,
            },
            { id: 'q4', question: 'Rate', type: 'scale', required: true, scaleMin: 1, scaleMax: 5 },
          ],
        },
      ],
    };
    const res = dynamicQuestionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid scale bounds', () => {
    const invalid = {
      sections: [
        {
          title: 'Section 1',
          questions: [
            { id: 'q4', question: 'Rate', type: 'scale', required: true, scaleMin: 5, scaleMax: 1 },
          ],
        },
      ],
    };
    const res = dynamicQuestionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
