# How to Update All Blueprint Titles

## Quick Guide to Run the Migration

### Option 1: Via Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste the Migration**
   - Open `supabase/migrations/20250930_update_blueprint_titles.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter` (Cmd+Enter on Mac)
   - You should see: "Success. X rows affected"

5. **Verify the Results**
   - The query will show how many blueprints were updated
   - Refresh your app to see the new titles

---

### Option 2: Via Terminal (If you have Supabase CLI)

```bash
# From project root
cd /home/jitin-m-nair/Desktop/smartslate-polaris-v3

# Run the migration
supabase db push

# Or manually apply the specific file
supabase db execute -f supabase/migrations/20250930_update_blueprint_titles.sql
```

---

### Option 3: Via psql (Direct Database Access)

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Then run
\i supabase/migrations/20250930_update_blueprint_titles.sql

# Or in one line
psql "your-connection-string" -f supabase/migrations/20250930_update_blueprint_titles.sql
```

---

## What Will Happen?

### Before:
```
"Jitin's Polaris Starmap for Acme Corp - Sales Training..."
"Generated Blueprint"
"Starmap for Professional Development"
"My Custom Blueprint"
... (any other titles)
```

### After:
```
"Starmap for Professional Development and Career Growth Path"
"Starmap for Professional Development and Career Growth Path"
"Starmap for Professional Development and Career Growth Path"
"Starmap for Professional Development and Career Growth Path"
... (all titles updated)
```

---

## Expected Results

After running the migration, you should see:
- ✅ All blueprints have the new standard title
- ✅ No NULL or empty titles
- ✅ Consistent naming across your entire application
- ✅ Old titles like "Jitin's Polaris Starmap..." are updated

---

## Verify It Worked

1. **Refresh your browser** after running the migration
2. **Navigate to any blueprint** 
3. **Check the header** - should show: "Starmap for Professional Development and Career Growth Path"
4. **Check the dashboard** - all blueprint cards should show the new title

---

## If You Want to Keep Old Titles

If you prefer to keep the old custom titles, **DON'T run this migration**. 

Instead, only new blueprints will use the new title format automatically.

---

## Rollback (If Needed)

If you backed up titles (uncomment the backup lines in the migration), you can restore:

```sql
-- Restore from backup
UPDATE blueprint_generator
SET title = title_backup
WHERE title_backup IS NOT NULL;
```

---

## Quick Copy-Paste SQL

If you just want to copy-paste into Supabase SQL Editor:

```sql
-- Update ALL blueprints to new standard title
UPDATE blueprint_generator
SET title = 'Starmap for Professional Development and Career Growth Path'
WHERE title != 'Starmap for Professional Development and Career Growth Path' 
   OR title IS NULL;

-- Verify results
SELECT COUNT(*) as total_blueprints, 
       title
FROM blueprint_generator
GROUP BY title;
```

---

## Need Help?

If you encounter errors:
1. Check your Supabase connection
2. Verify you have permission to update the table
3. Check the table name is correct (should be `blueprint_generator`)
4. Ensure the `title` column exists

---

**Estimated Time:** 30 seconds  
**Difficulty:** Easy  
**Rollback:** Possible (if backup created)  
**Impact:** All existing blueprints
