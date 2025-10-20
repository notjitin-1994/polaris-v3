# Quick Fix Guide: User Profile Permission Error

## Problem
```
Failed to create profile: permission denied for table users
```

## Solution in 3 Steps

### Step 1: Apply Database Migration

**Option A - Using Supabase CLI** (Recommended):
```bash
cd /home/jitin-m-nair/Desktop/polaris-v3
supabase db push
```

**Option B - Using Supabase Dashboard**:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the entire contents of:
   `/home/jitin-m-nair/Desktop/polaris-v3/supabase/migrations/0031_fix_user_profile_creation_permissions.sql`
5. Click "Run"
6. Verify you see "Success" message

### Step 2: Verify Migration Succeeded

Run this query in Supabase SQL Editor:
```sql
-- Should return 2 rows
SELECT proname, prosecdef
FROM pg_proc
WHERE proname IN ('create_user_profile', 'get_or_create_user_profile');
```

Expected output:
```
proname                       | prosecdef
------------------------------|----------
create_user_profile           | true
get_or_create_user_profile    | true
```

### Step 3: Deploy Frontend Changes

The following files have been updated and need to be deployed:

1. `frontend/lib/hooks/useUserProfile.ts` - Uses new secure function
2. `frontend/types/supabase.ts` - Adds TypeScript types for RPC calls

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to your hosting platform (Vercel, etc.)
# The exact command depends on your deployment setup
```

## Verify It Works

### Test 1: Check Function Exists
```sql
SELECT * FROM public.create_user_profile(
  auth.uid(),
  'Test User',
  'Test',
  'User',
  NULL
);
```

### Test 2: Login as User Without Profile
1. Log in to your application
2. Navigate to Settings page
3. Profile should load without errors
4. Check browser console - should see no permission errors

### Test 3: New User Signup
1. Create a new account
2. Profile should be created automatically
3. Settings page should work immediately

## Rollback (if needed)

If you need to rollback:

```sql
-- Remove the functions
DROP FUNCTION IF EXISTS public.create_user_profile;
DROP FUNCTION IF EXISTS public.get_or_create_user_profile;
```

Then revert code changes:
```bash
git checkout HEAD -- frontend/lib/hooks/useUserProfile.ts
git checkout HEAD -- frontend/types/supabase.ts
```

## What Changed

### Before
- Client tried to INSERT directly into `user_profiles`
- Foreign key validation failed due to RLS on `auth.users`

### After
- Client calls secure RPC function `create_user_profile`
- Function has SECURITY DEFINER privilege
- Function bypasses RLS for FK validation
- Function validates user can only create their own profile

## Files Modified

✅ Created:
- `supabase/migrations/0031_fix_user_profile_creation_permissions.sql` (new migration)

✅ Updated:
- `frontend/lib/hooks/useUserProfile.ts` (lines 47-61 changed)
- `frontend/types/supabase.ts` (added RPC function types)

## Need Help?

See detailed documentation:
- `FIX_SUMMARY_USER_PROFILE_PERMISSIONS.md` - Full investigation report
- `DATABASE_PERMISSION_FIX.md` - Technical details and testing

## Summary

This fix resolves the "permission denied for table users" error by:
1. Creating a secure PostgreSQL function that safely creates user profiles
2. Updating the frontend to use this function instead of direct INSERT
3. Maintaining all security guarantees and existing functionality

**No breaking changes. Safe to deploy.**
