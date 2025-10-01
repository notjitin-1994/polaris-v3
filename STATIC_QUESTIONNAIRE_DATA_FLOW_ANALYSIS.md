# Static Questionnaire Data Flow Analysis

## Executive Summary

**Database Saving: ✅ WORKING CORRECTLY**
- Static questionnaire data is being saved to `blueprint_generator.static_answers` (JSONB column)
- Auto-save functionality is robust with error recovery
- All 8 steps of V2 questionnaire are being persisted

**Perplexity Prompt Utilization: ⚠️ PARTIALLY OPTIMIZED**
- The entire `staticAnswers` object IS being sent to Perplexity via `JSON.stringify()`
- However, the prompt only explicitly highlights 5 basic fields from the rich V2 schema
- Many valuable V2 fields are buried in the JSON dump and not explicitly surfaced

---

## 1. Database Saving Analysis

### ✅ Current Implementation (WORKING)

**Location:** `frontend/components/wizard/static-questions/hooks/useAutoSave.ts`

**Mechanism:**
```typescript
// Data is saved with version marker
const dataToSave = {
  ...latestValues.current,
  version: 2,
};

// INSERT for new drafts
await supabase
  .from('blueprint_generator')
  .insert({
    user_id: userId,
    status: 'draft',
    static_answers: dataToSave,  // ✅ Saves complete V2 schema
    questionnaire_version: 2,
    completed_steps: [],
  });

// UPDATE for existing drafts
await supabase
  .from('blueprint_generator')
  .update({
    static_answers: dataToSave,  // ✅ Updates complete V2 schema
    questionnaire_version: 2,
    updated_at: new Date().toISOString(),
  });
```

**Database Schema:**
```sql
-- From supabase/migrations/0003_blueprint_generator.sql
CREATE TABLE blueprint_generator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  static_answers JSONB NOT NULL DEFAULT '{}',  -- ✅ Stores all V2 data
  questionnaire_version INT,
  ...
);
```

**V2 Static Questionnaire Structure (8 Steps):**

1. **Role** (`role: string`)
2. **Organization** 
   - `name: string`
   - `industry: string`
   - `size: '1-50' | '51-200' | '201-1000' | '1000+'`
   - `regions?: string[]`

3. **Learner Profile**
   - `audienceSize: string`
   - `priorKnowledge: 1-5`
   - `motivation: string[]`
   - `environment: string[]`
   - `devices: string[]`
   - `timeAvailable: number`
   - `accessibility: string[]`

4. **Learning Gap & Objectives**
   - `description: string`
   - `gapType: 'knowledge' | 'skill' | 'behavior' | 'performance'`
   - `urgency: 1-5`
   - `impact: 1-5`
   - `impactAreas: string[]` (revenue, productivity, compliance, etc.)
   - `bloomsLevel: string` (remember, understand, apply, etc.)
   - `objectives: string` (rich text)

5. **Resources & Budget**
   - `budget: { amount: number, flexibility: string }`
   - `timeline: { targetDate: string, flexibility: string, duration: number }`
   - `team: { instructionalDesigners, contentDevelopers, multimediaSpecialists, smeAvailability, experienceLevel }`
   - `technology: { lms: string, authoringTools: string[], otherTools: string[] }`
   - `contentStrategy: { source: string, existingMaterials?: string[] }`

6. **Delivery Strategy**
   - `modality: string`
   - `duration?: number`
   - `sessionStructure?: string`
   - `interactivityLevel: 1-5`
   - `practiceOpportunities: string[]`
   - `socialLearning: string[]`
   - `reinforcement: string`

7. **Constraints** (`string[]`)

8. **Assessment & Evaluation**
   - `level1: { methods: string[], satisfactionTarget: number }`
   - `level2: { assessmentMethods: string[], passingRequired: boolean, passingScore?, attemptsAllowed? }`
   - `level3: { measureBehavior: boolean, methods?, followUpTiming?, behaviors? }`
   - `level4: { measureROI: boolean, metrics?, owner?, timing? }`
   - `certification: string`

