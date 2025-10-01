# Auto-Save Fix - Complete Solution

## The Problem

**Error:** `PGRST116: Cannot coerce the result to a single JSON object - The result contains 0 rows`

This error occurred because:
1. The Zustand store had a **stale blueprint ID** stored
2. When trying to update, the blueprint didn't exist or belonged to a different user
3. The `.select().single()` on the UPDATE query failed because 0 rows were matched

## The Root Cause

When a user:
- Logs out and logs back in
- Switches accounts
- Or the blueprint gets deleted

The blueprint ID stored in Zustand becomes invalid, causing every save attempt to fail.

## The Solution

### 1. **Validate Before Update**
Before attempting to update, we now:
- Check if the blueprint exists
- Verify it belongs to the current user
- If validation fails → clear the stale ID and create a new blueprint

```typescript
// Check blueprint exists and belongs to user
const { data: existingBlueprint } = await supabase
  .from('blueprint_generator')
  .select('id, user_id, status')
  .eq('id', workingBlueprintId)
  .single();

if (!existingBlueprint || existingBlueprint.user_id !== userId) {
  // Clear stale ID and retry
  setBlueprintId('');
  setTimeout(() => void save(), 100);
  return;
}
```

### 2. **Fixed UPDATE Query**
Changed from `.select().single()` to just `.select()`:

```typescript
// Before (causes error when 0 rows):
.select().single()

// After (returns empty array when 0 rows):
.select()
```

### 3. **Handle 0 Rows Gracefully**
If update matches 0 rows:
```typescript
if (!data || data.length === 0) {
  console.error('[AutoSave] Update matched 0 rows');
  setBlueprintId(''); // Clear stale ID
  setTimeout(() => void save(), 100); // Retry to create new
  return;
}
```

### 4. **Enhanced Logging**
Added comprehensive logging to track every step:
- ✓ User authentication check
- ✓ Blueprint validation
- ✓ Insert/Update payload
- ✓ Response data
- ✓ Verification results

## What Happens Now

### First Time User Fills Form:
```
[AutoSave] Starting save for userId: xxx
[AutoSave] Supabase user confirmed: xxx
[AutoSave] No blueprint ID, searching for existing draft
[AutoSave] Creating new draft blueprint
[AutoSave] Created new draft with ID: yyy
[AutoSave] ✓ Verified saved data: { ... }
[AutoSave] Save completed successfully
```

### Subsequent Saves (Same Session):
```
[AutoSave] Starting save for userId: xxx
[AutoSave] Supabase user confirmed: xxx
[AutoSave] Updating existing draft: yyy
[AutoSave] Successfully updated draft
[AutoSave] ✓ Verified saved data: { ... }
[AutoSave] Save completed successfully
```

### When Blueprint ID is Stale:
```
[AutoSave] Starting save for userId: xxx
[AutoSave] Blueprint does not exist: zzz
[AutoSave] Cleared stale blueprint ID, will create new on next save
[AutoSave] Creating new draft blueprint
[AutoSave] Created new draft with ID: new-yyy
[AutoSave] Save completed successfully
```

## Testing

### 1. **Fill Out Form** 
Watch console for:
```
[AutoSave] Created new draft with ID: <uuid>
```

### 2. **Check Database**
```sql
SELECT id, questionnaire_version, static_answers, updated_at
FROM blueprint_generator
WHERE user_id = '<your-user-id>'
AND status = 'draft'
ORDER BY updated_at DESC;
```

Should show:
- ✅ `questionnaire_version = 2`
- ✅ `static_answers` with nested JSON
- ✅ `updated_at` updating in real-time

### 3. **Verify Real-Time Updates**
1. Fill out a field
2. Wait 2 seconds
3. Check console: `[AutoSave] Save completed successfully`
4. Refresh database query → data should be there

## Data Structure Being Saved

The auto-save now correctly saves the V2 schema:

```json
{
  "version": 2,
  "role": "Instructional Designer",
  "organization": {
    "name": "Acme Corp",
    "industry": "Technology",
    "size": "201-1000",
    "regions": ["North America"]
  },
  "learnerProfile": {
    "audienceSize": "51-200",
    "priorKnowledge": 3,
    "motivation": ["career", "performance"],
    "environment": ["office", "remote"],
    "devices": ["desktop", "laptop"],
    "timeAvailable": 5,
    "accessibility": []
  },
  "learningGap": {
    "description": "Team needs better project management skills",
    "gapType": "skill",
    "urgency": 4,
    "impact": 5,
    "impactAreas": ["productivity", "quality"],
    "bloomsLevel": "apply",
    "objectives": "Improve project completion rates by 30%"
  },
  "resources": { /* ... */ },
  "deliveryStrategy": { /* ... */ },
  "constraints": [],
  "evaluation": { /* ... */ }
}
```

## Key Features

✅ **Auto-recovery** - Automatically creates new blueprint if ID is stale  
✅ **Real-time saving** - Saves 2 seconds after last change  
✅ **User validation** - Verifies Supabase authentication  
✅ **Blueprint validation** - Checks ownership before update  
✅ **Comprehensive logging** - Easy to debug any issues  
✅ **Error handling** - Graceful fallback on any error  
✅ **Data verification** - Confirms save was successful  

## Troubleshooting

### If saves still fail:

1. **Check Console Logs**
   - Look for the specific error in `[AutoSave]` logs
   
2. **Verify User is Logged In**
   ```javascript
   // In console:
   const { data } = await supabase.auth.getUser();
   console.log('User:', data.user?.id);
   ```

3. **Check RLS Policies**
   ```sql
   -- Should return your draft blueprints
   SELECT * FROM blueprint_generator 
   WHERE user_id = auth.uid() 
   AND status = 'draft';
   ```

4. **Clear Stale State**
   ```javascript
   // In console:
   localStorage.clear();
   // Then refresh page
   ```

## Success Indicators

You'll know it's working when you see:
- 🔄 "Saving..." appears briefly after typing
- ✅ "All changes saved" appears after 2 seconds
- 📝 Console shows `[AutoSave] Save completed successfully`
- 💾 Database query shows updated data with current timestamp

The issue is now **completely resolved**! 🎉

---

## Additional Fix: Dynamic Questions Generation

### Problem
After fixing auto-save, dynamic questions generation was failing with validation errors:
```
Invalid input: expected object, received undefined
```

### Root Cause
The `generate-dynamic-questions` API endpoint was still expecting **V1 flat string format**, but auto-save now correctly saves **V2 nested object format**:

- **V1 (old):** `{ role: "string", organization: "string", learningGap: "string" }`
- **V2 (new):** `{ role: "string", organization: { name, industry, size }, learningGap: { description, gapType, urgency } }`

### Solution
Updated the endpoint to detect and handle both V2 and V1 schemas:

```typescript
// Detect V2 schema
const isV2 = sa.version === 2 && typeof sa.organization === 'object';

if (isV2) {
  // Extract from nested objects
  const org = sa.organization as Record<string, unknown>;
  const learningGap = sa.learningGap as Record<string, unknown>;
  
  canonicalInput = {
    role: sa.role,
    organization: org?.name,
    learningGap: learningGap?.description || learningGap?.objectives,
    // ... etc
  };
} else {
  // Legacy V1 flat extraction
  // ... fallback logic
}
```

### What This Means
- ✅ V2 questionnaires now generate dynamic questions correctly
- ✅ Legacy V1 data still works (backward compatible)
- ✅ Proper extraction of nested data from V2 schema
- ✅ Console logs show which schema version is being used

The complete workflow now works end-to-end! 🎉
