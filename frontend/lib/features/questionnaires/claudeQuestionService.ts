/**
 * Claude Question Generation Service
 * Integrates with Claude AI for research-backed dynamic question generation
 */

import { createServiceLogger } from '@/lib/logging';
import { ClaudeClient } from '@/lib/claude/client';
import { getClaudeConfig } from '@/lib/claude/config';
import { Section, Question } from '@/lib/dynamic-form/schema';

const logger = createServiceLogger('claude');

export interface QuestionGenerationContext {
  blueprintId: string;
  userId: string;
  staticAnswers: Record<string, any>;
  userPrompts?: string[];
  role?: string;
  industry?: string;
  organization?: string;
}

export interface ClaudeResponse {
  sections: Section[];
  metadata: {
    generatedAt: string;
    model: string;
    researchCitations?: string[];
    duration?: number;
  };
}

/**
 * Build comprehensive prompt for Claude question generation
 * Includes ALL V2 static questionnaire data in structured format
 */
function buildClaudePrompt(context: QuestionGenerationContext): string {
  const { staticAnswers, userPrompts = [] } = context;

  // Check if V2.0 format (3-section from current PRD implementation)
  const isV20 =
    staticAnswers.section_1_role_experience &&
    staticAnswers.section_2_organization &&
    staticAnswers.section_3_learning_gap;

  let org: any,
    learner: any,
    gap: any,
    resources: any,
    delivery: any,
    evaluation: any,
    constraints: any[],
    role: string;

  if (isV20) {
    // V2.0 (3-section) format - map to expected structure
    const roleData = (staticAnswers.section_1_role_experience as any) || {};
    const orgData = (staticAnswers.section_2_organization as any) || {};
    const learningData = (staticAnswers.section_3_learning_gap as any) || {};

    role = roleData.current_role || roleData.custom_role || 'Not specified';

    org = {
      name: orgData.organization_name,
      industry: orgData.industry_sector,
      size: orgData.organization_size,
      regions: orgData.geographic_regions || [],
    };

    learner = {
      audienceSize: learningData.total_learners_range,
      priorKnowledge: learningData.current_knowledge_level,
      motivation: learningData.motivation_factors || [],
      environment: learningData.learning_location || [],
      devices: learningData.devices_used || [],
      timeAvailable: learningData.hours_per_week,
      accessibility: [],
    };

    gap = {
      description: learningData.learning_gap_description,
      gapType: 'Not specified',
      urgency: 'Not specified',
      impact: 'Not specified',
      impactAreas: [],
      bloomsLevel: 'Not specified',
      objectives: 'Not specified',
    };

    resources = {
      budget: {
        amount: learningData.budget_available?.amount || 0,
        currency: learningData.budget_available?.currency || 'USD',
        flexibility: 'Not specified',
      },
      timeline: {
        targetDate: learningData.learning_deadline || 'Not specified',
        duration: 'Not specified',
        flexibility: 'Not specified',
      },
      team: {},
      technology: {},
      contentStrategy: {},
    };

    delivery = {};
    evaluation = {};
    constraints = [];
  } else {
    // Legacy V2 (8-section) format
    role = staticAnswers.role || 'Not specified';
    org = staticAnswers.organization || {};
    learner = staticAnswers.learnerProfile || {};
    gap = staticAnswers.learningGap || {};
    resources = staticAnswers.resources || {};
    delivery = staticAnswers.deliveryStrategy || {};
    evaluation = staticAnswers.evaluation || {};
    constraints = staticAnswers.constraints || [];
  }

  return `You are an expert Learning Experience Designer with access to current research and best practices. Generate a sophisticated dynamic questionnaire that deeply understands the following comprehensive project context.

╔══════════════════════════════════════════════════════════════════════════════╗
║                         PROJECT CONTEXT ANALYSIS                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 ORGANIZATION PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organization:     ${org.name || 'Not specified'}
Industry:         ${org.industry || 'Not specified'}
Organization Size: ${org.size || 'Not specified'}
Operating Regions: ${Array.isArray(org.regions) && org.regions.length > 0 ? org.regions.join(', ') : 'Not specified'}
Requestor Role:   ${role}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 LEARNER PROFILE & AUDIENCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audience Size:           ${learner.audienceSize || 'Not specified'}
Prior Knowledge Level:   ${learner.priorKnowledge || 'Not specified'}/5 (1=Novice, 5=Expert)
Motivation Factors:      ${Array.isArray(learner.motivation) && learner.motivation.length > 0 ? learner.motivation.join(', ') : 'Not specified'}
Learning Environments:   ${Array.isArray(learner.environment) && learner.environment.length > 0 ? learner.environment.join(', ') : 'Not specified'}
Device Access:           ${Array.isArray(learner.devices) && learner.devices.length > 0 ? learner.devices.join(', ') : 'Not specified'}
Time Availability:       ${learner.timeAvailable || 0} hours per week
Accessibility Needs:     ${Array.isArray(learner.accessibility) && learner.accessibility.length > 0 ? learner.accessibility.join(', ') : 'None specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 LEARNING GAP & OBJECTIVES (CRITICAL CONTEXT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gap Description:
${gap.description || 'Not specified'}

Gap Type:              ${gap.gapType || 'Not specified'} (knowledge/skill/behavior/performance)
Urgency Level:         ${gap.urgency || 'Not specified'}/5 (1=Low, 5=Critical)
Business Impact:       ${gap.impact || 'Not specified'}/5 (1=Minimal, 5=Transformational)
Impact Areas:          ${Array.isArray(gap.impactAreas) && gap.impactAreas.length > 0 ? gap.impactAreas.join(', ') : 'Not specified'}
Bloom's Taxonomy:      ${gap.bloomsLevel || 'Not specified'} (remember/understand/apply/analyze/evaluate/create)

Learning Objectives (Rich Text):
${gap.objectives || 'Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 RESOURCES & BUDGET CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Budget Amount:         $${resources.budget?.amount?.toLocaleString() || '0'}
Budget Flexibility:    ${resources.budget?.flexibility || 'Not specified'}

Timeline Target:       ${resources.timeline?.targetDate || 'Not specified'}
Project Duration:      ${resources.timeline?.duration || 'Not specified'} weeks
Timeline Flexibility:  ${resources.timeline?.flexibility || 'Not specified'}

Team Composition:
  - Instructional Designers:    ${resources.team?.instructionalDesigners || 0}
  - Content Developers:         ${resources.team?.contentDevelopers || 0}
  - Multimedia Specialists:     ${resources.team?.multimediaSpecialists || 0}
  - SME Availability:           ${resources.team?.smeAvailability || 'Not specified'}/5
  - Team Experience Level:      ${resources.team?.experienceLevel || 'Not specified'}

Technology Stack:
  - LMS Platform:       ${resources.technology?.lms || 'Not specified'}
  - Authoring Tools:    ${Array.isArray(resources.technology?.authoringTools) && resources.technology.authoringTools.length > 0 ? resources.technology.authoringTools.join(', ') : 'Not specified'}
  - Other Tools:        ${Array.isArray(resources.technology?.otherTools) && resources.technology.otherTools.length > 0 ? resources.technology.otherTools.join(', ') : 'Not specified'}

Content Strategy:      ${resources.contentStrategy?.source || 'Not specified'} (scratch/adapt/license/curate/hybrid)
${Array.isArray(resources.contentStrategy?.existingMaterials) && resources.contentStrategy.existingMaterials.length > 0 ? `Existing Materials:    ${resources.contentStrategy.existingMaterials.join(', ')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 DELIVERY STRATEGY & MODALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Modality:           ${delivery.modality || 'Not specified'} (self-paced/ilt/blended/microlearning/simulation/video)
${delivery.duration ? `Session Duration:           ${delivery.duration} minutes` : ''}
${delivery.sessionStructure ? `Session Structure:          ${delivery.sessionStructure}` : ''}
Interactivity Level:        ${delivery.interactivityLevel || 'Not specified'}/5 (1=Passive, 5=Highly Interactive)
Practice Opportunities:     ${Array.isArray(delivery.practiceOpportunities) && delivery.practiceOpportunities.length > 0 ? delivery.practiceOpportunities.join(', ') : 'Not specified'}
Social Learning Elements:   ${Array.isArray(delivery.socialLearning) && delivery.socialLearning.length > 0 ? delivery.socialLearning.join(', ') : 'Not specified'}
Reinforcement Strategy:     ${delivery.reinforcement || 'Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ PROJECT CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${constraints.length > 0 ? constraints.map((c: string) => `• ${c}`).join('\n') : 'None specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ASSESSMENT & EVALUATION FRAMEWORK (Kirkpatrick Model)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1 (Reaction):
  - Methods:                ${Array.isArray(evaluation.level1?.methods) && evaluation.level1.methods.length > 0 ? evaluation.level1.methods.join(', ') : 'Not specified'}
  - Satisfaction Target:    ${evaluation.level1?.satisfactionTarget || 'Not specified'}%

Level 2 (Learning):
  - Assessment Methods:     ${Array.isArray(evaluation.level2?.assessmentMethods) && evaluation.level2.assessmentMethods.length > 0 ? evaluation.level2.assessmentMethods.join(', ') : 'Not specified'}
  - Passing Required:       ${evaluation.level2?.passingRequired ? 'Yes' : 'No'}
${evaluation.level2?.passingScore ? `  - Passing Score:          ${evaluation.level2.passingScore}%` : ''}
${evaluation.level2?.attemptsAllowed ? `  - Attempts Allowed:       ${evaluation.level2.attemptsAllowed}` : ''}

Level 3 (Behavior Change):
  - Measure Behavior:       ${evaluation.level3?.measureBehavior ? 'Yes' : 'No'}
${evaluation.level3?.methods ? `  - Methods:                ${Array.isArray(evaluation.level3.methods) ? evaluation.level3.methods.join(', ') : evaluation.level3.methods}` : ''}
${evaluation.level3?.followUpTiming ? `  - Follow-up Timing:       ${evaluation.level3.followUpTiming}` : ''}
${evaluation.level3?.behaviors ? `  - Target Behaviors:       ${evaluation.level3.behaviors}` : ''}

Level 4 (Results/ROI):
  - Measure ROI:            ${evaluation.level4?.measureROI ? 'Yes' : 'No'}
${evaluation.level4?.metrics ? `  - Metrics:                ${Array.isArray(evaluation.level4.metrics) ? evaluation.level4.metrics.join(', ') : evaluation.level4.metrics}` : ''}
${evaluation.level4?.owner ? `  - Measurement Owner:      ${evaluation.level4.owner}` : ''}
${evaluation.level4?.timing ? `  - Measurement Timing:     ${evaluation.level4.timing}` : ''}

Certification Type:       ${evaluation.certification || 'None'}

${
  userPrompts.length > 0
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 ADDITIONAL USER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${userPrompts.join('\n')}
`
    : ''
}

╔══════════════════════════════════════════════════════════════════════════════╗
║                         YOUR MISSION & TASK                                   ║
╚════════════════════════━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━════════╝

Generate a sophisticated, research-backed dynamic questionnaire with 10 sections containing 5-7 questions each (50-70 total questions). Use your knowledge of current ${org.industry || 'L&D'} industry best practices from 2024-2025.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 INPUT TYPE SELECTION GUIDE (CRITICAL - READ CAREFULLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ AVOID THESE INPUT TYPES (Poor UX, use alternatives):
  ❌ select         → Use radio_pills or radio_cards instead (2-6 options)
  ❌ multiselect    → Use checkbox_pills or checkbox_cards instead (2-8 options)

✅ PREFERRED INPUT TYPES (Modern, Visual, Engaging):

📍 SINGLE SELECTION (Choose One):
  • radio_pills (2-6 options)
    Use for: Short labels, quick selection
    Example: "What is your primary learning goal?" 
    Options: ["Skill Development", "Career Advancement", "Certification", "Performance Improvement"]
    
  • radio_cards (2-4 options)
    Use for: Longer descriptions, need visual distinction
    Example: "Select your preferred learning format:"
    Options with descriptions showing benefits of each format

📍 MULTIPLE SELECTION (Choose Many):
  • checkbox_pills (2-8 options)
    Use for: Multiple selection with short labels
    Example: "Which delivery methods interest you?" (can select 1-3)
    Options: ["Live Webinars", "Self-Paced", "Workshops", "Coaching"]
    
  • checkbox_cards (2-6 options)
    Use for: Multiple selection with detailed descriptions
    Example: "Select all assessment methods you'd like to explore:"
    Options with descriptions explaining each method

📍 RATING & SCALES (Numeric Values):
  • scale (1-10 range)
    Use for: Simple 1-5 or 1-10 ratings
    Example: "Rate your current knowledge level (1=Novice, 5=Expert)"
    Config: {min: 1, max: 5, minLabel: "Novice", maxLabel: "Expert"}
    
  • enhanced_scale (1-7 range with labels/emojis)
    Use for: More expressive ratings with visual feedback
    Example: "How satisfied are you with current training?"
    Config: {min: 1, max: 5, labels: ["😞", "😐", "🙂", "😊", "🤩"]}
    
  • labeled_slider (0-100+ range with unit)
    Use for: Continuous numeric values, percentages, time
    Example: "How many hours per week can learners dedicate?"
    Config: {min: 0, max: 40, step: 1, unit: "hours/week"}

📍 BOOLEAN/BINARY CHOICES:
  • toggle_switch (exactly 2 options)
    Use for: Yes/No, Enable/Disable, Included/Excluded
    Example: "Will this training be mandatory?"
    Options: [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}]

📍 TEXT INPUT (Free Form):
  • text (single line, max 200 chars)
    Use for: Names, titles, short answers
    Example: "What is the primary skill you want to develop?"
    
  • textarea (multi-line, 3-10 rows)
    Use for: Detailed descriptions, scenarios, objectives
    Example: "Describe a typical challenge your learners face:"

📍 SPECIALIZED NUMERIC:
  • currency (money with symbol)
    Use for: Budget, cost per learner, ROI targets
    Example: "What is your available training budget?"
    Config: {currencySymbol: "$", min: 0, max: 1000000}
    
  • number_spinner (integer with +/- buttons)
    Use for: Team size, number of modules, cohort size
    Example: "How many learners are in this cohort?"
    Config: {min: 1, max: 500, step: 1}
    
  • number (basic numeric)
    Use for: Percentages, scores, general numbers
    Example: "What completion rate are you targeting?"

📍 DATE & CONTACT:
  • date (calendar picker)
    Use for: Start dates, deadlines, milestones
    Example: "When do you need the training completed by?"
    
  • email (validated email)
    Use for: Contact information
    Example: "Who should we contact about this project?"
    
  • url (validated URL)
    Use for: Resource links, LMS URLs
    Example: "What is your organization's LMS URL?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 QUESTION DESIGN REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EACH QUESTION MUST:
✓ Be contextually relevant to the comprehensive context above
✓ Directly address the Bloom's level (${gap.bloomsLevel || 'not specified'})
✓ Consider the gap type (${gap.gapType || 'not specified'})
✓ Respect budget constraints ($${resources.budget?.amount?.toLocaleString() || '0'})
✓ Align with team experience (${resources.team?.experienceLevel || 'not specified'})
✓ Match delivery modality (${delivery.modality || 'not specified'})
✓ Design for interactivity level (${delivery.interactivityLevel || 'not specified'}/5)
✓ Support evaluation requirements (Kirkpatrick Levels ${evaluation.level3?.measureBehavior ? '1-3' : evaluation.level4?.measureROI ? '1-4' : '1-2'})
✓ Be actionable and extract implementation-ready insights
✓ Use clear, professional language
✓ Include helpful helpText to guide responses
✓ Have realistic placeholder examples
✓ Include research citations in metadata when drawing from current best practices

CONTEXTUAL INTELLIGENCE:
- For high urgency (${gap.urgency || 'N/A'}/5), prioritize questions about rapid deployment
- For large teams (${resources.team?.instructionalDesigners || 0}+ IDs), ask about collaboration workflows
- For ${learner.priorKnowledge || 'N/A'}/5 knowledge level, adjust technical depth appropriately
- For ${learner.timeAvailable || 0} hours/week availability, consider time-based questions
- For limited budget, focus on cost-effective solutions
- For high interactivity preferences, emphasize engagement strategies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT SCHEMA (STRICT JSON - NO MARKDOWN, NO PREAMBLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "sections": [
    {
      "id": "s1",
      "title": "Engaging Section Title",
      "description": "Clear explanation of what this section explores and why it matters",
      "order": 1,
      "questions": [
        {
          "id": "q1_s1",
          "label": "Clear, actionable question text?",
          "type": "radio_pills",
          "required": true,
          "helpText": "Brief guidance to help user answer effectively",
          "placeholder": "Select your preferred option",
          "options": [
            {"value": "opt1", "label": "Option One", "icon": "✓"},
            {"value": "opt2", "label": "Option Two", "icon": "★"},
            {"value": "opt3", "label": "Option Three", "icon": "●"}
          ],
          "metadata": {
            "researchSource": "2024 L&D Industry Report - cite actual sources when using research"
          }
        },
        {
          "id": "q2_s1",
          "label": "Rate your experience level",
          "type": "enhanced_scale",
          "required": true,
          "helpText": "Be honest - this helps us tailor recommendations",
          "scaleConfig": {
            "min": 1,
            "max": 5,
            "minLabel": "Beginner",
            "maxLabel": "Expert",
            "labels": ["😊", "🙂", "😐", "😎", "🤩"],
            "step": 1
          },
          "metadata": {}
        },
        {
          "id": "q3_s1",
          "label": "Select all delivery methods that interest you",
          "type": "checkbox_pills",
          "required": true,
          "helpText": "You can select multiple options (recommended: 2-4)",
          "maxSelections": 5,
          "options": [
            {"value": "webinar", "label": "Live Webinars"},
            {"value": "selfpaced", "label": "Self-Paced Online"},
            {"value": "workshop", "label": "In-Person Workshops"},
            {"value": "coaching", "label": "1-on-1 Coaching"},
            {"value": "microlearning", "label": "Microlearning Modules"}
          ],
          "metadata": {}
        },
        {
          "id": "q4_s1",
          "label": "How many hours per week can learners dedicate?",
          "type": "labeled_slider",
          "required": true,
          "helpText": "Consider their current workload and competing priorities",
          "sliderConfig": {
            "min": 0,
            "max": 40,
            "step": 1,
            "unit": "hours/week",
            "markers": [5, 10, 20, 30]
          },
          "metadata": {}
        },
        {
          "id": "q5_s1",
          "label": "What is your total training budget?",
          "type": "currency",
          "required": true,
          "helpText": "Include all costs: development, delivery, and evaluation",
          "currencySymbol": "$",
          "min": 0,
          "max": 10000000,
          "metadata": {}
        },
        {
          "id": "q6_s1",
          "label": "Describe a typical learner challenge or pain point",
          "type": "textarea",
          "required": true,
          "helpText": "Provide specific examples to help us design targeted solutions",
          "placeholder": "Example: Our sales team struggles with...",
          "rows": 4,
          "maxLength": 500,
          "metadata": {}
        },
        {
          "id": "q7_s1",
          "label": "Will pre-assessment testing be required?",
          "type": "toggle_switch",
          "required": true,
          "helpText": "Helps establish baseline and measure learning gains",
          "options": [
            {"value": "yes", "label": "Yes, Required"},
            {"value": "no", "label": "No, Optional"}
          ],
          "metadata": {}
        }
      ]
    }
  ],
  "metadata": {
    "generatedAt": "${new Date().toISOString()}",
    "model": "claude-sonnet-4-5",
    "context": "Generated from comprehensive V2 static questionnaire with ${Object.keys(staticAnswers).length} data points",
    "researchCitations": []
  }
}

CRITICAL INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Return ONLY valid JSON - NO markdown code fences (no \`\`\`json), NO explanatory text
2. Start directly with { and end with }
3. Ensure all strings are properly escaped
4. Use diverse input types across questions (not all radio_pills or all text)
5. Make options realistic and contextually relevant
6. Prefer visual input types (pills, cards, scales) over select/multiselect
7. Include helpful helpText for every question
8. Set appropriate min/max/step for numeric inputs
9. Use researchCitations in metadata when drawing from 2024-2025 best practices
10. Ensure question IDs follow format: q{number}_s{section number} (e.g., q1_s1, q7_s3)

REMEMBER THE CONTEXT:
You are designing questions for ${org.industry || 'a learning initiative'} targeting ${learner.priorKnowledge || 3}/5 knowledge level learners. Focus on extracting insights that directly inform blueprint development for this specific organizational context and learning gap.`;
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
 * Extract and validate JSON from Claude response
 */
function extractAndValidateJSON(
  content: string,
  context: QuestionGenerationContext
): ClaudeResponse {
  logger.debug('claude.questions.parsing', 'Parsing Claude response', {
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
    logger.error('claude.questions.parsing.failure', 'No valid JSON object found in response', {
      blueprintId: context.blueprintId,
      contentPreview: content.substring(0, 200),
    });
    throw new Error('No valid JSON object found in Claude response');
  }

  jsonString = jsonString.substring(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(jsonString) as ClaudeResponse;

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

    logger.info('dynamic_questions.validation.success', 'Successfully validated Claude response', {
      blueprintId: context.blueprintId,
      sectionCount: parsed.sections.length,
      questionCount: totalQuestions,
    });

    return parsed;
  } catch (error) {
    logger.error('dynamic_questions.validation.failure', 'Failed to parse Claude JSON', {
      blueprintId: context.blueprintId,
      error: error instanceof Error ? error.message : String(error),
      jsonPreview: jsonString.substring(0, 500),
    });
    throw new Error(
      `Invalid JSON from Claude: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate dynamic questions using Claude with retry logic
 */
export async function generateWithClaude(
  context: QuestionGenerationContext
): Promise<ClaudeResponse> {
  const overallStartTime = Date.now();

  logger.info('dynamic_questions.generation.start', 'Starting Claude question generation', {
    blueprintId: context.blueprintId,
    userId: context.userId,
    hasUserPrompts: (context.userPrompts?.length ?? 0) > 0,
  });

  // Validate configuration
  const config = getClaudeConfig();
  if (!config.apiKey) {
    logger.error('claude.questions.failure', 'Claude API key not configured', {
      blueprintId: context.blueprintId,
    });
    throw new Error('Claude API key not configured');
  }

  const prompt = buildClaudePrompt(context);
  const claudeClient = new ClaudeClient();

  try {
    const response = await claudeClient.generate({
      system:
        'You are an expert Learning Experience Designer who generates sophisticated dynamic questionnaires. Always respond with valid JSON only, no markdown formatting or explanatory text.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    const content = ClaudeClient.extractText(response);
    const result = extractAndValidateJSON(content, context);

    // Add duration to metadata
    result.metadata.duration = Date.now() - overallStartTime;

    logger.info(
      'dynamic_questions.generation.complete',
      'Successfully generated questions with Claude',
      {
        blueprintId: context.blueprintId,
        sectionCount: result.sections.length,
        questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
        duration: result.metadata.duration,
      }
    );

    return result;
  } catch (error) {
    const totalDuration = Date.now() - overallStartTime;

    logger.error('dynamic_questions.generation.error', 'Claude generation failed', {
      blueprintId: context.blueprintId,
      error: error instanceof Error ? error.message : String(error),
      duration: totalDuration,
    });

    throw error;
  }
}

/**
 * Validate Claude configuration
 */
export function validateClaudeConfig(): { valid: boolean; errors: string[] } {
  const config = getClaudeConfig();
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('ANTHROPIC_API_KEY environment variable not set');
  }

  if (!config.baseUrl) {
    errors.push('ANTHROPIC_BASE_URL environment variable not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
