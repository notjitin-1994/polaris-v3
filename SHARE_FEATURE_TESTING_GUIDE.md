# Public Share Feature - Testing Guide

## 🚀 Quick Start (Step-by-Step)

### Step 1: Run Database Migration
First, you need to add the `share_token` column to the database:

```bash
cd /home/jitin-m-nair/Desktop/smartslate-polaris-v3

# If using Supabase CLI locally
cd supabase
supabase db push

# OR manually apply the migration in Supabase Dashboard
# Go to: SQL Editor → New Query → Paste the contents of:
# supabase/migrations/0022_add_share_token.sql
```

### Step 2: Restart Development Server
The new API routes and pages need to be loaded:

```bash
# In your frontend directory
cd frontend
npm run dev

# OR if already running, stop (Ctrl+C) and restart
```

### Step 3: Hard Refresh Browser
Clear any cached JavaScript:

**Chrome/Edge/Brave:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- `Cmd + Option + R`

### Step 4: Test the Share Feature

1. **Open a Blueprint**
   - Go to your dashboard (`/`)
   - Click on any completed blueprint
   - You should see the blueprint page with header buttons

2. **Click the Share Button**
   - Look for the Share icon (🔗) button in the top right
   - It should be between the Edit (✏️) and Download (⬇️) buttons
   - Click it

3. **Expected Result - Share Menu Opens**
   You should see a dropdown menu with two options:
   ```
   ┌─────────────────────────────┐
   │ 🔗 Create Public Link       │
   ├─────────────────────────────┤
   │ 📋 Copy Private Link        │
   └─────────────────────────────┘
   ```

4. **Click "Create Public Link"**
   - Should show loading spinner briefly
   - Then a beautiful modal should appear

5. **Expected Result - Share Dialog**
   You should see a glassmorphic modal with:
   - ✨ Share icon at the top (animated)
   - "Public Share Link Created" heading
   - Input field with the shareable URL
   - "Copy" button next to URL
   - "Preview Public Dashboard" link button
   - Privacy information box
   - "Close" button at bottom

6. **Copy the Link**
   - Click the "Copy" button
   - Toast notification: "Share link copied to clipboard"

7. **Test Public Access**
   - Open the link in an incognito/private window
   - OR send it to another device
   - You should see the beautiful public dashboard at `/share/[token]`
   - No login required!

---

## 🐛 Troubleshooting

### Problem: Share button still copies link immediately

**Solution:**
1. Hard refresh the page (see Step 3 above)
2. Check browser console for errors (F12 → Console tab)
3. Verify the file was saved: `/frontend/app/blueprint/[id]/page.tsx`

### Problem: "Failed to generate share link" error

**Possible Causes:**
1. Database migration not run
2. API route not loaded
3. Authentication issue

**Solution:**
```bash
# Check if migration file exists
ls -la supabase/migrations/0022_add_share_token.sql

# Restart dev server
cd frontend
npm run dev
```

### Problem: Public share link shows 404

**Possible Causes:**
1. Page file not created
2. Routing not working

**Solution:**
```bash
# Verify the public share page exists
ls -la frontend/app/share/[token]/page.tsx

# Restart dev server
cd frontend
npm run dev
```

### Problem: RLS policy error

**Error Message:** "new row violates row-level security policy"

**Solution:**
The RLS policy needs the `share_token` to be set. This is automatically handled by the API, but if you see this error:

```sql
-- Run this in Supabase SQL Editor
-- to check if the policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'blueprint_generator' 
AND policyname = 'Public can view shared blueprints';
```

---

## ✅ Success Checklist

Use this to verify everything is working:

- [ ] Database migration applied successfully
- [ ] Development server restarted
- [ ] Browser hard-refreshed
- [ ] Share button opens menu (doesn't copy immediately)
- [ ] "Create Public Link" option visible in menu
- [ ] Clicking "Create Public Link" shows modal
- [ ] Modal displays shareable URL
- [ ] Copy button works and shows toast
- [ ] Public URL opens in incognito without login
- [ ] Public dashboard displays analytics correctly
- [ ] Public dashboard has SmartSlate branding
- [ ] "Create Your Own" CTA buttons work

---

## 🎬 Visual Reference

### What the Share Menu Should Look Like:
```
┌──────────────────────────────────┐
│  🔄 Create Public Link           │  ← New option (with spinner when loading)
├──────────────────────────────────┤
│  📋 Copy Private Link            │  ← Old behavior (auth required link)
└──────────────────────────────────┘
```

### What the Share Dialog Should Look Like:
```
╔════════════════════════════════════════╗
║           [Animated Share Icon]        ║
║     Public Share Link Created          ║
║  Anyone with this link can view...     ║
║                                        ║
║  Share Link:                           ║
║  ┌────────────────────────┬────────┐  ║
║  │ https://app.com/...    │ Copy   │  ║
║  └────────────────────────┴────────┘  ║
║                                        ║
║  ┌────────────────────────────────┐   ║
║  │ 🔗 Preview Public Dashboard    │   ║
║  └────────────────────────────────┘   ║
║                                        ║
║  ℹ️ Note: This link provides...        ║
║                                        ║
║  ┌────────────────────────────────┐   ║
║  │         Close                  │   ║
║  └────────────────────────────────┘   ║
╚════════════════════════════════════════╝
```

---

## 📸 Quick Visual Test

### Current Behavior (Before Fix):
- Click Share → Link copied immediately ❌

### Expected Behavior (After Fix):
- Click Share → Menu opens with 2 options ✅
- Click "Create Public Link" → Beautiful modal appears ✅
- Click "Copy" → Link copied to clipboard ✅
- Open link in incognito → Public dashboard loads ✅

---

## 🔧 Manual Verification Commands

```bash
# 1. Check if all files exist
ls -la supabase/migrations/0022_add_share_token.sql
ls -la frontend/app/api/blueprints/share/generate/route.ts
ls -la frontend/app/api/blueprints/share/[token]/route.ts
ls -la frontend/app/share/[token]/page.tsx

# 2. Check if modified file has the new code
grep -n "handleGenerateShareLink" frontend/app/blueprint/[id]/page.tsx
grep -n "showShareDialog" frontend/app/blueprint/[id]/page.tsx

# 3. Restart Next.js dev server
cd frontend
pkill -f "next dev"
npm run dev
```

---

## 🎉 When Everything Works

You'll know it's working when:

1. **Share button** opens a menu (not immediately copying)
2. **"Create Public Link"** option appears in the menu
3. **Beautiful modal** with glassmorphic design appears
4. **Public link** opens in incognito without authentication
5. **Public dashboard** shows full analytics with SmartSlate branding

Good luck! 🚀

