import type { GenerationInput } from '@/lib/ollama/schema';
import fs from 'node:fs';
import path from 'node:path';

export type ModelConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: process.env.OLLAMA_MODEL || 'qwen3:30b-a3b',
  temperature: 0.2,
  maxTokens: 8192,
};

let cachedSystemPrompt: string | null = null;

export function buildSystemPrompt(): string {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  try {
    // Prefer project-level .taskmaster prompts as source of truth
    const candidates = [
      path.join(process.cwd(), '.taskmaster', 'dynamic-questions-prompt.md'),
      path.join(process.cwd(), '..', '.taskmaster', 'dynamic-questions-prompt.md'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        cachedSystemPrompt = content;
        return content;
      }
    }
    throw new Error('dynamic-questions-prompt.md not found');
  } catch (error) {
    // Fallback to embedded prompt if the file is unavailable at runtime
    cachedSystemPrompt = [
      'You are an expert **Learning Experience Designer, Instructional Designer, and Senior Learning Leader**.',
      "Your task is to generate a **dynamic questionnaire** based on the user's responses to 5 static questions:",
      '1. Role',
      '2. Organization',
      '3. Identified Learning Gap',
      '4. Resources & Budgets',
      '5. Constraints',
      '',
      '## Goal',
      'Generate a **dynamic, highly contextual questionnaire** with **5 sections**, each containing **7 questions** (35 total).',
      'The questionnaire will collect comprehensive, actionable insights to enable generation of a **fully functional, implementable Learning Blueprint**.',
      '',
      '## Output Format',
      'Return the questionnaire in **strict JSON** with this schema:',
      '',
      '```json',
      '{',
      '  "sections": [',
      '    {',
      '      "title": "string",',
      '      "description": "string",',
      '      "questions": [',
      '        {',
      '          "id": "string",',
      '          "question_text": "string",',
      '          "input_type": "string",',
      '          "options": ["optional", "for", "balloons", "or", "dropdown"],',
      '          "validation": {',
      '            "required": true,',
      '            "data_type": "string/number/date/currency"',
      '          }',
      '        }',
      '      ]',
      '    }',
      '  ]',
      '}',
      '```',
      '',
      '### Accepted Input Types',
      '- "single_select" → Single-choice balloons or dropdown.',
      '- "multi_select" → Multiple-choice balloons.',
      '- "slider" → Numeric scale (e.g., 1–10, resource allocation).',
      '- "calendar" → Date or timeline input.',
      '- "currency" → Budget or cost input.',
      '- "text" → Open text response.',
      '',
      '---',
      '',
      '## Section Guidance',
      'Design the 5 sections as follows (rename if helpful, but keep intent). Personalize wording using the static answers (role, organization, learning gap, resources/budgets, constraints). Apply LXD best practices (SMART objectives, Bloom’s taxonomy for depth, andragogy for relevance/autonomy, Gagné for delivery, Kirkpatrick levels for evaluation).',
      '',
      '1. **Learning Objectives & Outcomes** – define success, strategic importance, measurable outcomes.',
      '2. **Learner Profile & Audience Context** – learner strengths, experience, motivation, learning preferences.',
      '3. **Resources, Tools, & Support Systems** – available personnel, technology, content, budgets.',
      '4. **Timeline, Constraints, & Delivery Conditions** – timeframes, priorities, delivery modes, blockers.',
      '5. **Evaluation, Success Metrics & Long-Term Impact** – success measurement, feedback loops, sustainability.',
      '',
      '---',
      '',
      '## Question Design Guidelines',
      '- **Depth & Specificity**: Each question extracts practical, implementation-ready information. Use verbs that elicit measurable outputs (SMART).',
      '- **Variety**: Mix input types (sliders, calendars, balloons, currency). Include at least: Objectives ≥1 slider; Audience ≥1 slider; Resources ≥1 currency; Timeline ≥2 calendar; Evaluation ≥1 slider.',
      '- **Clarity**: Questions must be unambiguous and easy to answer. Single purpose per question.',
      '- **Personalization**: Weave the user’s role, organization, tools (e.g., LMS/authoring), budget/timeline, and constraints into question_text and options.',
      '- **Options Quality**: For single_select/multi_select, provide 4–8 realistic options plus "Other" if helpful.',
      '- **Accessibility & Global Readiness**: Elicit languages, time zones, and accommodations where relevant.',
      '- **Avoid Duplication**: No repeated questions across sections.',
      '- **Scalability**: Questions must apply across industries and org sizes.',
      '',
      '---',
      '',
      '## Final Instruction',
      'Generate the **full questionnaire (5 sections × 7 questions)** in JSON.',
      'Ensure each section/question **directly supports creation of a world-class Learning Experience Blueprint** that can be implemented by instructional designers, content developers, and project managers. Use unique IDs like `S{section}Q{question}` and include a validation object for every question with the correct data_type.',
    ].join('\n');
    return cachedSystemPrompt;
  }
}

export function buildUserPrompt(input: GenerationInput): string {
  return `
Based on the following static responses, generate a comprehensive dynamic questionnaire:

**Role:** ${'role' in input ? (input as any).role : 'N/A'}
**Organization:** ${'organization' in input ? (input as any).organization : 'N/A'}
**Identified Learning Gap:** ${'learningGap' in input ? (input as any).learningGap : 'N/A'}
**Resources & Budgets:** ${'resources' in input ? (input as any).resources : 'N/A'}
**Constraints:** ${'constraints' in input ? (input as any).constraints : 'N/A'}

Generate exactly ${input.numSections} sections with ${input.questionsPerSection} questions each (${input.numSections * input.questionsPerSection} total questions).

Use the JSON schema provided in the system prompt and ensure each question is:
- Clear and actionable
- Contextually relevant to the provided information
- Designed to extract implementation-ready insights
- Varied in input types (mix of text, single_select, multi_select, slider, calendar, currency)

Additional requirements:
- Personalize question_text (and options when applicable) with the provided role, organization, learning gap, tools, budget, timeline, and constraints.
- Use IDs in the format S{sectionNumber}Q{questionNumber} (e.g., S2Q4). Ensure IDs are unique.
- Include a validation object for every question with the correct data_type: slider→number, calendar→date, currency→currency, others→string.
- Ensure at least: Section 1 (≥1 slider), Section 2 (≥1 slider), Section 3 (≥1 currency), Section 4 (≥2 calendar), Section 5 (≥1 slider).

Return ONLY the JSON response with no additional commentary.
`;
}
