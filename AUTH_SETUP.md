# Authentication Setup Guide

## Current Status ✅

Your authentication is now configured for **local development** with Supabase.

## Fixed Issues

### 1. ✅ Google OAuth Configuration
- Added Google OAuth provider to `supabase/config.toml`
- Configured with environment variable support
- Set `skip_nonce_check = true` for local development

### 2. ✅ Better Error Messages
- Improved error handling for invalid credentials
- Clear messages for provider configuration issues
- Console logging for debugging

## Important: You're Using Local Supabase

Your app is currently pointing to **local Supabase** (http://127.0.0.1:54321), not a cloud instance.

### What This Means:

1. **Separate Database**: Local database is completely separate from any production/cloud database
2. **Need to Create New Accounts**: You must create new user accounts in your local database
3. **Data Not Synced**: Changes in local don't affect production

## How to Use Authentication

### Option 1: Email/Password Login (Recommended for Local Dev)

1. **First Time?** Go to `/signup` and create a new account
   - Use any email (doesn't need to be real for local dev)
   - Email confirmation is **disabled** in local config
   - Account is created instantly

2. **Login** at `/login` with the credentials you just created

### Option 2: Google OAuth (Requires Setup)

To enable Google OAuth, you need to:

1. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://127.0.0.1:54321/auth/v1/callback`
     - `http://localhost:3000/auth/callback`

2. **Add to .env.local**:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Restart Supabase**:
   ```bash
   supabase stop
   supabase start
   ```

## Troubleshooting

### "Invalid login credentials"

**Cause**: You're trying to use credentials that don't exist in the local database.

**Solution**:
- Go to `/signup` and create a new account
- Or check Supabase Studio at http://127.0.0.1:54323 to see existing users

### "Google OAuth - provider is not enabled"

**Cause**: Google OAuth credentials not configured or Supabase not restarted.

**Solution**:
1. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`
2. Run `supabase stop && supabase start`
3. Or use email/password authentication instead

### Check Existing Users

1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to Authentication > Users
3. See all users in your local database

### Reset Local Database

If you want to start fresh:
```bash
supabase db reset
```

**Warning**: This deletes all local data!

## Production Deployment

When deploying to production, you'll need to:

1. **Create a Supabase Cloud Project**: https://supabase.com
2. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Configure OAuth in Supabase Dashboard**
4. **Run Migrations**: `supabase db push`

## Quick Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# View status
supabase status

# Open Studio
open http://127.0.0.1:54323

# View logs
supabase logs

# Reset database
supabase db reset
```

## File Locations

- **Supabase Config**: `supabase/config.toml`
- **Environment Variables**: `frontend/.env.local`
- **Migrations**: `supabase/migrations/`
- **Auth Components**: `frontend/components/auth/`

## Need Help?

1. Check browser console for detailed error messages
2. Check Supabase logs: `supabase logs`
3. Verify config: `supabase status`
4. Open Supabase Studio: http://127.0.0.1:54323
