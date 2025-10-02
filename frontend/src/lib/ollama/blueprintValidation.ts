import { z } from 'zod';
import { blueprintSchema, Blueprint, fullBlueprintSchema, type FullBlueprint } from './schema';
import { ValidationError } from './errors';

export function parseAndValidateBlueprintJSON(jsonString: string): Blueprint {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error: unknown) {
    throw new ValidationError('Invalid JSON string provided for blueprint', error);
  }

  // First, try strict validation against the canonical Blueprint schema
  const strict = blueprintSchema.safeParse(parsedJson);
  if (strict.success) {
    return strict.data;
  }

  // If strict fails, try validating against the extended Full Blueprint schema from the prompt
  const extended = fullBlueprintSchema.safeParse(parsedJson);
  if (extended.success) {
    const mapped = mapFullToBlueprint(extended.data);
    const recheck = blueprintSchema.safeParse(mapped);
    if (recheck.success) {
      return recheck.data;
    }
    throw new ValidationError('Mapped Full Blueprint failed canonical validation', recheck.error);
  }

  // As a last resort, attempt lightweight coercions when the model returned a JSON object
  // shaped closely to the prompt but with minor issues (e.g., arrays/strings mismatched)
  try {
    const repaired = attemptLooseRepair(parsedJson);
    const repairedCheck = blueprintSchema.safeParse(repaired);
    if (repairedCheck.success) {
      return repairedCheck.data;
    }
  } catch {
    // ignore repair attempt errors
  }

  // If all else fails, surface a detailed validation error for the original payload
  throw new ValidationError('Blueprint JSON failed schema validation', strict.error);
}

// TODO: Implement additional validation and repair mechanisms:
// - Create schema compliance checker with detailed error reporting.
// - Add automatic JSON repair for common LLM output issues.
// - Implement fallback schema for partial generation failures.
// - Create validation middleware for API responses.
// - Add schema versioning support for backward compatibility.
// - Implement validation metrics and reporting system.

function mapFullToBlueprint(input: FullBlueprint): Blueprint {
  // Title and overview synthesized from metadata/strategy
  const org = input.metadata?.organization?.trim();
  const role = input.metadata?.role?.trim();
  const title = org ? `${org} Learning Blueprint` : 'Learning Blueprint';
  const overviewParts: string[] = [];
  if (role) overviewParts.push(`Role: ${role}`);
  if (input.instructional_strategy?.cohort_model)
    overviewParts.push(`Cohort: ${input.instructional_strategy.cohort_model}`);
  if (Array.isArray(input.assessment?.kpis) && input.assessment?.kpis?.length) {
    overviewParts.push(`KPIs: ${input.assessment.kpis.map((k) => k.name).join(', ')}`);
  }
  const overview = overviewParts.join(' • ') || 'Auto-generated learning blueprint overview.';

  // Learning objectives from objectives list
  const learningObjectives = (input.objectives || [])
    .map((o) => o.title)
    .filter((s) => !!s && s.trim().length > 0);
  if (learningObjectives.length === 0) {
    learningObjectives.push('Define measurable learning objectives');
  }

  // Modules mapped from content_outline
  const assessmentMethods = Array.isArray(input.assessment?.methods)
    ? input.assessment?.methods
    : [];
  const modules = (input.content_outline || []).map((m) => {
    const durationNum = parseDurationToHours(m.duration);
    const activities: string[] = [];
    if (m.delivery_method) activities.push(`Delivery: ${m.delivery_method}`);
    if (Array.isArray(m.prerequisites) && m.prerequisites.length > 0)
      activities.push(`Prerequisites: ${m.prerequisites.join(', ')}`);
    if (activities.length === 0) activities.push('See instructional strategy');
    const assessments =
      assessmentMethods && assessmentMethods.length > 0
        ? assessmentMethods
        : ['Formative assessment'];
    const topics = Array.isArray(m.topics) && m.topics.length > 0 ? m.topics : [m.title];
    return {
      title: m.title,
      duration: durationNum,
      topics,
      activities,
      assessments,
    };
  });
  if (modules.length === 0) {
    modules.push({
      title: 'Module 1',
      duration: 1,
      topics: ['Overview'],
      activities: ['See instructional strategy'],
      assessments: ['Formative assessment'],
    });
  }

  // Timeline record synthesized from phases
  const timeline: Record<string, string> = {};
  const phases = input.timeline?.phases || [];
  for (const p of phases) {
    timeline[p.name] = `${p.start} to ${p.end}`;
  }

  // Resources flattened
  const resources: Array<{ name: string; type: string; url?: string }> = [];
  const human = input.resources?.human || [];
  for (const h of human) resources.push({ name: `${h.name} (${h.role})`, type: 'Human' });
  const tools = input.resources?.tools || [];
  for (const t of tools) resources.push({ name: `${t.category}: ${t.name}`, type: 'Tool' });
  const budget = input.resources?.budget || [];
  for (const b of budget)
    resources.push({ name: `${b.item} (${b.currency} ${b.amount})`, type: 'Budget' });

  return {
    title,
    overview,
    learningObjectives,
    modules,
    timeline: Object.keys(timeline).length ? timeline : undefined,
    resources: resources.length ? resources : undefined,
  };
}

