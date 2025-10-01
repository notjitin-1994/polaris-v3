/**
 * Perplexity Question Generation Service
 * Integrates with Perplexity AI for research-backed dynamic question generation
 */

import { createServiceLogger } from '@/lib/logging';
import { Section, Question } from '@/lib/dynamic-form/schema';

const logger = createServiceLogger('perplexity');

// Perplexity API configuration
const PERPLEXITY_CONFIG = {
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseUrl: process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
  model: 'sonar-pro',
  temperature: 0.1,
  maxTokens: 8700,
  timeout: 75000, // 75 seconds
  retries: 2,
} as const;

export interface QuestionGenerationContext {
  blueprintId: string;
  userId: string;
  staticAnswers: Record<string, any>;
  userPrompts?: string[];
  role?: string;
  industry?: string;
  organization?: string;
}

export interface PerplexityResponse {
  sections: Section[];
  metadata: {
    generatedAt: string;
    model: string;
    researchCitations?: string[];
    duration?: number;
  };
}

interface PerplexityAPIResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
}

/**
 * Build prompt for Perplexity question generation
 */
function buildPerplexityPrompt(context: QuestionGenerationContext): string {
  const { staticAnswers, userPrompts = [], role, industry, organization } = context;

  // Extract key context from static answers
  const contextInfo = {
    role: role || staticAnswers.role || 'Unknown',
    industry:
      industry || staticAnswers.organization?.industry || staticAnswers.industry || 'Unknown',
    organization:
      organization || staticAnswers.organization?.name || staticAnswers.organization || 'Unknown',
    learningGap:
      staticAnswers.learningGap?.description || staticAnswers.learningGap || 'Not specified',
    audience:
      staticAnswers.learnerProfile?.audienceSize || staticAnswers.targetAudience || 'Not specified',
  };

  return `You are an expert Learning Experience Designer with access to current web research.

CONTEXT:
- Role: ${contextInfo.role}
- Industry: ${contextInfo.industry}
- Organization: ${contextInfo.organization}
- Learning Gap: ${contextInfo.learningGap}
- Target Audience: ${contextInfo.audience}

STATIC QUESTIONNAIRE ANSWERS:
${JSON.stringify(staticAnswers, null, 2)}

${userPrompts.length > 0 ? `ADDITIONAL CONTEXT:\n${userPrompts.join('\n')}` : ''}

TASK:
Generate a comprehensive dynamic questionnaire with 5 sections, 7 questions each (35 total questions).
Research current ${contextInfo.industry} learning and development best practices from 2024-2025.
Create questions that will gather actionable insights for developing a Learning Blueprint.

REQUIREMENTS:
1. Use diverse input types based on question nature:
   - Visual inputs preferred: radio_pills, radio_cards, checkbox_pills, checkbox_cards
   - Scales for ratings: scale, enhanced_scale, labeled_slider
   - Text when open-ended: text, textarea
   - Specialized: toggle_switch, currency, number_spinner, date, email, url

2. Each question must be:
   - Contextually relevant to the provided information
   - Actionable and specific
   - Clear and professional
   - Designed to extract implementation-ready insights

3. Include research citations in metadata when applicable

OUTPUT SCHEMA (STRICT JSON - NO MARKDOWN, NO PREAMBLE):
{
  "sections": [
    {
      "id": "s1",
      "title": "Section Title",
      "description": "Brief description of what this section covers",
      "order": 1,
      "questions": [
        {
          "id": "q1_s1",
          "label": "Question text that is clear and actionable",
          "type": "radio_pills|radio_cards|checkbox_pills|checkbox_cards|scale|enhanced_scale|labeled_slider|toggle_switch|text|textarea|select|multiselect|currency|number_spinner|date|email|url|number",
          "required": true,
          "helpText": "Brief guidance for the user",
          "placeholder": "Example: Your answer here...",
          "options": [{"value": "v1", "label": "Option 1"}],
          "scaleConfig": {"min": 1, "max": 5, "minLabel": "Low", "maxLabel": "High"},
          "metadata": {
            "researchSource": "Citation if research was used"
          }
        }
      ]
    }
  ],
  "metadata": {
    "generatedAt": "${new Date().toISOString()}",
    "model": "sonar-pro",
    "researchCitations": ["source1", "source2"]
  }
}

CRITICAL: Return ONLY valid JSON. No markdown code fences. No explanatory text.`;
}

/**
 * Call Perplexity API with retry logic
 */
