# Static Questions Save Functionality - Fix Summary

## What Was Fixed

### 1. **Enhanced Auto-Save with Comprehensive Logging**
The auto-save hook (`frontend/components/wizard/static-questions/hooks/useAutoSave.ts`) now includes:

- **Detailed console logging** at every step of the save process
- **Error tracking** with specific error messages
- **Data verification** - reads back the saved data to confirm it was stored correctly
- **Explicit `completed_steps` initialization** when creating new blueprints

### 2. **Proper V2 Schema Support**
The save functionality now ensures:

- ✅ **Version 2 schema** is always saved with `version: 2`
- ✅ **All nested fields** are preserved (organization.name, learnerProfile, resources, etc.)
- ✅ **questionnaire_version column** is set to 2
- ✅ **completed_steps** array is initialized as empty `[]`
- ✅ **updated_at timestamp** is set on each update

### 3. **Data Structure Alignment**
The saved data matches the migration 0008 schema exactly:

```typescript
{
  version: 2,
  role: string,
  organization: {
    name: string,
    industry: string,
    size: string,
    regions: string[]
  },
  learnerProfile: {
    audienceSize: string,
    priorKnowledge: number,
    motivation: string[],
    environment: string[],
    devices: string[],
    timeAvailable: number,
    accessibility: string[]
  },
  learningGap: {
    description: string,
    gapType: string,
    urgency: number,
    impact: number,
    impactAreas: string[],
    bloomsLevel: string,
    objectives: string
  },
  resources: {
    budget: { amount: number, flexibility: string },
    timeline: { targetDate: string, flexibility: string, duration: number },
    team: {
      instructionalDesigners: number,
      contentDevelopers: number,
      multimediaSpecialists: number,
      smeAvailability: number,
      experienceLevel: string
    },
    technology: {
      lms: string,
      authoringTools: string[],
      otherTools: string[]
    },
    contentStrategy: {
      source: string,
      existingMaterials: string[]
    }
  },
  deliveryStrategy: {
    modality: string,
    duration: number,
    sessionStructure: string,
    interactivityLevel: number,
    practiceOpportunities: string[],
    socialLearning: string[],
    reinforcement: string
  },
  constraints: string[],
  evaluation: {
    level1: { methods: string[], satisfactionTarget: number },
    level2: {
      assessmentMethods: string[],
      passingRequired: boolean,
      passingScore: number,
      attemptsAllowed: number
    },
    level3: {
      measureBehavior: boolean,
      methods: string[],
      followUpTiming: string,
      behaviors: string
    },
    level4: {
      measureROI: boolean,
      metrics: string[],
      owner: string,
      timing: string
    },
    certification: string
  }
}
```

## How to Verify It's Working

### 1. **Check Browser Console**
Open the browser developer console (F12) and look for:

```
[AutoSave] Starting save for userId: <user-id>
[AutoSave] Data to save: { ... full data structure ... }
[AutoSave] Creating new draft blueprint  // or "Updating existing draft"
[AutoSave] Created new draft with ID: <blueprint-id>  // or "Successfully updated draft"
[AutoSave] Verified saved data: { ... }
[AutoSave] Save completed successfully
```

### 2. **Check Database Directly**
Run this query in Supabase SQL Editor:

```sql
SELECT 
  id,
  user_id,
  questionnaire_version,
  static_answers,
  completed_steps,
  status,
  created_at,
  updated_at
FROM blueprint_generator
WHERE status = 'draft'
ORDER BY updated_at DESC
LIMIT 5;
```

You should see:
- ✅ `questionnaire_version = 2`
- ✅ `static_answers` with nested JSON structure
- ✅ `completed_steps = []`
- ✅ `updated_at` timestamp updating on each save

### 3. **Check Save Status Indicator**
Watch for the save status indicator in the UI:
- 🔄 "Saving..." (with spinner)
- ✅ "All changes saved" (with checkmark)
- ❌ "Save error" (if something fails)

## Troubleshooting

### If Data Is Not Saving:

1. **Check Console for Errors**
   - Look for `[AutoSave] Error ...` messages
   - Common issues: permissions, network errors, validation errors

2. **Verify User Authentication**
   ```javascript
   // In console:
   console.log('User ID:', user?.id);
   ```
   - User must be logged in
   - User ID must be valid UUID

3. **Check Supabase RLS Policies**
   ```sql
   -- Verify draft blueprints are insertable/updatable
   SELECT * FROM blueprint_generator 
   WHERE user_id = auth.uid() 
   AND status = 'draft';
   ```

4. **Verify Migrations Ran Successfully**
   ```sql
   -- Check if columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'blueprint_generator' 
   AND column_name IN ('questionnaire_version', 'completed_steps');
   ```

### If Data Saves But Doesn't Load:

1. **Check the Load Logic** in `StepWizard.tsx` line 68-108
2. **Verify the blueprint ID** is being set in Zustand store
3. **Check the query param** `?bid=<uuid>` if forcing a specific blueprint

## Migration Compatibility

### Existing V1 Data
The migration includes a helper function to migrate V1 to V2:

```sql
-- Run this to migrate existing V1 data
UPDATE public.blueprint_generator 
SET static_answers = migrate_static_answers_v1_to_v2(static_answers)
WHERE (static_answers->>'version') IS NULL 
   OR (static_answers->>'version') = '1';
```

### Backward Compatibility
- V1 data will be automatically upgraded when loaded
- The trigger `trigger_validate_static_answers` ensures version field exists
- Forms default to V2 schema for all new entries

## Testing Checklist

- [ ] Fill out Step 1 (Role) - verify save indicator shows "saved"
- [ ] Fill out Step 2 (Organization) - check console logs
- [ ] Navigate between steps - data should persist
- [ ] Refresh page - data should reload from database
- [ ] Check Supabase table - verify nested JSON structure
- [ ] Complete all 8 steps - verify version=2 is saved
- [ ] Finish questionnaire - redirect to loading screen with correct blueprint ID

## Additional Notes

- Auto-save triggers **2 seconds** after last change (debounced)
- Data is verified by reading it back after each save
- Console logs can be removed in production by commenting them out
- The save hook now explicitly sets `updated_at` timestamp

