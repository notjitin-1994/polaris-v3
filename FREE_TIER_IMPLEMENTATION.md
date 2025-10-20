# Free Tier Implementation - Backend Summary

## Overview
Implemented a complete backend system for enforcing free tier limits on blueprint creation and saving. Free tier users (default for all new users) get 2 blueprint creations and 2 blueprint saves.

## Database Schema

### User Profile Fields
Already implemented in migrations `0026_add_subscription_and_roles.sql` and `0027_add_blueprint_usage_tracking.sql`:

- `subscription_tier` (TEXT): User's subscription plan (default: 'explorer')
- `user_role` (TEXT): User's role (default: 'explorer')
- `blueprint_creation_count` (INTEGER): Number of blueprints created
- `blueprint_saving_count` (INTEGER): Number of blueprints saved (completed)
- `blueprint_creation_limit` (INTEGER): Maximum blueprints that can be created (default: 2)
- `blueprint_saving_limit` (INTEGER): Maximum blueprints that can be saved (default: 2)
- `blueprint_usage_metadata` (JSONB): Additional usage tracking metadata

### Database Functions

#### `increment_blueprint_creation_count(p_user_id UUID)`
- Increments the creation count for a user
- Checks if user is exempt from limits
- Returns `FALSE` if limit exceeded, `TRUE` if successful
- Located in: `supabase/migrations/0027_add_blueprint_usage_tracking.sql`

#### `increment_blueprint_saving_count(p_user_id UUID)`
- Increments the saving count for a user
- Checks if user is exempt from limits
- Returns `FALSE` if limit exceeded, `TRUE` if successful
- Located in: `supabase/migrations/0027_add_blueprint_usage_tracking.sql`

#### `get_blueprint_usage_info(p_user_id UUID)`
- Returns current usage information for a user
- Includes counts, limits, exemption status
- Located in: `supabase/migrations/0027_add_blueprint_usage_tracking.sql`

## Backend Implementation

### Service Layer: `BlueprintUsageService`
**Location:** `frontend/lib/services/blueprintUsageService.ts`

Methods:
- `canCreateBlueprint(supabase, userId)` - Check if user can create a new blueprint
- `canSaveBlueprint(supabase, userId)` - Check if user can save/complete a blueprint
- `incrementCreationCount(supabase, userId)` - Increment creation counter
- `incrementSavingCount(supabase, userId)` - Increment saving counter
- `getBlueprintUsageInfo(supabase, userId)` - Get current usage stats
- `exemptUserFromLimits(supabase, userId, reason)` - Exempt user from limits (admin)

### API Endpoints

#### 1. Questionnaire Save: `POST /api/questionnaire/save`
**Location:** `frontend/app/api/questionnaire/save/route.ts`

**Changes Made:**
- ✅ Added import for `BlueprintUsageService`
- ✅ Check limits BEFORE creating new blueprints
- ✅ Increment creation count AFTER successful blueprint creation
- ✅ Returns HTTP 429 with `limitExceeded: true` when limit is reached
- ✅ Handles both direct creation and fallback creation paths

**Flow:**
1. User tries to save questionnaire without a blueprintId → New blueprint creation
2. Check if user can create blueprint using `canCreateBlueprint()`
3. If limit exceeded → Return 429 error with message
4. If allowed → Create blueprint
5. Increment creation count using `incrementCreationCount()`

#### 2. Blueprint Generation: `POST /api/blueprints/generate`
**Location:** `frontend/app/api/blueprints/generate/route.ts`

**Existing Implementation:**
- ✅ Already checks limits using `canSaveBlueprint()` before generation
- ✅ Already increments saving count using `incrementSavingCount()` after success
- ✅ Returns HTTP 429 when limit is reached

**Flow:**
1. User tries to generate a blueprint
2. Check if user can save blueprint using `canSaveBlueprint()`
3. If limit exceeded → Return 429 error
4. If allowed → Generate blueprint
5. Increment saving count using `incrementSavingCount()`

#### 3. NEW: User Usage Info: `GET /api/user/usage`
**Location:** `frontend/app/api/user/usage/route.ts`

**Purpose:** Provides frontend with current usage statistics

**Response:**
```json
{
  "success": true,
  "usage": {
    "creationCount": 1,
    "savingCount": 0,
    "creationLimit": 2,
    "savingLimit": 2,
    "creationRemaining": 1,
    "savingRemaining": 2,
    "isExempt": false,
    "exemptionReason": null,
    "subscriptionTier": "explorer"
  }
}
```

## Error Responses

### When Creation Limit Exceeded
**Status:** 429 Too Many Requests
```json
{
  "success": false,
  "error": "You've reached your limit of 2 blueprint creations. Upgrade your subscription to create more.",
  "limitExceeded": true
}
```

### When Saving Limit Exceeded
**Status:** 429 Too Many Requests
```json
{
  "success": false,
  "error": "You've reached your limit of 2 blueprint saves. Upgrade your subscription to save more."
}
```