async function callPerplexityAPI(
  prompt: string,
  context: QuestionGenerationContext,
  attempt: number = 1
): Promise<PerplexityAPIResponse> {
  const startTime = Date.now();

  logger.info('perplexity.request', `Sending request to Perplexity (attempt ${attempt})`, {
    blueprintId: context.blueprintId,
    userId: context.userId,
    model: PERPLEXITY_CONFIG.model,
    temperature: PERPLEXITY_CONFIG.temperature,
    maxTokens: PERPLEXITY_CONFIG.maxTokens,
    attemptNumber: attempt,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PERPLEXITY_CONFIG.timeout);

    const response = await fetch(`${PERPLEXITY_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: PERPLEXITY_CONFIG.temperature,
        max_tokens: PERPLEXITY_CONFIG.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      logger.error('perplexity.failure', `Perplexity API returned ${response.status}`, {
        blueprintId: context.blueprintId,
        statusCode: response.status,
        error: errorData,
        duration,
        attemptNumber: attempt,
      });

      throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: PerplexityAPIResponse = await response.json();

    logger.info('perplexity.success', 'Received response from Perplexity', {
      blueprintId: context.blueprintId,
      duration,
      tokens: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      attemptNumber: attempt,
    });

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('perplexity.timeout', 'Perplexity request timed out', {
        blueprintId: context.blueprintId,
        timeout: PERPLEXITY_CONFIG.timeout,
        duration,
        attemptNumber: attempt,
      });
      throw new Error(`Perplexity request timed out after ${PERPLEXITY_CONFIG.timeout}ms`);
    }

    logger.error('perplexity.failure', 'Perplexity request failed', {
      blueprintId: context.blueprintId,
      error: error instanceof Error ? error.message : String(error),
      duration,
      attemptNumber: attempt,
    });

    throw error;
  }
}

/**
 * Normalize and ensure all required fields for questions
 */
function normalizeQuestion(question: any): Question {
  const normalized: any = {
    id: question.id,
    label: question.label,
    type: question.type,
    required: question.required ?? false,
    placeholder: question.placeholder,
    helpText: question.helpText || question.help_text,
    options: question.options,
    metadata: question.metadata || {},
  };

  // Ensure scaleConfig for scale-type questions
  if (question.type === 'scale' || question.type === 'enhanced_scale') {
    normalized.scaleConfig = {
      min: question.scaleConfig?.min ?? 1,
      max: question.scaleConfig?.max ?? 5,
      minLabel: question.scaleConfig?.minLabel || 'Low',
      maxLabel: question.scaleConfig?.maxLabel || 'High',
      step: question.scaleConfig?.step ?? 1,
      labels: question.scaleConfig?.labels,
    };
  }

  // Ensure sliderConfig for labeled_slider
  if (question.type === 'labeled_slider') {
    normalized.sliderConfig = {
      min: question.sliderConfig?.min ?? 0,
      max: question.sliderConfig?.max ?? 100,
      step: question.sliderConfig?.step ?? 1,
      unit: question.sliderConfig?.unit,
      markers: question.sliderConfig?.markers,
    };
  }

  // Ensure numberConfig for number_spinner
  if (question.type === 'number_spinner') {
    normalized.numberConfig = {
      min: question.numberConfig?.min ?? 0,
      max: question.numberConfig?.max ?? 999,
      step: question.numberConfig?.step ?? 1,
    };
  }

  // Ensure currencySymbol for currency type
  if (question.type === 'currency') {
    normalized.currencySymbol = question.currencySymbol || '$';
    normalized.min = question.min;
    normalized.max = question.max;
  }

  // Ensure options for selection-based inputs
  if (
    [
      'select',
      'multiselect',
      'radio_pills',
      'radio_cards',
      'checkbox_pills',
      'checkbox_cards',
    ].includes(question.type)
  ) {
    normalized.options = question.options || [];
  }

  // Ensure options for toggle_switch (requires exactly 2)
  if (question.type === 'toggle_switch') {
    normalized.options =
      question.options && question.options.length === 2
        ? question.options
        : [
            { value: 'yes', label: 'Yes', icon: undefined },
            { value: 'no', label: 'No', icon: undefined },
          ];
  }

  // Ensure validation array
  normalized.validation = question.validation || [];

  return normalized as Question;
}

/**
 * Extract and validate JSON from Perplexity response
 */
function extractAndValidateJSON(
  content: string,
  context: QuestionGenerationContext
): PerplexityResponse {
  logger.debug('perplexity.parsing', 'Parsing Perplexity response', {
    blueprintId: context.blueprintId,
    contentLength: content.length,
  });

  // Remove markdown code fences if present
  let jsonString = content.trim();
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  // Find JSON object boundaries
  const startIdx = jsonString.indexOf('{');
  const endIdx = jsonString.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    logger.error('perplexity.parsing.failure', 'No valid JSON object found in response', {
      blueprintId: context.blueprintId,
      contentPreview: content.substring(0, 200),
    });
    throw new Error('No valid JSON object found in Perplexity response');
  }

  jsonString = jsonString.substring(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(jsonString) as PerplexityResponse;

    // Validate structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Response missing sections array');
    }

    if (parsed.sections.length === 0) {
      throw new Error('Response has no sections');
    }

    // Validate and normalize each section
    for (const section of parsed.sections) {
      if (
        !section.id ||
        !section.title ||
        !section.questions ||
        !Array.isArray(section.questions)
      ) {
        throw new Error(`Invalid section structure: ${JSON.stringify(section)}`);
      }

      if (section.questions.length === 0) {
        throw new Error(`Section ${section.id} has no questions`);
      }

      // Normalize each question with proper defaults
      section.questions = section.questions.map(normalizeQuestion);

      // Validate normalized questions
      for (const question of section.questions) {
        if (!question.id || !question.label || !question.type) {
          throw new Error(
            `Invalid question structure after normalization: ${JSON.stringify(question)}`
          );
        }
      }
    }

    const totalQuestions = parsed.sections.reduce((sum, s) => sum + s.questions.length, 0);

    logger.info(
      'dynamic_questions.validation.success',
      'Successfully validated Perplexity response',
      {
        blueprintId: context.blueprintId,
        sectionCount: parsed.sections.length,
        questionCount: totalQuestions,
      }
    );

    return parsed;
  } catch (error) {
    logger.error('dynamic_questions.validation.failure', 'Failed to parse Perplexity JSON', {
      blueprintId: context.blueprintId,
      error: error instanceof Error ? error.message : String(error),
      jsonPreview: jsonString.substring(0, 500),
    });
    throw new Error(
      `Invalid JSON from Perplexity: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate dynamic questions using Perplexity with retry logic
 */
export async function generateWithPerplexity(
  context: QuestionGenerationContext
): Promise<PerplexityResponse> {
  const overallStartTime = Date.now();

  logger.info('dynamic_questions.generation.start', 'Starting Perplexity question generation', {
    blueprintId: context.blueprintId,
    userId: context.userId,
    hasUserPrompts: (context.userPrompts?.length ?? 0) > 0,
  });

  // Validate API key
  if (!PERPLEXITY_CONFIG.apiKey) {
    logger.error('perplexity.failure', 'Perplexity API key not configured', {
      blueprintId: context.blueprintId,
    });
    throw new Error('Perplexity API key not configured');
  }

  const prompt = buildPerplexityPrompt(context);

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 1; attempt <= PERPLEXITY_CONFIG.retries + 1; attempt++) {
    try {
      const apiResponse = await callPerplexityAPI(prompt, context, attempt);
      const content = apiResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from Perplexity');
      }

      const result = extractAndValidateJSON(content, context);

      // Add duration to metadata
      result.metadata.duration = Date.now() - overallStartTime;

      logger.info(
        'dynamic_questions.generation.complete',
        'Successfully generated questions with Perplexity',
        {
          blueprintId: context.blueprintId,
          sectionCount: result.sections.length,
          questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
          duration: result.metadata.duration,
          totalAttempts: attempt,
        }
      );

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt < PERPLEXITY_CONFIG.retries + 1) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s

        logger.warn(
          'perplexity.retry',
          `Retrying Perplexity request after error (attempt ${attempt})`,
          {
            blueprintId: context.blueprintId,
            error: lastError.message,
            nextAttemptIn: delay,
            attemptNumber: attempt,
          }
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  const totalDuration = Date.now() - overallStartTime;

  logger.error('dynamic_questions.generation.error', 'All Perplexity attempts failed', {
    blueprintId: context.blueprintId,
    error: lastError?.message,
    totalAttempts: PERPLEXITY_CONFIG.retries + 1,
    duration: totalDuration,
    fallbackActivated: true,
  });

  throw lastError || new Error('Perplexity generation failed after all retries');
}

/**
 * Validate Perplexity configuration
 */
export function validatePerplexityConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!PERPLEXITY_CONFIG.apiKey) {
    errors.push('PERPLEXITY_API_KEY environment variable not set');
  }

  if (!PERPLEXITY_CONFIG.baseUrl) {
    errors.push('PERPLEXITY_BASE_URL environment variable not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
