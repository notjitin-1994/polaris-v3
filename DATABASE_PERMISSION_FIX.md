# Database Permission Error Fix - User Profile Creation

## Issue Summary

**Error**: `Failed to create profile: permission denied for table users`

**Location**: `/home/jitin-m-nair/Desktop/polaris-v3/frontend/lib/hooks/useUserProfile.ts:65:21`

**Root Cause**: When authenticated users tried to create their own profile by directly inserting into the `user_profiles` table from the client-side, the database's foreign key constraint validation tried to access the `auth.users` table to verify the `user_id` exists. However, RLS policies prevent regular authenticated users from accessing the `auth.users` table, resulting in a permission denied error.

## Technical Analysis

### The Permission Flow

1. **Client-Side Code** (`useUserProfile.ts`) attempted to:
   ```typescript
   await supabase.from('user_profiles').insert({
     user_id: user.id,
     full_name: displayName,
     first_name: firstName,
     last_name: lastName,
   })
   ```

2. **Foreign Key Constraint** in the database:
   ```sql
   user_profiles.user_id references auth.users(id) on delete cascade
   ```

3. **RLS Restriction**: When PostgreSQL validates the foreign key, it needs to SELECT from `auth.users` table to verify the referenced ID exists. However, authenticated users don't have SELECT permission on `auth.users` (only on `public.user_profiles`).

4. **Result**: Permission denied error, even though the RLS policy allows inserting into `user_profiles` where `user_id = auth.uid()`.

### Why the Trigger Didn't Run

The database has a trigger `on_auth_user_created` (from migration `0026`) that should automatically create user profiles when new users sign up:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

However, in some cases:
- User was created before the trigger was added
- Trigger might have failed silently
- Profile was deleted manually
- Development/testing scenarios

## Solution Implemented

### 1. Created Secure Database Function (Migration 0031)

Created a `SECURITY DEFINER` function that bypasses RLS for FK validation:

```sql
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS public.user_profiles AS $$
-- Function runs with elevated privileges to bypass RLS for FK validation
-- but still validates that user can only create their own profile
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Security Features**:
- Validates user can only create their own profile: `IF p_user_id != auth.uid() THEN RAISE EXCEPTION`
- Returns existing profile if it already exists (idempotent)
- Sets proper default values for subscription tier, limits, and metadata
- Grants EXECUTE only to authenticated users

### 2. Updated Client-Side Code

Changed `useUserProfile.ts` to use the secure RPC function:

**Before**:
```typescript
const { data: newProfile, error: createError } = await supabase
  .from('user_profiles')
  .insert({ user_id, full_name, first_name, last_name })
  .select()
  .single();
```

**After**:
```typescript
const { data: newProfile, error: createError } = await supabase
  .rpc('create_user_profile', {
    p_user_id: user.id,
    p_full_name: displayName,
    p_first_name: firstName,
    p_last_name: lastName,
    p_avatar_url: null,
  });
```

### 3. Updated TypeScript Types

Added type definitions for the new RPC functions in `types/supabase.ts`:

```typescript
create_user_profile: {
  Args: {
    p_user_id: string;
    p_full_name?: string | null;
    p_first_name?: string | null;
    p_last_name?: string | null;
    p_avatar_url?: string | null;
  };
  Returns: Database['public']['Tables']['user_profiles']['Row'];
};
```

### 4. Created Helper Function

Also created `get_or_create_user_profile()` for convenience - it returns existing profile or creates it if missing.

## Files Changed

### New Files
- `/home/jitin-m-nair/Desktop/polaris-v3/supabase/migrations/0031_fix_user_profile_creation_permissions.sql`

### Modified Files
1. `/home/jitin-m-nair/Desktop/polaris-v3/frontend/lib/hooks/useUserProfile.ts`
   - Changed INSERT operation to RPC call
   - Line 54-61: Now uses `supabase.rpc('create_user_profile', {...})`

2. `/home/jitin-m-nair/Desktop/polaris-v3/frontend/types/supabase.ts`
   - Added type definitions for `create_user_profile` function
   - Added type definitions for `get_or_create_user_profile` function
   - Lines 148-167: New function type definitions

## Why This Fix is Safe

### 1. No Breaking Changes
- Existing functionality remains intact
- Users with existing profiles continue to work normally
- The change only affects the profile creation path when a profile doesn't exist

### 2. Security Maintained
- Function validates user can only create their own profile
- RLS policies remain enabled and active
- All existing authentication and authorization checks remain in place
- Function runs with `SECURITY DEFINER` but has explicit security validation

### 3. Data Integrity Preserved
- All default values match the existing trigger's behavior
- Subscription tiers, limits, and metadata are properly initialized
- Foreign key constraints remain enforced
- No duplicate profiles can be created (checked before insert)

### 4. Backward Compatible
- Existing trigger `on_auth_user_created` continues to work
- Function only creates profile if it doesn't exist (idempotent)
- No changes to UPDATE, DELETE, or SELECT operations
- Server-side code using `upsertUserProfile` unaffected

### 5. Proper Error Handling
- Function raises clear exceptions for invalid operations
- Client-side error handling remains unchanged
- Logs continue to show meaningful error messages

## Testing Checklist

To verify the fix works correctly:

- [ ] **New User Signup**: New users automatically get profiles created by trigger
- [ ] **Missing Profile Recovery**: Users without profiles can create them via the hook
- [ ] **Existing Profiles**: Users with existing profiles can still read/update them
- [ ] **Profile Updates**: The `updateProfile` function continues to work
- [ ] **Avatar Uploads**: The `uploadAvatar` function continues to work
- [ ] **Settings Page**: Profile section displays and updates correctly
- [ ] **Security**: Users cannot create profiles for other users
- [ ] **Idempotency**: Calling create multiple times doesn't create duplicates

## Migration Instructions

To apply this fix to your Supabase instance:

1. **Apply the migration**:
   ```bash
   # If using Supabase CLI
   supabase db push

   # Or apply migration manually via Supabase Dashboard
   # SQL Editor -> New Query -> Paste migration 0031 content -> Run
   ```

2. **Verify the function exists**:
   ```sql
   SELECT proname, prosecdef
   FROM pg_proc
   WHERE proname = 'create_user_profile';
   ```

3. **Test the function**:
   ```sql
   SELECT * FROM public.create_user_profile(
     auth.uid(),
     'Test User',
     'Test',
     'User',
     NULL
   );
   ```

4. **Verify permissions**:
   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.routine_privileges
   WHERE routine_name = 'create_user_profile';
   ```

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting the code changes in `useUserProfile.ts` to use direct INSERT
2. Ensuring the trigger `on_auth_user_created` is working
3. Manually creating missing profiles using the service role key

However, the new approach is superior because it handles edge cases where the trigger doesn't run.

## Additional Improvements Made

The migration also:
- Fixed missing default values for existing user profiles
- Ensured all profiles have required blueprint tracking fields
- Added proper subscription metadata for existing users
- Created comprehensive inline documentation

## References

- **PRD**: `docs/prds/user-roles-and-subscriptions.txt`
- **Related Migrations**:
  - `0002_user_profiles.sql` (original table creation)
  - `0026_add_subscription_and_roles.sql` (added trigger)
  - `0027_add_blueprint_usage_tracking.sql` (added blueprint limits)
  - `0030_create_avatars_storage.sql` (avatar storage)

## Performance Considerations

- Function execution is fast (single INSERT with defaults)
- No additional database round-trips
- SECURITY DEFINER functions are slightly slower but negligible for this use case
- Idempotency check adds one SELECT but prevents duplicate inserts
