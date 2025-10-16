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
  maxTokens: 16384, // Increased for 10 sections (50-70 questions)
};

let cachedSystemPrompt: string | null = null;

export function buildSystemPrompt(): string {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  // Use comprehensive prompt matching Perplexity's format
  cachedSystemPrompt = `You are an expert Learning Experience Designer with deep knowledge of instructional design principles, adult learning theory, and organizational development.

Your task is to generate sophisticated dynamic questionnaires that deeply understand comprehensive project context and use modern, visually engaging input types.

OUTPUT REQUIREMENTS:
1. Valid JSON only - no markdown, no preamble, no explanatory text
2. Generate exactly 10 sections with 5-7 questions each (50-70 total questions)
3. Use modern visual input types (radio_pills, checkbox_cards, etc.) - AVOID select/multiselect
4. Personalize questions based on user context
5. Include validation for every question
6. Use unique IDs in format: q{questionNumber}_s{sectionNumber}

JSON SCHEMA:
{
  "sections": [
    {
      "id": "s1",
      "title": "Section Title",
      "description": "Section description",
      "order": 1,
      "questions": [
        {
          "id": "q1_s1",
          "label": "Question text",
          "type": "radio_pills",
          "required": true,
          "helpText": "Optional help text",
          "options": [
            {"value": "option1", "label": "Option 1", "disabled": false}
          ],
          "scaleConfig": {
            "min": 1,
            "max": 5,
            "minLabel": "Low",
            "maxLabel": "High",
            "step": 1
          }
        }
      ]
    }
  ]
}

MODERN INPUT TYPES (USE THESE):

SINGLE SELECTION:
- radio_pills (2-6 options) - Modern pill buttons for quick selection
- radio_cards (2-4 options) - Cards with descriptions for detailed options
- toggle_switch (exactly 2 options) - Yes/No, Enable/Disable binary choices

MULTIPLE SELECTION:
- checkbox_pills (2-8 options) - Pill buttons for multiple selection
- checkbox_cards (2-6 options) - Cards with descriptions, multiple selection

RATING & SCALES:
- scale (1-10 range) - Simple numeric rating scale
  Config: {min: 1, max: 5, minLabel: "Novice", maxLabel: "Expert"}
- enhanced_scale (1-7 with visual feedback) - Scale with labels/emojis
  Config: {min: 1, max: 5, labels: ["😞", "😐", "🙂", "😊", "🤩"]}
- labeled_slider (0-100+ with unit) - Continuous values with units
  Config: {min: 0, max: 40, step: 1, unit: "hours/week"}

TEXT INPUT:
- text (single line, max 200 chars) - Short text answers
- textarea (multi-line, 3-10 rows) - Detailed descriptions

NUMERIC:
- currency (with symbol) - Budget, costs, ROI
  Config: {currencySymbol: "$", min: 0, max: 1000000}
- number_spinner (with +/- buttons) - Team size, quantities
  Config: {min: 1, max: 500, step: 1}
- number (basic numeric) - Percentages, scores

DATE & CONTACT:
- date (calendar picker) - Dates, deadlines, milestones
- email (validated) - Contact information
- url (validated) - Links, resources

AVOID THESE (Poor UX):
❌ select - Use radio_pills or radio_cards instead
❌ multiselect - Use checkbox_pills or checkbox_cards instead

SECTION GUIDELINES:
1. Learning Objectives & Outcomes - Define success, strategic importance, measurable outcomes
2. Learner Profile & Audience Context - Experience, motivation, learning preferences
3. Resources, Tools, & Support Systems - Personnel, technology, content, budgets
4. Timeline, Constraints, & Delivery - Timeframes, priorities, delivery modes
5. Evaluation, Success Metrics & Impact - Measurement, feedback loops, sustainability

QUESTION DESIGN BEST PRACTICES:
- Use SMART objectives framework
- Apply Bloom's taxonomy for cognitive depth
- Consider adult learning principles (andragogy)
- Include Kirkpatrick evaluation levels where relevant
- Mix input types for engagement
- Personalize with user's role, organization, industry
- Make questions actionable and implementation-ready
- Avoid duplication across sections

Return ONLY valid JSON matching the schema above.`;

  return cachedSystemPrompt;
}

export function buildUserPrompt(input: GenerationInput): string {
  // Parse input data for structured presentation
  const role = 'role' in input ? (input as any).role : 'Not specified';
  const org = 'organization' in input ? (input as any).organization : 'Not specified';
  const industry = 'industry' in input ? (input as any).industry : 'Not specified';
  const learningGap = 'learningGap' in input ? (input as any).learningGap : 'Not specified';
  const resources = 'resources' in input ? (input as any).resources : 'Not specified';
  const constraints = 'constraints' in input ? (input as any).constraints : 'Not specified';

  return `Generate a comprehensive learning blueprint dynamic questionnaire based on the following context:

╔══════════════════════════════════════════════════════════════════════════════╗
║                         PROJECT CONTEXT ANALYSIS                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 ORGANIZATION PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organization:     ${org}
Industry:         ${industry}
Requestor Role:   ${role}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 LEARNING GAP & OBJECTIVES (CRITICAL CONTEXT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gap Description:
${learningGap}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 RESOURCES & CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resources Available: ${resources}
Constraints: ${constraints}

╔══════════════════════════════════════════════════════════════════════════════╗
║                         YOUR MISSION & TASK                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

Generate ${input.numSections} sections with ${input.questionsPerSection} questions each (${input.numSections * input.questionsPerSection} total questions).

REQUIREMENTS:
1. Use modern visual input types (radio_pills, checkbox_cards, toggle_switch, etc.)
2. AVOID old types: select, multiselect (use pills/cards instead)
3. Personalize all questions with organization name, role, industry, and gap context
4. Include validation for every question (required: true/false)
5. Use IDs in format: q{questionNumber}_s{sectionNumber} (e.g., q1_s1, q2_s1)
6. Mix input types for engagement:
   - Include scales for ratings/assessments
   - Use currency for budget questions
   - Use date for timeline questions
   - Use pills/cards for selections
   - Use text/textarea for descriptions

SECTION STRUCTURE:
1. Learning Objectives & Outcomes (success criteria, strategic alignment)
2. Learner Profile & Audience (experience, motivation, preferences)
3. Resources & Support Systems (team, technology, budget, content)
4. Timeline & Delivery Strategy (deadlines, modality, constraints)
5. Evaluation & Success Metrics (KPIs, measurement, sustainability)

CRITICAL:
- Return ONLY valid JSON matching the schema from system prompt
- No markdown, no code blocks, no explanatory text
- Ensure all sections have "id", "title", "description", "order"
- Ensure all questions have "id", "label", "type", "required"
- Include "options" array for all selection types
- Include "scaleConfig" for scale/slider types
- Make questions actionable and implementation-ready
`;
}
