/**
 * Claude Response Validation
 * Ensures responses are valid JSON and conform to expected structure
 */

import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('claude-validation');

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Remove markdown code fences from text
 * Handles ```json ... ``` and ``` ... ``` formats
 */
export function stripMarkdownCodeFences(text: string): string {
  // Remove markdown code fences (```json or ``` at start and ``` at end)
  const cleaned = text
    .replace(/^```(?:json)?\s*\n/i, '')
    .replace(/\n```\s*$/, '')
    .trim();

  return cleaned;
}

/**
 * Parse and validate JSON response
 * Throws ValidationError if response is not valid JSON
 * Enhanced to handle various edge cases
 */
export function parseAndValidateJSON<T = unknown>(text: string): T {
  if (!text || typeof text !== 'string') {
    throw new ValidationError('Response text is empty or not a string', 'EMPTY_RESPONSE', { text });
  }

  // Trim whitespace first
  text = text.trim();

  // Check for markdown code fences more aggressively
  const hasCodeFences = /^```/i.test(text) || /```$/i.test(text);
  if (hasCodeFences) {
    logger.warn('claude.validation.markdown_detected', 'Markdown code fences detected', {
      textPreview: text.substring(0, 200),
    });

    text = stripMarkdownCodeFences(text);

    // Log cleaned text preview for debugging
    logger.debug('claude.validation.cleaned_text', 'Text after removing markdown', {
      cleanedPreview: text.substring(0, 200),
    });
  }

  // Additional cleanup - remove any non-JSON content before first { or [
  const jsonStartMatch = text.match(/^[^{[]*([{[])/);
  if (jsonStartMatch && jsonStartMatch.index !== 0) {
    logger.warn('claude.validation.removing_preamble', 'Removing preamble text', {
      removedText: text.substring(0, jsonStartMatch.index),
    });
    text = text.substring(text.indexOf(jsonStartMatch[1]));
  }

  // Remove any trailing non-JSON content after last } or ]
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (lastBrace > -1 && lastBrace < text.length - 1) {
    const trailingContent = text.substring(lastBrace + 1).trim();
    if (trailingContent) {
      logger.warn('claude.validation.removing_trailing', 'Removing trailing text', {
        removedText: trailingContent,
      });
      text = text.substring(0, lastBrace + 1);
    }
  }

  // Try to parse JSON
  try {
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (error) {
    // Log more details for debugging
    logger.error('claude.validation.json_parse_error', 'Failed to parse JSON', {
      textLength: text.length,
      textStart: text.substring(0, 100),
      textEnd: text.substring(Math.max(0, text.length - 100)),
      error: (error as Error).message,
    });

    throw new ValidationError('Response is not valid JSON', 'INVALID_JSON', {
      textPreview: text.substring(0, 500),
      error: (error as Error).message,
    });
  }
}

/**
 * Validate blueprint JSON structure
 * Ensures required fields and displayType metadata are present
 */
export function validateBlueprintStructure(blueprint: any): void {
  if (!blueprint || typeof blueprint !== 'object') {
    throw new ValidationError('Blueprint is not an object', 'INVALID_STRUCTURE', { blueprint });
  }

  // Validate metadata exists
  if (!blueprint.metadata || typeof blueprint.metadata !== 'object') {
    throw new ValidationError('Blueprint missing required metadata section', 'MISSING_METADATA', {
      blueprint,
    });
  }

  // Validate metadata fields
  const requiredMetadataFields = ['title', 'organization', 'role', 'generated_at'];
  for (const field of requiredMetadataFields) {
    if (!blueprint.metadata[field]) {
      throw new ValidationError(
        `Blueprint metadata missing required field: ${field}`,
        'MISSING_METADATA_FIELD',
        { field, metadata: blueprint.metadata }
      );
    }
  }

  // Get all sections (excluding metadata)
  const sections = Object.keys(blueprint).filter((key) => key !== 'metadata');

  if (sections.length === 0) {
    throw new ValidationError('Blueprint has no content sections', 'NO_SECTIONS', { blueprint });
  }

  // Validate each section has displayType
  const sectionsWithoutDisplayType: string[] = [];

  for (const sectionKey of sections) {
    const section = blueprint[sectionKey];

    if (section && typeof section === 'object' && !section.displayType) {
      sectionsWithoutDisplayType.push(sectionKey);

      logger.warn('claude.validation.missing_display_type', 'Section missing displayType', {
        section: sectionKey,
      });
    }
  }

  // Log warning but don't fail validation for missing displayType
  // The normalization step will add defaults
  if (sectionsWithoutDisplayType.length > 0) {
    logger.info('claude.validation.sections_missing_display_type', 'Sections need displayType', {
      count: sectionsWithoutDisplayType.length,
      sections: sectionsWithoutDisplayType,
    });
  }
}

/**
 * Infer appropriate displayType based on section content structure
 * Returns the best matching display type
 */
function inferDisplayType(sectionKey: string, section: any): string {
  // Check for specific data structures that indicate visualization types

  // Timeline: has phases, modules with dates, or similar temporal data
  if (section.phases || section.modules || section.timeline) {
    if (Array.isArray(section.phases) && section.phases[0]?.start_date) {
      return 'timeline';
    }
    if (Array.isArray(section.modules) && section.modules[0]?.duration) {
      return 'timeline';
    }
  }

  // Table: has structured lists of similar objects or budget/resource data
  if (section.risks || section.human_resources || section.tools_and_platforms) {
    if (Array.isArray(section.risks) || Array.isArray(section.human_resources)) {
      return 'table';
    }
  }

  // Infographic: has rich data for visualization
  if (section.objectives || section.kpis || section.metrics || section.demographics) {
    return 'infographic';
  }

  // Chart: has explicit chart configuration or quantitative data
  if (section.chartConfig || section.chartType) {
    return 'chart';
  }

  // Check section key for hints
  const keyLower = sectionKey.toLowerCase();
  if (
    keyLower.includes('timeline') ||
    keyLower.includes('schedule') ||
    keyLower.includes('implementation')
  ) {
    return 'timeline';
  }
  if (keyLower.includes('resource') || keyLower.includes('budget') || keyLower.includes('risk')) {
    return 'table';
  }
  if (
    keyLower.includes('metric') ||
    keyLower.includes('kpi') ||
    keyLower.includes('objective') ||
    keyLower.includes('audience') ||
    keyLower.includes('assessment')
  ) {
    return 'infographic';
  }

  // Default to markdown for text-heavy content
  return 'markdown';
}

/**
 * Normalize blueprint by adding intelligent displayType where missing
 * Returns normalized blueprint with inferred display types
 */
export function normalizeBlueprintStructure(blueprint: any): any {
  if (!blueprint || typeof blueprint !== 'object') {
    return blueprint;
  }

  const normalized = { ...blueprint };

  // Get all sections (excluding metadata and internal fields)
  const sections = Object.keys(normalized).filter(
    (key) => key !== 'metadata' && !key.startsWith('_')
  );

  // Add intelligent displayType to sections missing it
  for (const sectionKey of sections) {
    const section = normalized[sectionKey];

    if (section && typeof section === 'object') {
      if (!section.displayType) {
        // Infer appropriate displayType based on content
        section.displayType = inferDisplayType(sectionKey, section);

        logger.info('claude.validation.inferred_display_type', 'Inferred displayType', {
          section: sectionKey,
          displayType: section.displayType,
          hasObjectives: !!section.objectives,
          hasPhases: !!section.phases,
          hasModules: !!section.modules,
          hasMetrics: !!section.metrics || !!section.kpis,
        });
      }

      // Validate displayType is a known value
      const validTypes = ['infographic', 'timeline', 'chart', 'table', 'markdown'];
      if (!validTypes.includes(section.displayType)) {
        logger.warn('claude.validation.invalid_display_type', 'Invalid displayType', {
          section: sectionKey,
          invalidType: section.displayType,
          defaultingTo: 'markdown',
        });
        section.displayType = 'markdown';
      }
    }
  }

  return normalized;
}

/**
 * Full validation and normalization pipeline
 * Parse JSON, validate structure, and normalize
 */
export function validateAndNormalizeBlueprint(text: string): any {
  // Step 1: Parse JSON and strip markdown if present
  const blueprint = parseAndValidateJSON(text);

  // Step 2: Validate structure
  validateBlueprintStructure(blueprint);

  // Step 3: Normalize (add defaults where needed)
  const normalized = normalizeBlueprintStructure(blueprint);

  logger.info('claude.validation.success', 'Blueprint validation successful', {
    hasMetadata: !!normalized.metadata,
    sectionCount: Object.keys(normalized).filter((k) => k !== 'metadata').length,
  });

  return normalized;
}
