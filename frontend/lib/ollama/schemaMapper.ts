import type { DynamicQuestions } from './schema';
import type { FormSchema, Section, Question } from '@/lib/dynamic-form/schema';

// Default semantic section titles used when padding to 5 sections
const DEFAULT_SECTION_TITLES: string[] = [
  'Learning Objectives & Outcomes',
  'Learner Profile & Audience Context',
  'Resources, Tools, & Support Systems',
  'Timeline, Constraints, & Delivery Conditions',
  'Evaluation, Success Metrics & Long-Term Impact',
];

/**
 * Maps Ollama-generated dynamic questions to the dynamic form schema
 */
export function mapOllamaToFormSchema(ollamaQuestions: DynamicQuestions): FormSchema {
  const sections: Section[] = (ollamaQuestions as any).sections.map(
    (section: any, sectionIndex: number) => ({
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
                ? (question.options ?? []).map((option: string) => ({
                    value: option,
                    label: option,
                    disabled: false,
                  }))
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

        const mappedType = mapInputType(question.input_type);
        
        // Build base question
        const q: any = {
          id: question.id,
          label: question.question_text,
          type: mappedType,
          required: question.validation?.required ?? true,
          helpText: undefined,
          placeholder: undefined,
          validation: [
            {
              type: 'required',
              message: 'This field is required',
            },
          ],
          metadata: {
            dataType: question.validation?.data_type ?? 'string',
          },
        };

        // Handle options for selection types
        const hasOptions = question.options && Array.isArray(question.options);
        if (hasOptions && (
          mappedType === 'select' ||
          mappedType === 'multiselect' ||
          mappedType === 'radio_pills' ||
          mappedType === 'radio_cards' ||
          mappedType === 'checkbox_pills' ||
          mappedType === 'checkbox_cards' ||
          mappedType === 'toggle_switch'
        )) {
          q.options = question.options.map((option: any) => {
            if (typeof option === 'string') {
              return { value: option.toLowerCase().replace(/\s+/g, '_'), label: option, disabled: false };
            }
            return {
              value: option.value || option.label?.toLowerCase().replace(/\s+/g, '_') || '',
              label: option.label || option.value || '',
              description: option.description,
              icon: option.icon,
              disabled: option.disabled || false,
            };
          });
        }

        // Handle max_selections for multi-select types
        if (question.max_selections && (mappedType === 'checkbox_pills' || mappedType === 'checkbox_cards')) {
          q.maxSelections = question.max_selections;
        }

        // Handle scale configuration
        if (question.scale_config && mappedType === 'enhanced_scale') {
          q.scaleConfig = {
            min: question.scale_config.min ?? 1,
            max: question.scale_config.max ?? 5,
            minLabel: question.scale_config.min_label,
            maxLabel: question.scale_config.max_label,
            labels: question.scale_config.labels,
            step: question.scale_config.step ?? 1,
          };
        } else if (question.input_type === 'slider' && mappedType === 'scale') {
          q.scaleConfig = {
            min: 1,
            max: 10,
            step: 1,
          };
        }

        // Handle slider configuration
        if (question.slider_config && mappedType === 'labeled_slider') {
          q.sliderConfig = {
            min: question.slider_config.min ?? 0,
            max: question.slider_config.max ?? 100,
            step: question.slider_config.step ?? 1,
            unit: question.slider_config.unit,
            markers: question.slider_config.markers,
          };
        }

        // Handle number spinner configuration
        if (question.number_config && mappedType === 'number_spinner') {
          q.numberConfig = {
            min: question.number_config.min ?? 0,
            max: question.number_config.max ?? 999,
            step: question.number_config.step ?? 1,
          };
        }

        // Handle currency configuration
        if (mappedType === 'currency') {
          q.currencySymbol = question.currency_symbol || '$';
          q.min = question.min;
          q.max = question.max;
        }

        return q as Question;
      }),
      order: sectionIndex,
      isCollapsible: true,
      isRequired: true,
    })
  );

  // Guarantee exactly 5 sections by trimming or padding with placeholders
  const MAX_SECTIONS = 5;
  const normalizedSections = sections.slice(0, MAX_SECTIONS);
  if (normalizedSections.length < MAX_SECTIONS) {
    for (let i = normalizedSections.length; i < MAX_SECTIONS; i++) {
      const title = DEFAULT_SECTION_TITLES[i] || `Additional Details ${i + 1}`;
      const placeholderQuestion: Question = {
        id: `section-${i + 1}-additional-notes`,
        label: `Provide any additional details for "${title}"`,
        type: 'textarea',
        required: false,
        helpText: undefined,
        placeholder: 'Add details here',
        validation: [],
        options: undefined,
        scaleConfig: undefined,
        metadata: { generated: true, placeholder: true },
      } as Question;

      normalizedSections.push({
        id: `section-${i + 1}`,
        title,
        description: '',
        questions: [placeholderQuestion],
        order: i,
        isCollapsible: true,
        isRequired: true,
      });
    }
  }

  return {
    id: 'dynamic-questionnaire',
    title: 'Dynamic Learning Questionnaire',
    description: 'Comprehensive questionnaire to gather insights for learning blueprint generation',
    sections: normalizedSections,
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
    // Basic text inputs
    case 'text':
      return 'text';
    case 'textarea':
      return 'textarea';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'number':
      return 'number';
    case 'date':
    case 'calendar':
      return 'date';
    
    // Traditional selection
    case 'single_select':
    case 'select':
      return 'select';
    case 'multi_select':
    case 'multiselect':
      return 'multiselect';
    
    // Rich visual selection inputs
    case 'radio_pills':
      return 'radio_pills';
    case 'radio_cards':
      return 'radio_cards';
    case 'checkbox_pills':
      return 'checkbox_pills';
    case 'checkbox_cards':
      return 'checkbox_cards';
    
    // Scales & sliders
    case 'scale':
      return 'scale';
    case 'enhanced_scale':
      return 'enhanced_scale';
    case 'labeled_slider':
    case 'slider':
      return 'labeled_slider';
    
    // Specialized inputs
    case 'toggle_switch':
    case 'toggle':
      return 'toggle_switch';
    case 'currency':
      return 'currency';
    case 'number_spinner':
    case 'spinner':
      return 'number_spinner';
    
    default:
      console.warn(`Unknown Ollama input type: ${ollamaType}, defaulting to text`);
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
