import type { DynamicQuestions } from './schema';
import type { FormSchema, Section, Question } from '@/lib/dynamic-form/schema';

/**
 * Maps Ollama-generated dynamic questions to the dynamic form schema
 */
export function mapOllamaToFormSchema(ollamaQuestions: DynamicQuestions): FormSchema {
  const sections: Section[] = (ollamaQuestions as any).sections.map((section: any, sectionIndex: number) => ({
    id: `section-${sectionIndex + 1}`,
    title: section.title,
    description: section.description ?? '',
    questions: section.questions.map((question: any) => {
      // Support both legacy and new question shapes
      const isLegacy = typeof question.question === 'string' && typeof question.type === 'string';

      if (isLegacy) {
        const legacyType = question.type as string;
        const q: Question = {
          id: question.id,
          label: question.question,
          type: mapLegacyType(legacyType),
          required: Boolean(question.required),
          helpText: undefined,
          placeholder: undefined,
          validation: [
            {
              type: 'required',
              message: 'This field is required',
            },
          ],
          options:
            legacyType === 'select' || legacyType === 'multiselect'
              ? (question.options ?? []).map((option: string) => ({ value: option, label: option, disabled: false }))
              : undefined,
          scaleConfig:
            legacyType === 'scale'
              ? {
                  min: Number.isFinite(question.scaleMin) ? question.scaleMin : 1,
                  max: Number.isFinite(question.scaleMax) ? question.scaleMax : 10,
                  step: 1,
                }
              : undefined,
          metadata: {
            dataType: legacyType === 'number' ? 'number' : 'string',
          },
        };
        return q;
      }

      const q: Question = {
        id: question.id,
        label: question.question_text,
        type: mapInputType(question.input_type),
        required: question.validation?.required ?? true,
        helpText: undefined,
        placeholder: undefined,
        validation: [
          {
            type: 'required',
            message: 'This field is required',
          },
        ],
        options:
          question.input_type === 'single_select' || question.input_type === 'multi_select'
            ? (question.options ?? []).map((option: string) => ({ value: option, label: option, disabled: false }))
            : undefined,
        scaleConfig:
          question.input_type === 'slider'
            ? {
                min: 1,
                max: 10,
                step: 1,
              }
            : undefined,
        metadata: {
          dataType: question.validation?.data_type ?? 'string',
        },
      };

      return q;
    }),
    order: sectionIndex,
    isCollapsible: true,
    isRequired: true,
  }));

  return {
    id: 'dynamic-questionnaire',
    title: 'Dynamic Learning Questionnaire',
    description: 'Comprehensive questionnaire to gather insights for learning blueprint generation',
    sections,
    settings: {
      allowSaveProgress: true,
      autoSaveInterval: 2000,
      showProgress: true,
      allowSectionJump: true,
      submitButtonText: 'Submit Responses',
      saveButtonText: 'Save Progress',
      theme: 'auto',
    },
  };
}

/**
 * Maps Ollama input types to dynamic form input types
 */
function mapInputType(ollamaType: string): Question['type'] {
  switch (ollamaType) {
    case 'text':
      return 'text';
    case 'single_select':
      return 'select';
    case 'multi_select':
      return 'multiselect';
    case 'slider':
      return 'scale';
    case 'calendar':
      return 'date';
    case 'currency':
      return 'number';
    default:
      return 'text';
  }
}

function mapLegacyType(legacy: string): Question['type'] {
  switch (legacy) {
    case 'text':
      return 'text';
    case 'select':
      return 'select';
    case 'multiselect':
      return 'multiselect';
    case 'scale':
      return 'scale';
    case 'date':
      return 'date';
    case 'number':
      return 'number';
    default:
      return 'text';
  }
}

/**
 * Maps dynamic form responses back to Ollama format for blueprint generation
 */
export function mapFormResponsesToOllamaFormat(
  formResponses: Record<string, any>
): Record<string, any> {
  const mappedResponses: Record<string, any> = {};
  
  for (const [questionId, response] of Object.entries(formResponses)) {
    // Extract the actual question ID (remove section prefix if present)
    const cleanQuestionId = questionId.replace(/^section-\d+-/, '');
    
    // Map response based on type
    if (Array.isArray(response)) {
      // Multi-select responses
      mappedResponses[cleanQuestionId] = response.join(', ');
    } else if (typeof response === 'object' && response !== null) {
      // Complex responses (like scale with labels)
      mappedResponses[cleanQuestionId] = response.value || response;
    } else {
      // Simple responses
      mappedResponses[cleanQuestionId] = response;
    }
  }
  
  return mappedResponses;
}