**Auto-Save Features:**
- ✅ Debounced saves (prevents excessive DB writes)
- ✅ Automatic draft creation on first save
- ✅ Stale blueprint ID recovery
- ✅ Ownership validation
- ✅ Error handling with retry logic
- ✅ Proper status management ('saving', 'saved', 'error')

---

## 2. Perplexity Prompt Analysis

### Current Implementation

**Location:** `frontend/lib/services/perplexityQuestionService.ts:68-151`

**Prompt Structure:**
```typescript
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
${JSON.stringify(staticAnswers, null, 2)}  // ✅ Full data is here

${userPrompts.length > 0 ? `ADDITIONAL CONTEXT:\n${userPrompts.join('\n')}` : ''}

TASK:
Generate a comprehensive dynamic questionnaire with 5 sections, 7 questions each (35 total questions).
Research current ${contextInfo.industry} learning and development best practices from 2024-2025.
...
`;
}
```

### ⚠️ Gap Analysis: Underutilized V2 Fields

**Currently Highlighted (5 fields):**
1. ✅ Role
2. ✅ Industry
3. ✅ Organization name
4. ✅ Learning gap description
5. ✅ Audience size

**NOT Explicitly Highlighted (40+ rich fields):**
- ❌ Organization size & regions
- ❌ Prior knowledge level (1-5 scale)
- ❌ Learner motivation factors
- ❌ Learning environment contexts
- ❌ Device accessibility
- ❌ Time availability per week
- ❌ Accessibility requirements
- ❌ Gap type (knowledge/skill/behavior/performance)
- ❌ Urgency & Impact ratings (1-5)
- ❌ Business impact areas (revenue, productivity, compliance, etc.)
- ❌ Bloom's taxonomy level
- ❌ Detailed learning objectives (rich text)
- ❌ Budget amount & flexibility
- ❌ Timeline (target date, duration, flexibility)
- ❌ Team composition (IDs, developers, specialists)
- ❌ SME availability & team experience level
- ❌ LMS platform
- ❌ Authoring tools
- ❌ Content strategy (scratch/adapt/license/curate)
- ❌ Delivery modality details
- ❌ Interactivity level preference
- ❌ Practice opportunity types
- ❌ Social learning preferences
- ❌ Reinforcement strategy
- ❌ Project constraints
- ❌ Kirkpatrick Level 1-4 evaluation strategies
- ❌ Certification requirements

### Impact Assessment

**What Works:**
- ✅ The full data IS being sent in the JSON dump
- ✅ Perplexity CAN access all fields if it parses the JSON
- ✅ Basic context is clearly highlighted

**What Could Be Better:**
- ⚠️ LLMs perform better when key data is **explicitly structured** in the prompt
- ⚠️ Important V2 fields are buried in a large JSON blob
- ⚠️ No guidance to Perplexity about which fields are most relevant
- ⚠️ Rich fields like Bloom's level, impact areas, and evaluation strategy are not surfaced

---

## 3. Recommendations

### Priority 1: Enhance Perplexity Prompt Context Extraction

**Current:** Only 5 fields explicitly highlighted + JSON dump
**Recommended:** Structure 15-20 key V2 fields in human-readable format

**Suggested Implementation:**

```typescript
function buildPerplexityPrompt(context: QuestionGenerationContext): string {
  const { staticAnswers } = context;
  
  // Extract V2 schema data
  const org = staticAnswers.organization || {};
  const learner = staticAnswers.learnerProfile || {};
  const gap = staticAnswers.learningGap || {};
  const resources = staticAnswers.resources || {};
  const delivery = staticAnswers.deliveryStrategy || {};
  const evaluation = staticAnswers.evaluation || {};

  return `You are an expert Learning Experience Designer with access to current web research.

====================
PROJECT CONTEXT
====================

Organization:
- Name: ${org.name || 'Not specified'}
- Industry: ${org.industry || 'Not specified'}
- Size: ${org.size || 'Not specified'}
- Regions: ${org.regions?.join(', ') || 'Not specified'}

Role: ${staticAnswers.role || 'Not specified'}

====================
LEARNER PROFILE
====================

Audience:
- Size: ${learner.audienceSize || 'Not specified'}
- Prior Knowledge Level: ${learner.priorKnowledge || 'Not specified'}/5
- Motivation Factors: ${learner.motivation?.join(', ') || 'Not specified'}
- Learning Environment: ${learner.environment?.join(', ') || 'Not specified'}
- Devices: ${learner.devices?.join(', ') || 'Not specified'}
- Time Available: ${learner.timeAvailable || 0} hours/week
- Accessibility Needs: ${learner.accessibility?.join(', ') || 'None specified'}

====================
LEARNING GAP & OBJECTIVES
====================

Gap Description:
${gap.description || 'Not specified'}

Gap Type: ${gap.gapType || 'Not specified'}
Urgency: ${gap.urgency || 'Not specified'}/5
Business Impact: ${gap.impact || 'Not specified'}/5
Impact Areas: ${gap.impactAreas?.join(', ') || 'Not specified'}
Bloom's Taxonomy Target: ${gap.bloomsLevel || 'Not specified'}

Learning Objectives:
${gap.objectives || 'Not specified'}

====================
RESOURCES & CONSTRAINTS
====================

Budget:
- Amount: $${resources.budget?.amount || 0}
- Flexibility: ${resources.budget?.flexibility || 'Not specified'}

Timeline:
- Target Completion: ${resources.timeline?.targetDate || 'Not specified'}
- Duration: ${resources.timeline?.duration || 0} weeks
- Flexibility: ${resources.timeline?.flexibility || 'Not specified'}

Team:
- Instructional Designers: ${resources.team?.instructionalDesigners || 0}
- Content Developers: ${resources.team?.contentDevelopers || 0}
- Multimedia Specialists: ${resources.team?.multimediaSpecialists || 0}
- SME Availability: ${resources.team?.smeAvailability || 'Not specified'}/5
- Team Experience: ${resources.team?.experienceLevel || 'Not specified'}

Technology:
- LMS: ${resources.technology?.lms || 'Not specified'}
- Authoring Tools: ${resources.technology?.authoringTools?.join(', ') || 'Not specified'}
- Other Tools: ${resources.technology?.otherTools?.join(', ') || 'Not specified'}

Content Strategy: ${resources.contentStrategy?.source || 'Not specified'}

Project Constraints:
${staticAnswers.constraints?.join('\n- ') || 'None specified'}

====================
DELIVERY STRATEGY
====================

Modality: ${delivery.modality || 'Not specified'}
Interactivity Level: ${delivery.interactivityLevel || 'Not specified'}/5
Practice Opportunities: ${delivery.practiceOpportunities?.join(', ') || 'Not specified'}
Social Learning: ${delivery.socialLearning?.join(', ') || 'Not specified'}
Reinforcement: ${delivery.reinforcement || 'Not specified'}

====================
ASSESSMENT & EVALUATION
====================

Level 1 (Reaction):
- Methods: ${evaluation.level1?.methods?.join(', ') || 'Not specified'}
- Satisfaction Target: ${evaluation.level1?.satisfactionTarget || 'Not specified'}%

Level 2 (Learning):
- Assessment Methods: ${evaluation.level2?.assessmentMethods?.join(', ') || 'Not specified'}
- Passing Required: ${evaluation.level2?.passingRequired ? 'Yes' : 'No'}
${evaluation.level2?.passingScore ? `- Passing Score: ${evaluation.level2.passingScore}%` : ''}

Level 3 (Behavior):
- Measure Behavior Change: ${evaluation.level3?.measureBehavior ? 'Yes' : 'No'}
${evaluation.level3?.methods ? `- Methods: ${evaluation.level3.methods.join(', ')}` : ''}

Level 4 (Results):
- Measure ROI: ${evaluation.level4?.measureROI ? 'Yes' : 'No'}
${evaluation.level4?.metrics ? `- Metrics: ${evaluation.level4.metrics.join(', ')}` : ''}

Certification: ${evaluation.certification || 'None'}

====================
RAW DATA (FULL SCHEMA)
====================
${JSON.stringify(staticAnswers, null, 2)}

====================
TASK
====================
Generate a comprehensive dynamic questionnaire with 5 sections, 7 questions each (35 total questions).
Research current ${org.industry || 'L&D'} learning and development best practices from 2024-2025.

IMPORTANT: Consider ALL the context above when crafting questions:
- Target the specific Bloom's level (${gap.bloomsLevel})
- Address the gap type (${gap.gapType})
- Respect budget constraints ($${resources.budget?.amount || 0})
- Match the team experience level (${resources.team?.experienceLevel})
- Align with the delivery modality (${delivery.modality})
- Design for the specified interactivity level (${delivery.interactivityLevel}/5)
- Consider evaluation requirements (Kirkpatrick Levels ${evaluation.level3?.measureBehavior ? '1-3' : '1-2'})

...
`;
}
```

### Priority 2: Add Field Importance Metadata

Consider adding a metadata object to guide Perplexity on field significance:

```typescript
const fieldImportance = {
  critical: [
    'learningGap.objectives',
    'learningGap.bloomsLevel',
    'resources.budget.amount',
    'resources.timeline.duration',
    'deliveryStrategy.modality',
    'evaluation.level2.passingRequired',
  ],
  important: [
    'learnerProfile.priorKnowledge',
    'learnerProfile.motivation',
    'learningGap.urgency',
    'learningGap.impact',
    'resources.team.experienceLevel',
    'deliveryStrategy.interactivityLevel',
  ],
  contextual: [
    'organization.size',
    'learnerProfile.devices',
    'resources.technology.lms',
    'deliveryStrategy.reinforcement',
  ],
};
```

### Priority 3: Validation Logging

Add logging to track which V2 fields are actually populated:

```typescript
function logFieldPopulation(staticAnswers: Record<string, any>) {
  const populated = {
    organization: Object.keys(staticAnswers.organization || {}).length,
    learnerProfile: Object.keys(staticAnswers.learnerProfile || {}).length,
    learningGap: Object.keys(staticAnswers.learningGap || {}).length,
    resources: Object.keys(staticAnswers.resources || {}).length,
    deliveryStrategy: Object.keys(staticAnswers.deliveryStrategy || {}).length,
    evaluation: Object.keys(staticAnswers.evaluation || {}).length,
  };
  
  logger.info('perplexity.prompt.field_population', populated);
}
```

---

## 4. Summary

| Aspect | Status | Details |
|--------|--------|---------|
| **Database Saving** | ✅ Excellent | All V2 fields saved correctly to `static_answers` JSONB column |
| **Auto-save Robustness** | ✅ Excellent | Draft recovery, ownership validation, error handling |
| **Data Persistence** | ✅ Complete | All 8 steps, 40+ fields persisted |
| **Perplexity Data Access** | ✅ Present | Full data included via JSON.stringify() |
| **Perplexity Context Clarity** | ⚠️ Basic | Only 5 fields explicitly highlighted |
| **Prompt Optimization** | ⚠️ Needs Enhancement | Rich V2 fields not surfaced prominently |

**Recommended Action:** Implement Priority 1 (enhanced context extraction) to ensure Perplexity's question generation fully leverages the comprehensive V2 static questionnaire data.

---

**Generated:** 2025-01-02
**Codebase Version:** SmartSlate Polaris V3