## Free Tier Behavior

### Default User Creation
When a new user signs up:
1. Automatically assigned `subscription_tier: 'explorer'` (free tier)
2. `blueprint_creation_limit: 2`
3. `blueprint_saving_limit: 2`
4. `blueprint_creation_count: 0`
5. `blueprint_saving_count: 0`

### Limit Enforcement
- **Creation Limit:** Enforced when user tries to save a NEW questionnaire (creates draft blueprint)
- **Saving Limit:** Enforced when user tries to GENERATE/complete a blueprint
- Limits are checked BEFORE the operation
- Counters are incremented AFTER successful operation

### Exemptions
Certain users can be exempt from limits:
- Developer accounts (e.g., not.jitin@gmail.com - auto-exempted)
- Admin-exempted users via `exempt_user_from_blueprint_limits()` function

## Testing the Implementation

### 1. Test Creation Limit
```bash
# Create a test user and create 3 blueprints
# First 2 should succeed, 3rd should return 429
curl -X POST http://localhost:3000/api/questionnaire/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"staticAnswers": {"test": "data"}}'
```

### 2. Test Saving Limit
```bash
# Generate 3 blueprints with a test user
# First 2 should succeed, 3rd should return 429
curl -X POST http://localhost:3000/api/blueprints/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"blueprintId": "<uuid>"}'
```

### 3. Check User Usage
```bash
curl -X GET http://localhost:3000/api/user/usage \
  -H "Authorization: Bearer <token>"
```

## Database Verification Queries

### Check User's Current Usage
```sql
SELECT * FROM get_blueprint_usage_info('<user_id>'::UUID);
```

### View All User Limits
```sql
SELECT
  user_id,
  subscription_tier,
  blueprint_creation_count,
  blueprint_creation_limit,
  blueprint_saving_count,
  blueprint_saving_limit,
  (blueprint_usage_metadata->>'exempt_from_limits')::boolean as is_exempt
FROM user_profiles;
```

### Manually Reset User Counts (for testing)
```sql
UPDATE user_profiles
SET
  blueprint_creation_count = 0,
  blueprint_saving_count = 0
WHERE user_id = '<user_id>';
```

### Exempt a User from Limits
```sql
SELECT exempt_user_from_blueprint_limits('<user_id>'::UUID, 'Testing purposes');
```

## Next Steps for Frontend

The backend is ready! Frontend needs to:

1. **Display Usage Stats:**
   - Call `GET /api/user/usage` to get current usage
   - Show "X of Y blueprints created/saved" in UI
   - Show upgrade prompt when approaching limits

2. **Handle Limit Errors:**
   - Catch 429 errors from creation/saving endpoints
   - Show user-friendly modal: "You've reached your free tier limit"
   - Provide upgrade CTA button

3. **Preemptive Checks:**
   - Disable "Create Blueprint" button when creation limit reached
   - Disable "Generate" button when saving limit reached
   - Show tooltip explaining why button is disabled

4. **Usage Dashboard:**
   - Create a settings/usage page showing:
     - Current plan (Free Tier/Explorer)
     - Blueprints created: X / 2
     - Blueprints saved: X / 2
     - Upgrade options

## Files Modified

1. ✅ `frontend/app/api/questionnaire/save/route.ts` - Added creation limit checks
2. ✅ `frontend/lib/services/blueprintUsageService.ts` - Fixed duplicate export
3. ✅ `frontend/app/api/user/usage/route.ts` - NEW endpoint for frontend
4. ✅ `.env` - Fixed malformed line (unrelated but blocking deployment)

## Migrations Applied

All necessary migrations already exist and have been applied:
- ✅ `0026_add_subscription_and_roles.sql`
- ✅ `0027_add_blueprint_usage_tracking.sql`
- ✅ `0031_fix_user_profile_creation_permissions.sql`

## Security Considerations

- ✅ All checks happen server-side (cannot be bypassed by frontend)
- ✅ Database functions use `SECURITY DEFINER` for proper permissions
- ✅ RLS policies ensure users can only access their own data
- ✅ Exemption function requires service role (admin only)
- ✅ Atomic counter increments prevent race conditions

## Logging

All operations are logged with structured logging:
- `questionnaire.save.limit_exceeded` - Creation limit hit
- `blueprints.generate.limit_exceeded` - Saving limit hit
- `questionnaire.save.creation_count_incremented` - Counter updated
- `blueprints.generate.saving_count_incremented` - Counter updated
- `user.usage.success` - Usage info retrieved

## Subscription Tiers (Future)

Current limits are for 'explorer' (free tier). Future tiers can be added by:
1. Updating `subscription_tier` in user profile
2. Updating `blueprint_creation_limit` and `blueprint_saving_limit`
3. No code changes needed - limits are data-driven!

Example tiers:
- Explorer (Free): 2 creations, 2 saves
- Navigator: 15 creations, 30 saves
- Voyager: Unlimited creations, 50 saves
- Enterprise: Unlimited everything
