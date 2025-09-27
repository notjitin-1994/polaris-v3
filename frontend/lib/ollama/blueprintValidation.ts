import { z } from 'zod';
import { blueprintSchema, Blueprint } from './schema';
import { ValidationError } from './errors';

export function parseAndValidateBlueprintJSON(jsonString: string): Blueprint {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error: unknown) {
    throw new ValidationError('Invalid JSON string provided for blueprint', error);
  }

  const validationResult = blueprintSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    // TODO: Implement automatic JSON repair for common LLM output issues (advanced)
    // For now, re-throw a detailed validation error.
    throw new ValidationError('Blueprint JSON failed schema validation', validationResult.error);
  }

  return validationResult.data;
}

// TODO: Implement additional validation and repair mechanisms:
// - Create schema compliance checker with detailed error reporting.
// - Add automatic JSON repair for common LLM output issues.
// - Implement fallback schema for partial generation failures.
// - Create validation middleware for API responses.
// - Add schema versioning support for backward compatibility.
// - Implement validation metrics and reporting system.
