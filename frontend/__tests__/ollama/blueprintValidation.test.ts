import { describe, it, expect } from 'vitest';
import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';
import { Blueprint } from '@/lib/ollama/schema';
import { ValidationError } from '@/lib/ollama/errors';

describe('parseAndValidateBlueprintJSON', () => {
  it('should successfully parse and validate a valid blueprint JSON', () => {
    const validBlueprintJson = JSON.stringify({
      title: 'Valid Blueprint',
      overview: 'A valid test blueprint.',
      learningObjectives: ['Learn validation'],
      modules: [
        {
          title: 'Test Module',
          duration: 2,
          topics: ['Topic 1'],
          activities: ['Activity 1'],
          assessments: ['Assessment 1'],
        },
      ],
    });

    const result = parseAndValidateBlueprintJSON(validBlueprintJson);
    expect(result).toEqual({
      title: 'Valid Blueprint',
      overview: 'A valid test blueprint.',
      learningObjectives: ['Learn validation'],
      modules: [
        {
          title: 'Test Module',
          duration: 2,
          topics: ['Topic 1'],
          activities: ['Activity 1'],
          assessments: ['Assessment 1'],
        },
      ],
    });
  });

  it('should throw ValidationError for invalid JSON', () => {
    const invalidJson = '{ invalid json }';

    expect(() => parseAndValidateBlueprintJSON(invalidJson)).toThrow(ValidationError);
    expect(() => parseAndValidateBlueprintJSON(invalidJson)).toThrow(
      'Invalid JSON string provided for blueprint',
    );
  });

  it('should throw ValidationError for JSON not matching blueprint schema', () => {
    const invalidBlueprintJson = JSON.stringify({
      title: 'Invalid Blueprint',
      // Missing required fields like overview, learningObjectives, modules
    });

    expect(() => parseAndValidateBlueprintJSON(invalidBlueprintJson)).toThrow(ValidationError);
    expect(() => parseAndValidateBlueprintJSON(invalidBlueprintJson)).toThrow(
      'Blueprint JSON failed schema validation',
    );
  });

  it('should handle optional fields correctly', () => {
    const blueprintWithOptionals: Blueprint = {
      title: 'Blueprint with Optionals',
      overview: 'Testing optional fields.',
      learningObjectives: ['Learn optionals'],
      modules: [
        {
          title: 'Module 1',
          duration: 1,
          topics: ['Topic'],
          activities: ['Activity'],
          assessments: ['Assessment'],
        },
      ],
      timeline: {
        'Week 1': 'Introduction',
      },
      resources: [
        {
          name: 'Resource 1',
          type: 'Document',
          url: 'https://example.com',
        },
      ],
    };

    const result = parseAndValidateBlueprintJSON(JSON.stringify(blueprintWithOptionals));
    expect(result.timeline).toEqual({ 'Week 1': 'Introduction' });
    expect(result.resources).toEqual([
      {
        name: 'Resource 1',
        type: 'Document',
        url: 'https://example.com',
      },
    ]);
  });

  it('should handle blueprint without optional fields', () => {
    const blueprintWithoutOptionals: Blueprint = {
      title: 'Blueprint without Optionals',
      overview: 'Testing without optional fields.',
      learningObjectives: ['Learn basics'],
      modules: [
        {
          title: 'Module 1',
          duration: 1,
          topics: ['Topic'],
          activities: ['Activity'],
          assessments: ['Assessment'],
        },
      ],
    };

    const result = parseAndValidateBlueprintJSON(JSON.stringify(blueprintWithoutOptionals));
    expect(result.timeline).toBeUndefined();
    expect(result.resources).toBeUndefined();
  });

  it('should validate module structure correctly', () => {
    const blueprintWithInvalidModule = JSON.stringify({
      title: 'Invalid Module Blueprint',
      overview: 'Testing invalid module.',
      learningObjectives: ['Learn validation'],
      modules: [
        {
          title: 'Valid Module',
          duration: 2,
          topics: ['Topic 1'],
          activities: ['Activity 1'],
          assessments: ['Assessment 1'],
        },
        {
          // Missing required fields in second module
          title: 'Invalid Module',
          duration: 'not-a-number', // Should be number
          topics: [], // Should have at least one topic
          activities: ['Activity'],
          assessments: ['Assessment'],
        },
      ],
    });

    expect(() => parseAndValidateBlueprintJSON(blueprintWithInvalidModule)).toThrow(
      ValidationError,
    );
  });

  it('should validate nested object structures', () => {
    const blueprintWithNestedValidation = JSON.stringify({
      title: 'Nested Validation Blueprint',
      overview: 'Testing nested validation.',
      learningObjectives: ['Learn nesting'],
      modules: [
        {
          title: 'Nested Module',
          duration: 3,
          topics: ['Topic 1', 'Topic 2'],
          activities: ['Activity 1'],
          assessments: ['Assessment 1'],
        },
      ],
      resources: [
        {
          name: 'Resource with URL',
          type: 'Link',
          url: 'https://example.com',
        },
        {
          name: 'Resource without URL',
          type: 'Document',
          // URL is optional, so this should be valid
        },
      ],
    });

    const result = parseAndValidateBlueprintJSON(blueprintWithNestedValidation);
    expect(result.resources).toEqual([
      {
        name: 'Resource with URL',
        type: 'Link',
        url: 'https://example.com',
      },
      {
        name: 'Resource without URL',
        type: 'Document',
      },
    ]);
  });
});
