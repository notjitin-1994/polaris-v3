/**
 * Claude Prompt Templates for Blueprint Generation
 * Strict prompt formatting according to PRD specifications
 */

export interface BlueprintContext {
  blueprintId: string;
  userId: string;
  staticAnswers: Record<string, any>;
  dynamicAnswers: Record<string, any>;
  organization: string;
  role: string;
  industry: string;
  learningObjectives: string[];
}

/**
 * System prompt for blueprint generation
 * Defines Claude's role and output requirements
 */
export const BLUEPRINT_SYSTEM_PROMPT = `You are an expert Learning Experience Designer with deep knowledge of instructional design principles, adult learning theory, and organizational development.

Your task is to generate comprehensive, industry-specific learning blueprints that:
- Align with ADDIE, SAM, or agile instructional design models
- Incorporate current L&D best practices (2024-2025)
- Are immediately actionable and implementation-ready
- Include measurable KPIs and assessment strategies
- Consider diverse learning modalities and accessibility

OUTPUT REQUIREMENTS:
1. Valid JSON only - no markdown, no preamble, no explanatory text
2. Include "displayType" metadata for EVERY section (except metadata)
3. Use rich, descriptive content that demonstrates expertise
4. Provide specific, contextual recommendations (no generic advice)
5. Include comprehensive detail - ALL information will be displayed in animated infographics
6. Structure data for visual presentation (use arrays, percentages, measurable metrics)
7. Include quantitative data wherever possible for visualization

CRITICAL: Every section will be displayed as an INFOGRAPHIC with animations. Provide data in formats that are:
- Visually representable (numbers, percentages, distributions, timelines)
- Actionable and specific (not generic statements)
- Comprehensive and detailed (users want to see ALL data points)
- Structured for dashboard/card layouts

VISUALIZATION TYPES:
- "infographic": Default for data-rich sections (objectives, audience, assessment, metrics, strategy)
- "chart": For quantitative data visualization (bar, line, pie, radar charts)
- "timeline": For sequential/temporal data (implementation phases, content modules)
- "table": For structured comparative data (risks, resources)
- "markdown": ONLY for pure narrative summaries (executive summary, strategy overview)

SECTION-SPECIFIC REQUIREMENTS:
1. Executive Summary: Keep concise (2-3 paragraphs) but impactful
2. Learning Objectives: Include measurable metrics, baselines, targets, due dates
3. Target Audience: Provide demographic breakdowns with percentages
4. Content Outline: Detailed modules with topics, activities, durations, assessments
5. Instructional Strategy: Modality allocations must sum to 100%, include specific tools
6. Resources: Detailed budget items, human resources with FTE/duration, tools with costs
7. Assessment Strategy: KPIs with targets, measurement methods, frequency
8. Timeline: Phases with specific dates, milestones, dependencies
9. Risk Mitigation: Risks with probability/impact ratings, specific mitigation strategies
10. Success Metrics: Baseline vs target values, measurement methods, timelines
11. Sustainability: Specific review frequencies, update triggers, scaling considerations

Be comprehensive yet concise. Every field should add value to the interactive dashboard.`;

/**
 * Build user prompt for blueprint generation
 * Includes context from questionnaires and user-specific information
 */
