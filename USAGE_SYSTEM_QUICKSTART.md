# Blueprint Usage System - Quick Start Guide

Get up and running with the usage system in 5 minutes.

---

## Step 1: Add Usage Stats to Dashboard (2 minutes)

**File**: `/app/(auth)/dashboard/page.tsx`

```tsx
import { UsageStatsDisplay } from '@/components/usage/UsageStatsDisplay';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add this component */}
      <UsageStatsDisplay />

      {/* Your other dashboard components */}
      <QuickActionsCard />
    </div>
  );
}
```

**Result**: Real-time usage stats now display on dashboard ✓

---

## Step 2: Add Limit Handling to Questionnaire Save (3 minutes)

**File**: Your questionnaire save component

```tsx
import { useState } from 'react';
import { useUsageStats } from '@/lib/hooks/useUsageStats';
import { useUsageErrorHandler } from '@/lib/utils/usageErrorHandler';
import { LimitReachedModal } from '@/components/usage/LimitReachedModal';

export function YourQuestionnaireComponent() {
  // 1. Add usage tracking
  const { usage, refreshUsage, isCreationLimitReached } = useUsageStats();

  // 2. Add error handler
  const { handleError, showModal, limitType, closeModal } = useUsageErrorHandler();

  const handleSave = async (formData: any) => {
    // 3. Preemptive check (optional but recommended)
    if (isCreationLimitReached) {
      handleError({
        limitExceeded: true,
        error: 'Creation limit reached',
      });
      return;
    }

    try {
      const response = await fetch('/api/questionnaire/save', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // 4. Handle 429 errors
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitExceeded || response.status === 429) {
          handleError(errorData);
          return;
        }
        throw new Error(errorData.error);
      }

      // 5. Refresh usage on success
      await refreshUsage();

      // Navigate to next step
      router.push('/next-page');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save Questionnaire</button>

      {/* 6. Add modal */}
      <LimitReachedModal
        isOpen={showModal}
        onClose={closeModal}
        limitType={limitType}
        currentCount={usage?.creationCount || 0}
        limit={usage?.creationLimit || 2}
      />
    </>
  );
}
```

**Result**: Users see friendly modal when limit reached ✓

---

## Step 3: Add Preemptive Checks to Buttons (1 minute)

**Anywhere you have a "Create Blueprint" button:**

```tsx
import { useUsageStats } from '@/lib/hooks/useUsageStats';

function CreateButton() {
  const { isCreationLimitReached } = useUsageStats();

  return (
    <Button
      onClick={handleCreate}
      disabled={isCreationLimitReached}
    >
      {isCreationLimitReached ? 'Limit Reached' : 'Create Blueprint'}
    </Button>
  );
}
```

**Result**: Buttons automatically disable when limits reached ✓

---

## Complete Example (Copy-Paste Ready)

Here's a complete working example you can copy:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsageStats } from '@/lib/hooks/useUsageStats';
import { useUsageErrorHandler } from '@/lib/utils/usageErrorHandler';
import { LimitReachedModal } from '@/components/usage/LimitReachedModal';
import { ApproachingLimitBanner } from '@/components/usage/LimitReachedModal';
import { Button } from '@/components/ui/button';

export default function CreateBlueprintPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Usage tracking
  const {
    usage,
    refreshUsage,
    isCreationLimitReached,
    creationPercentage,
  } = useUsageStats();

  // Error handling
  const { handleError, showModal, limitType, closeModal } = useUsageErrorHandler();

  const handleCreate = async () => {
    // Preemptive check
    if (isCreationLimitReached) {
      handleError({
        limitExceeded: true,
        error: `You've reached your limit of ${usage?.creationLimit} blueprint creations.`,
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/questionnaire/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* your data */ }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitExceeded || response.status === 429) {
          handleError(errorData);
          return;
        }
        throw new Error(errorData.error);
      }

      const data = await response.json();
      await refreshUsage();
      router.push(`/success?id=${data.blueprintId}`);
    } catch (error: any) {
      if (!error.limitExceeded) {
        alert(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Warning banner when approaching limit */}
      {usage && creationPercentage >= 80 && creationPercentage < 100 && (
        <ApproachingLimitBanner
          limitType="creation"
          remaining={usage.creationRemaining}
        />
      )}

      {/* Your form/content here */}

      <Button
        onClick={handleCreate}
        disabled={saving || isCreationLimitReached}
      >
        {saving ? 'Creating...' : isCreationLimitReached ? 'Limit Reached' : 'Create Blueprint'}
      </Button>

      {/* Limit reached modal */}
      <LimitReachedModal
        isOpen={showModal}
        onClose={closeModal}
        limitType={limitType}
        currentCount={usage?.creationCount || 0}
        limit={usage?.creationLimit || 2}
      />
    </div>
  );
}
```

---

## Testing Your Implementation

### 1. Test Normal Flow
```bash
# 1. Login as a user
# 2. Go to dashboard → See usage stats showing 0/2
# 3. Create a blueprint → Stats update to 1/2
# 4. Create another → Stats update to 2/2
```

### 2. Test Limit Reached
```bash
# 1. Create 2 blueprints (reach limit)
# 2. Try to create a 3rd
# 3. Should see modal: "Blueprint Creation Limit Reached"
# 4. Click "View Pricing" → Navigate to /pricing
# 5. Click "Maybe Later" → Modal closes
```

### 3. Test Approaching Limit
```bash
# 1. Have 1 remaining creation (1/2 used)
# 2. Should see warning banner
# 3. Progress bar should be amber/yellow
```

---

## Common Integration Points

### Dashboard
```tsx
import { UsageStatsDisplay } from '@/components/usage/UsageStatsDisplay';