function parseDurationToHours(duration: string | undefined): number {
  if (!duration) return 0;

  // Extract leading number; tolerate formats like "2h", "1.5h", "90m", "35 minutes", "2 hours"
  const hoursMatch = duration.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:h|hour|hours)/i);
  if (hoursMatch) {
    return Math.max(0, Math.round(parseFloat(hoursMatch[1])));
  }

  const minutesMatch = duration.match(/([0-9]+)\s*(?:m|min|mins|minute|minutes)/i);
  if (minutesMatch) {
    const mins = parseInt(minutesMatch[1], 10);
    return Math.max(0, Math.round(mins / 60));
  }

  const numberMatch = duration.match(/^[0-9]+(?:\.[0-9]+)?$/);
  if (numberMatch) {
    return Math.max(0, Math.round(parseFloat(numberMatch[0])));
  }

  return 0;
}

function attemptLooseRepair(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input;
  // If the object resembles the full prompt shape, try mapping
  const fullParse = fullBlueprintSchema.safeParse(input);
  if (fullParse.success) {
    return mapFullToBlueprint(fullParse.data);
  }
  // Heuristic mapping for prompt-shaped objects that are missing fields
  const coerced = mapFullLikeToBlueprint(input);
  if (coerced) return coerced;
  return input;
}

