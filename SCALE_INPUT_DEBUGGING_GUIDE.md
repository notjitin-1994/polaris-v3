# Scale Input Display Issue - Debugging Guide

## Issue Summary
Scale inputs (both `scale` and `enhanced_scale` types) are not being displayed on the dynamic questionnaire wizard.

## Root Cause Analysis

The scale input components have type guard validations that return `null` if the question doesn't pass validation:

```typescript
if (!isScaleQuestion(question)) {
  console.warn('ScaleInput received non-scale question:', question);
  return null;
}
```

This can happen if:
1. **Missing `scaleConfig`**: The question doesn't have the required `scaleConfig` field
2. **Type mismatch**: The question `type` field isn't exactly `'scale'` or `'enhanced_scale'`
3. **Data corruption**: The question data was corrupted during save/load from database
4. **Schema validation failure**: The question doesn't conform to the Zod schema

## Changes Made

### 1. Enhanced Logging in `ScaleInput.tsx`
Added comprehensive error logging to diagnose type validation failures:

```typescript
if (!isScaleQuestion(question)) {
  console.error('[ScaleInput] Type validation failed:', {
    questionId: question.id,
    questionType: question.type,
    expectedType: 'scale',
    hasScaleConfig: 'scaleConfig' in question,
    scaleConfig: (question as any).scaleConfig,
  });
  return null;
}
```

Added success logging to confirm proper rendering:

```typescript
console.log('[ScaleInput] Rendering scale:', {
  questionId: question.id,
  config,
  currentValue: value,
});
```

### 2. Enhanced Logging in `EnhancedScaleInput` (RichInputs.tsx)
Applied the same diagnostic logging pattern:

```typescript
if (!isEnhancedScaleQuestion(question)) {
  console.error('[EnhancedScaleInput] Type validation failed:', {
    questionId: question.id,
    questionType: question.type,
    expectedType: 'enhanced_scale',
    hasScaleConfig: 'scaleConfig' in question,
    scaleConfig: (question as any).scaleConfig,
  });
  return null;
}
```

### 3. Component Registry Debugging (inputs/index.ts)
Added logging to track component selection:

```typescript
if (type === 'scale' || type === 'enhanced_scale') {
  console.log('[getInputComponent] Scale type requested:', {
    requestedType: type,
    foundInRegistry: inputRegistry.has(type),
    wasMapped: result.mapped,
    mappedFrom: result.mappedFrom,
    mappedTo: result.mappedTo,
    componentName: result.component.name || result.component.displayName,
  });
}
```

## How to Diagnose the Issue

### Step 1: Open Browser DevTools Console
Navigate to the dynamic questionnaire page and open the browser console (F12).

### Step 2: Look for Error Messages
Check for any of these error patterns:

#### Type Validation Failed
```
[ScaleInput] Type validation failed: {
  questionId: "q1_s1",
  questionType: "scale",  // Check if this is correct
  expectedType: "scale",
  hasScaleConfig: false,  // If false, this is the problem!
  scaleConfig: undefined
}
```

**Solution**: The question is missing `scaleConfig`. Check the Perplexity prompt or normalization function.

#### Wrong Component Selected
```
[getInputComponent] Scale type requested: {
  requestedType: "scale",
  foundInRegistry: false,  // If false, component isn't registered!
  wasMapped: true,
  mappedFrom: "scale",
  mappedTo: "text"  // Fallback to text input
}
```

**Solution**: The scale component isn't properly registered. Check `inputs/index.ts` registration.

### Step 3: Check Question Data
If you see successful logs but still no display:

```
[ScaleInput] Rendering scale: {
  questionId: "q1_s1",
  config: { min: 1, max: 5, step: 1, minLabel: "Low", maxLabel: "High" },
  currentValue: undefined
}
```

This means the component is rendering but might have CSS issues or the generated `scaleOptions` array is empty.

## Common Fixes

### Fix 1: Ensure scaleConfig in Perplexity Response
Check `frontend/lib/services/perplexityQuestionService.ts` normalization function (lines 569-579):

```typescript
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
```

Verify this code is running and adding `scaleConfig` to scale questions.

### Fix 2: Check Database Schema
Verify the `dynamic_questions` column in `blueprint_generator` table preserves the full question structure:

```sql
SELECT 
  id,
  jsonb_pretty(dynamic_questions::jsonb) AS questions
FROM blueprint_generator
WHERE id = '<your-blueprint-id>';
```

Look for scale questions and confirm they have `scaleConfig` fields.

### Fix 3: Verify Component Registration
In `frontend/components/dynamic-form/inputs/index.ts`, confirm registration:

```typescript
inputRegistry.registerBatch([
  { type: 'scale', component: ScaleInput },
  { type: 'enhanced_scale', component: EnhancedScaleInput },
  // ... other types
]);
```

### Fix 4: Check CSS/Visibility
If logs show successful rendering but nothing displays, check for CSS issues:

```typescript
// In ScaleInput.tsx, around line 52
<div className="flex items-center justify-between space-x-2">
  {scaleOptions.map((option) => (
    // Scale buttons should render here
  ))}
</div>
```

Add a temporary `console.log('scaleOptions:', scaleOptions)` to verify the array has items.

## Testing Steps

1. **Regenerate Dynamic Questions**: Trigger Perplexity to generate new questions
2. **Check Console Logs**: Look for the diagnostic messages above
3. **Inspect Question Data**: In DevTools, set breakpoint in `DynamicFormRenderer.tsx` at line 474
4. **Verify ScaleConfig**: Check that `question.scaleConfig` exists and has correct structure

## Related Files

- `frontend/components/dynamic-form/inputs/ScaleInput.tsx` - Basic scale input
- `frontend/components/dynamic-form/inputs/RichInputs.tsx` - Enhanced scale input
- `frontend/components/dynamic-form/inputs/index.ts` - Component registry
- `frontend/lib/services/perplexityQuestionService.ts` - Question normalization
- `frontend/lib/dynamic-form/schema.ts` - Type definitions and validators

## Next Steps

Based on the console logs you see:

1. **If you see type validation errors**: Fix the question data structure
2. **If you see no logs at all**: Check if scale questions are being generated by Perplexity
3. **If you see successful rendering logs but no display**: Check CSS and DOM structure

---

**Note**: These changes add temporary debugging logs. Once the issue is identified and fixed, consider removing or reducing the verbosity of these logs to avoid console pollution.