<UsageStatsDisplay />
```

### Sidebar
```tsx
import { CompactUsageDisplay } from '@/components/usage/UsageStatsDisplay';

<CompactUsageDisplay />
```

### Header/Toolbar
```tsx
import { UsageProgressBadge } from '@/components/usage/UsageProgressBar';

<UsageProgressBadge current={1} limit={2} type="creation" />
```

### Settings Page
```tsx
import { UsageStatsDisplay } from '@/components/usage/UsageStatsDisplay';
import { UpgradePrompt } from '@/components/usage/UpgradeCTA';

<UsageStatsDisplay />
{tier === 'free' && <UpgradePrompt currentTier="free" />}
```

### Any Page
```tsx
import { UpgradeCTA } from '@/components/usage/UpgradeCTA';

<UpgradeCTA variant="banner" />  // Horizontal banner
<UpgradeCTA variant="card" />    // Full card
<UpgradeCTA variant="inline" />  // Compact inline
```

---

## API Reference

### useUsageStats Hook

```typescript
const {
  usage,                    // UsageStats | null
  loading,                  // boolean
  error,                    // string | null
  refreshUsage,             // () => Promise<void>
  isCreationLimitReached,   // boolean
  isSavingLimitReached,     // boolean
  creationPercentage,       // number (0-100)
  savingPercentage,         // number (0-100)
} = useUsageStats(options);

// Options (all optional):
{
  autoRefresh: boolean,      // Default: true
  refreshInterval: number,   // Default: 60000 (1 minute)
}
```

### useUsageErrorHandler Hook

```typescript
const {
  handleError,   // (error: any) => void
  showModal,     // boolean
  limitType,     // 'creation' | 'saving'
  errorDetails,  // any
  closeModal,    // () => void
} = useUsageErrorHandler();

// Usage:
try {
  await someAction();
} catch (error) {
  handleError(error);  // Automatically shows modal if limit error
}
```

---

## Troubleshooting

### Issue: "Usage stats not loading"

**Check:**
1. Is `/api/user/usage` endpoint accessible?
2. Is user authenticated?
3. Check browser console for errors

**Fix:**
```typescript
const { usage, error } = useUsageStats();
console.log('Usage:', usage);
console.log('Error:', error);
```

### Issue: "Modal not appearing on 429 error"

**Check:**
1. Is error handler initialized?
2. Is modal component rendered?
3. Is error being caught?

**Fix:**
```typescript
// Ensure these are present:
const { handleError, showModal } = useUsageErrorHandler();

// In catch block:
if (errorData.limitExceeded || response.status === 429) {
  console.log('Handling limit error:', errorData);
  handleError(errorData);
}

// In JSX:
<LimitReachedModal
  isOpen={showModal}  // Make sure this is connected
  onClose={closeModal}
  {...props}
/>
```

### Issue: "Progress bar not animating"

**Check:**
1. Is framer-motion installed?
2. Is `animate` prop true?

**Fix:**
```bash
npm install framer-motion
```

---

## Need More Examples?

See these files for complete, working examples:

📝 **Full Documentation**: `/USAGE_SYSTEM_DOCUMENTATION.md`
📦 **Integration Examples**: `/USAGE_SYSTEM_INTEGRATION_EXAMPLES.tsx`
🎨 **Visual Guide**: `/USAGE_SYSTEM_VISUAL_GUIDE.md`
📊 **Summary**: `/USAGE_SYSTEM_SUMMARY.md`

---

## Support Checklist

Before asking for help, verify:

- [ ] Hook imported correctly
- [ ] Modal component rendered in JSX
- [ ] Error handler initialized
- [ ] API endpoint returns expected format
- [ ] User is authenticated
- [ ] Browser console checked for errors
- [ ] Network tab shows API calls
- [ ] framer-motion installed

---

## Next Steps

1. ✅ Implement basic usage display
2. ✅ Add error handling to save flows
3. ✅ Test limit reached scenario
4. 📊 Monitor conversion rates
5. 🎨 Customize messaging for your brand
6. 📈 Add analytics tracking

---

**That's it!** You now have a complete usage limit system integrated into your app.

For questions or issues, refer to the comprehensive documentation files included.