// Heuristic mapper that tolerates partial/full prompt-shaped objects and converts them
// into the canonical Blueprint shape expected by downstream consumers.
function mapFullLikeToBlueprint(input: unknown): Blueprint | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;

  // Title & overview
  const metadata =
    obj.metadata && typeof obj.metadata === 'object'
      ? (obj.metadata as Record<string, unknown>)
      : undefined;
  const org = typeof metadata?.organization === 'string' ? metadata.organization.trim() : undefined;
  const role = typeof metadata?.role === 'string' ? metadata.role.trim() : undefined;
  const title = org && org.length > 0 ? `${org} Learning Blueprint` : 'Learning Blueprint';
  const overviewParts: string[] = [];
  if (role) overviewParts.push(`Role: ${role}`);

  // Handle executive_summary if present
  if (obj.executive_summary && typeof obj.executive_summary === 'object') {
    const execSummary = obj.executive_summary as Record<string, unknown>;
    if (typeof execSummary.content === 'string') {
      overviewParts.push(execSummary.content.substring(0, 200));
    }
  }
  const instr =
    obj.instructional_strategy && typeof obj.instructional_strategy === 'object'
      ? (obj.instructional_strategy as Record<string, unknown>)
      : undefined;
  const cohortModel = typeof instr?.cohort_model === 'string' ? instr.cohort_model : undefined;
  if (cohortModel) overviewParts.push(`Cohort: ${cohortModel}`);
  const assessment =
    obj.assessment && typeof obj.assessment === 'object'
      ? (obj.assessment as Record<string, unknown>)
      : undefined;
  const kpis = Array.isArray(assessment?.kpis)
    ? (assessment?.kpis as Array<Record<string, unknown>>)
    : [];
  const kpiNames = kpis
    .map((k) => (typeof k?.name === 'string' ? k.name : null))
    .filter(Boolean) as string[];
  if (kpiNames.length) overviewParts.push(`KPIs: ${kpiNames.join(', ')}`);
  const overview = overviewParts.join(' • ') || 'Auto-generated learning blueprint overview.';

  // Learning objectives - handle both arrays and objects with objectives property
  const learningObjectivesRaw = obj.learning_objectives ?? obj.objectives;
  let objectives: Array<Record<string, unknown>> = [];

  if (Array.isArray(learningObjectivesRaw)) {
    objectives = learningObjectivesRaw as Array<Record<string, unknown>>;
  } else if (learningObjectivesRaw && typeof learningObjectivesRaw === 'object') {
    const objWithObjectives = learningObjectivesRaw as Record<string, unknown>;
    if (Array.isArray(objWithObjectives.objectives)) {
      objectives = objWithObjectives.objectives as Array<Record<string, unknown>>;
    }
  }

  const learningObjectives = objectives
    .map((o) =>
      typeof o?.title === 'string'
        ? o.title
        : typeof o?.description === 'string'
          ? o.description
          : null
    )
    .filter((s): s is string => !!s && s.trim().length > 0);
  if (learningObjectives.length === 0) {
    learningObjectives.push('Define measurable learning objectives');
  }

  // Modules from content_outline - handle both array and object with modules property
  let contentOutline: Array<Record<string, unknown>> = [];

  if (Array.isArray(obj.content_outline)) {
    contentOutline = obj.content_outline as Array<Record<string, unknown>>;
  } else if (obj.content_outline && typeof obj.content_outline === 'object') {
    // Claude generates content_outline as { modules: [...], displayType: "..." }
    const outlineObj = obj.content_outline as Record<string, unknown>;
    if (Array.isArray(outlineObj.modules)) {
      contentOutline = outlineObj.modules as Array<Record<string, unknown>>;
    }
  }
  const assessmentMethods = Array.isArray(assessment?.methods)
    ? (assessment?.methods as string[])
    : [];
  const modules = contentOutline.map((m) => {
    const moduleTitle =
      typeof m?.title === 'string' ? m.title : typeof m?.module === 'string' ? m.module : 'Module';
    const durationStr = typeof m?.duration === 'string' ? m.duration : undefined;
    const deliveryMethod = typeof m?.delivery_method === 'string' ? m.delivery_method : undefined;
    const topics = Array.isArray(m?.topics)
      ? (m.topics as string[]).filter((t) => typeof t === 'string' && t.trim().length > 0)
      : [];
    const prerequisites = Array.isArray(m?.prerequisites) ? (m.prerequisites as string[]) : [];

    // Handle activities - Claude generates learning_activities array
    const activities: string[] = [];
    if (Array.isArray(m?.learning_activities)) {
      for (const activity of m.learning_activities as Array<unknown>) {
        if (typeof activity === 'string') {
          activities.push(activity);
        } else if (activity && typeof activity === 'object') {
          const act = activity as Record<string, unknown>;
          if (typeof act.activity === 'string') {
            activities.push(act.activity);
          } else if (typeof act.type === 'string') {
            const duration = typeof act.duration === 'string' ? ` (${act.duration})` : '';
            activities.push(`${act.type}${duration}`);
          }
        }
      }
    } else if (deliveryMethod) {
      activities.push(`Delivery: ${deliveryMethod}`);
    }
    if (prerequisites.length > 0) activities.push(`Prerequisites: ${prerequisites.join(', ')}`);
    if (activities.length === 0) activities.push('See instructional strategy');
    const assessments = assessmentMethods.length > 0 ? assessmentMethods : ['Formative assessment'];
    const topicsFinal =
      topics.length > 0 ? topics : typeof moduleTitle === 'string' ? [moduleTitle] : ['Overview'];
    return {
      title: moduleTitle,
      duration: parseDurationToHours(durationStr),
      topics: topicsFinal,
      activities,
      assessments,
    };
  });
  if (modules.length === 0) {
    modules.push({
      title: 'Module 1',
      duration: 1,
      topics: ['Overview'],
      activities: ['See instructional strategy'],
      assessments: ['Formative assessment'],
    });
  }

  // Timeline -> record of phase name => "start to end"
  const timelineObj =
    obj.timeline && typeof obj.timeline === 'object'
      ? (obj.timeline as Record<string, unknown>)
      : undefined;
  const phases = Array.isArray((timelineObj as any)?.phases)
    ? ((timelineObj as any).phases as Array<Record<string, unknown>>)
    : [];
  const timeline: Record<string, string> = {};
  for (const p of phases) {
    const name = typeof p?.name === 'string' ? p.name : undefined;
    const start = typeof p?.start === 'string' ? p.start : undefined;
    const end = typeof p?.end === 'string' ? p.end : undefined;
    if (name && start && end) timeline[name] = `${start} to ${end}`;
  }

  // Resources flattening
  const resourcesObj =
    obj.resources && typeof obj.resources === 'object'
      ? (obj.resources as Record<string, unknown>)
      : undefined;
  // Claude uses human_resources, tools_and_platforms, and budget.items
  const human = Array.isArray(resourcesObj?.human_resources)
    ? (resourcesObj?.human_resources as Array<Record<string, unknown>>)
    : Array.isArray(resourcesObj?.human)
      ? (resourcesObj?.human as Array<Record<string, unknown>>)
      : [];
  const tools = Array.isArray(resourcesObj?.tools_and_platforms)
    ? (resourcesObj?.tools_and_platforms as Array<Record<string, unknown>>)
    : Array.isArray(resourcesObj?.tools)
      ? (resourcesObj?.tools as Array<Record<string, unknown>>)
      : [];
  let budget: Array<Record<string, unknown>> = [];
  if (resourcesObj?.budget && typeof resourcesObj.budget === 'object') {
    const budgetObj = resourcesObj.budget as Record<string, unknown>;
    if (Array.isArray(budgetObj.items)) {
      budget = budgetObj.items as Array<Record<string, unknown>>;
    }
  } else if (Array.isArray(resourcesObj?.budget)) {
    budget = resourcesObj.budget as Array<Record<string, unknown>>;
  }
  const resources: Array<{ name: string; type: string; url?: string }> = [];
  for (const h of human) {
    const name = typeof h?.name === 'string' ? h.name : undefined;
    const roleStr = typeof h?.role === 'string' ? h.role : undefined;
    if (name && roleStr) resources.push({ name: `${name} (${roleStr})`, type: 'Human' });
  }
  for (const t of tools) {
    const category = typeof t?.category === 'string' ? t.category : undefined;
    const name = typeof t?.name === 'string' ? t.name : undefined;
    if (category && name) resources.push({ name: `${category}: ${name}`, type: 'Tool' });
  }
  for (const b of budget) {
    const item = typeof b?.item === 'string' ? b.item : undefined;
    const currency = typeof b?.currency === 'string' ? b.currency : undefined;
    const amount = typeof (b as any)?.amount === 'number' ? (b as any).amount : undefined;
    if (item && currency && typeof amount === 'number')
      resources.push({ name: `${item} (${currency} ${amount})`, type: 'Budget' });
  }

  const blueprintCandidate = {
    title,
    overview,
    learningObjectives,
    modules,
    timeline: Object.keys(timeline).length ? timeline : undefined,
    resources: resources.length ? resources : undefined,
  } as const;

  const check = blueprintSchema.safeParse(blueprintCandidate);
  return check.success ? check.data : null;
}