export function buildBlueprintPrompt(context: BlueprintContext): string {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const futureDate = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 45 days later

  const prompt = `Generate a comprehensive learning blueprint based on the following inputs:

ORGANIZATION CONTEXT:
- Organization: ${context.organization}
- Industry: ${context.industry}
- Role: ${context.role}

STATIC QUESTIONNAIRE ANSWERS:
${JSON.stringify(context.staticAnswers, null, 2)}

DYNAMIC QUESTIONNAIRE ANSWERS:
${JSON.stringify(context.dynamicAnswers, null, 2)}

PRIMARY LEARNING OBJECTIVES:
${context.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

OUTPUT SCHEMA:
{
  "metadata": {
    "title": "Blueprint Title",
    "organization": "${context.organization}",
    "role": "${context.role}",
    "generated_at": "${new Date().toISOString()}",
    "version": "1.0",
    "model": "claude-sonnet-4"
  },
  "executive_summary": {
    "content": "2-3 paragraph executive summary",
    "displayType": "markdown"
  },
  "learning_objectives": {
    "objectives": [
      {
        "id": "obj1",
        "title": "Objective title",
        "description": "Detailed description",
        "metric": "How success is measured",
        "baseline": "Current state",
        "target": "Desired outcome",
        "due_date": "Target completion date"
      }
    ],
    "displayType": "infographic",
    "chartConfig": {
      "type": "radar",
      "metrics": ["baseline", "target"]
    }
  },
  "target_audience": {
    "demographics": {
      "roles": ["Role 1", "Role 2"],
      "experience_levels": ["Junior", "Mid", "Senior"],
      "department_distribution": [
        {"department": "Engineering", "percentage": 40},
        {"department": "Product", "percentage": 30}
      ]
    },
    "learning_preferences": {
      "modalities": [
        {"type": "Visual", "percentage": 35},
        {"type": "Hands-on", "percentage": 45}
      ]
    },
    "displayType": "infographic"
  },
  "instructional_strategy": {
    "overview": "Strategy narrative",
    "modalities": [
      {
        "type": "Self-paced online",
        "rationale": "Why this modality fits",
        "allocation_percent": 40,
        "tools": ["Tool 1", "Tool 2"]
      }
    ],
    "cohort_model": "Description of cohort approach",
    "accessibility_considerations": ["Consideration 1", "Consideration 2"],
    "displayType": "markdown"
  },
  "content_outline": {
    "modules": [
      {
        "module_id": "m1",
        "title": "Module Title",
        "description": "Module overview",
        "topics": ["Topic 1", "Topic 2"],
        "duration": "2 weeks",
        "delivery_method": "Asynchronous + Live sessions",
        "learning_activities": [
          {
            "activity": "Activity description",
            "type": "Exercise/Discussion/Project",
            "duration": "30 minutes"
          }
        ],
        "assessment": {
          "type": "Quiz/Project/Presentation",
          "description": "Assessment details"
        }
      }
    ],
    "displayType": "timeline"
  },
  "resources": {
    "human_resources": [
      {"role": "Instructional Designer", "fte": 0.5, "duration": "3 months"},
      {"role": "Subject Matter Expert", "fte": 0.25, "duration": "6 weeks"}
    ],
    "tools_and_platforms": [
      {"category": "LMS", "name": "Canvas/Moodle", "cost_type": "Subscription"},
      {"category": "Content Authoring", "name": "Articulate 360", "cost_type": "License"}
    ],
    "budget": {
      "currency": "USD",
      "items": [
        {"item": "Content Development", "amount": 50000},
        {"item": "Tools & Licenses", "amount": 10000}
      ],
      "total": 60000
    },
    "displayType": "table"
  },
  "assessment_strategy": {
    "overview": "Assessment philosophy and approach",
    "kpis": [
      {
        "metric": "Completion Rate",
        "target": "85%",
        "measurement_method": "LMS analytics",
        "frequency": "Weekly"
      }
    ],
    "evaluation_methods": [
      {
        "method": "Knowledge Checks",
        "timing": "End of each module",
        "weight": "20%"
      }
    ],
    "displayType": "infographic",
    "chartConfig": {
      "type": "bar",
      "metric": "target"
    }
  },
  "implementation_timeline": {
    "phases": [
      {
        "phase": "Design",
        "start_date": "{{CURRENT_DATE}}",
        "end_date": "{{CURRENT_DATE_PLUS_45_DAYS}}",
        "milestones": ["Milestone 1", "Milestone 2"],
        "dependencies": []
      }
    ],
    "critical_path": ["Phase 1", "Phase 2"],
    "displayType": "timeline"
  },
  "risk_mitigation": {
    "risks": [
      {
        "risk": "Low engagement",
        "probability": "Medium",
        "impact": "High",
        "mitigation_strategy": "Specific mitigation actions"
      }
    ],
    "contingency_plans": ["Plan A", "Plan B"],
    "displayType": "table"
  },
  "success_metrics": {
    "metrics": [
      {
        "metric": "Metric name",
        "current_baseline": "Current value",
        "target": "Target value",
        "measurement_method": "How to measure",
        "timeline": "When to achieve"
      }
    ],
    "reporting_cadence": "Weekly/Monthly",
    "dashboard_requirements": ["Requirement 1", "Requirement 2"],
    "displayType": "infographic"
  },
  "sustainability_plan": {
    "content": "Long-term sustainability narrative",
    "maintenance_schedule": {
      "review_frequency": "Quarterly",
      "update_triggers": ["Trigger 1", "Trigger 2"]
    },
    "scaling_considerations": ["Consideration 1", "Consideration 2"],
    "displayType": "markdown"
  }
}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON (no markdown code fences, no explanatory text)
2. Include displayType for EVERY top-level section (except metadata)
3. Use specific, contextual content (not generic templates)
4. Include chartConfig when displayType is "chart" or "infographic" with charts
5. Ensure all dates are ISO format strings
6. All monetary amounts should be numbers
7. Percentages should be numbers (0-100)
8. Be comprehensive but avoid unnecessary verbosity`;

  // Replace date placeholders with actual dates
  return prompt
    .replace('{{CURRENT_DATE}}', currentDate)
    .replace('{{CURRENT_DATE_PLUS_45_DAYS}}', futureDate);
}

/**
 * Extract learning objectives from dynamic answers
 * Handles various formats of objectives in the questionnaire
 */
export function extractLearningObjectives(dynamicAnswers: Record<string, any>): string[] {
  const objectives: string[] = [];

  // Try different possible keys where objectives might be stored
  const possibleKeys = [
    'learning_objectives',
    'objectives',
    'goals',
    'learning_goals',
    'target_outcomes',
  ];

  for (const key of possibleKeys) {
    if (dynamicAnswers[key]) {
      const value = dynamicAnswers[key];

      // Handle array format
      if (Array.isArray(value)) {
        objectives.push(...value.map((v) => String(v)));
        break;
      }

      // Handle string format (comma or newline separated)
      if (typeof value === 'string') {
        const split = value
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
        objectives.push(...split);
        break;
      }
    }
  }

  // If no objectives found, return a default
  if (objectives.length === 0) {
    return ['Improve team performance and skills'];
  }

  return objectives;
}
