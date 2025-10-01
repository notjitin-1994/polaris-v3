# Resume Blueprint Functionality - Testing Guide

## Quick Test Scenarios

### 🧪 Test 1: Resume from Incomplete Static Questionnaire
**Objective**: Verify system correctly identifies incomplete static questionnaire

**Steps**:
1. Click "New Blueprint" on dashboard
2. Fill out only 2-3 fields in the static questionnaire (e.g., Organization, Role)
3. Navigate back to dashboard (use browser back button or click logo)
4. Locate the draft blueprint and click the **Play (▶️) icon**
5. Observe the loading spinner briefly appears
6. Verify you're redirected to `/static-wizard?bid=[uuid]`
7. Verify your previously entered data is still there

**Expected Result**: ✅ Returns to static wizard with saved progress

---

### 🧪 Test 2: Resume from Complete Static Questionnaire (No Dynamic Questions)
**Objective**: Verify system generates dynamic questions when needed

**Steps**:
1. Create or resume a blueprint
2. Complete ALL static questionnaire fields
3. Click "Next" to trigger save but immediately navigate away (don't wait for questions)
4. Return to dashboard
5. Click the **Play (▶️) icon** on the blueprint
6. Verify you're redirected to `/loading/[uuid]`
7. Watch as dynamic questions are generated
8. Verify automatic redirect to `/dynamic-wizard/[uuid]`

**Expected Result**: ✅ Generates questions and navigates to dynamic questionnaire

---

### 🧪 Test 3: Resume from Partial Dynamic Questionnaire
**Objective**: Verify system resumes dynamic questionnaire progress

**Steps**:
1. Complete static questionnaire
2. Wait for dynamic questions to generate
3. Answer 2-3 dynamic questions (don't complete all)
4. Click "Save Progress" or just navigate away
5. Return to dashboard
6. Click the **Play (▶️) icon**
7. Verify you're back in `/dynamic-wizard/[uuid]`
8. Verify your previous answers are still there

**Expected Result**: ✅ Returns to dynamic wizard with saved answers

---

### 🧪 Test 4: Resume Ready-to-Generate Blueprint
**Objective**: Verify system goes directly to generation for complete questionnaires

**Steps**:
1. Complete both static and dynamic questionnaires
2. Leave the page before blueprint generates
3. Return to dashboard
4. Click the **Play (▶️) icon**
5. Verify immediate redirect to `/generating/[uuid]`
6. Watch blueprint generation progress
7. Verify final redirect to `/blueprint/[uuid]` viewer

**Expected Result**: ✅ Immediately starts generation and shows completed blueprint

---

### 🧪 Test 5: Resume Completed Blueprint
**Objective**: Verify completed blueprints open the viewer

**Steps**:
1. Locate a blueprint with "Completed" status (green checkmark)
2. Click the **Eye (👁️) icon** or resume button
3. Verify redirect to `/blueprint/[uuid]`
4. Verify blueprint content is displayed

**Expected Result**: ✅ Opens blueprint viewer with full content

---

### 🧪 Test 6: Multiple Rapid Clicks (Spam Protection)
**Objective**: Verify system prevents multiple simultaneous resume actions

**Steps**:
1. Locate any draft blueprint
2. Rapidly click the Play icon multiple times (5-10 clicks)
3. Observe behavior

**Expected Result**: ✅ Button becomes disabled after first click, spinner shows, only one navigation occurs

---

### 🧪 Test 7: Error Recovery
**Objective**: Verify system handles error states gracefully

**Steps**:
1. Use Supabase dashboard or SQL editor to set a blueprint's status to 'error':
   ```sql
   UPDATE blueprint_generator 
   SET status = 'error' 
   WHERE id = 'your-blueprint-id';
   ```
2. Return to app dashboard (refresh if needed)
3. Click the **Play (▶️) icon** on the errored blueprint
4. Observe routing behavior

**Expected Result**: ✅ System intelligently determines recovery point based on data completeness

---

### 🧪 Test 8: Stuck Generation Recovery
**Objective**: Verify system handles stuck generating state

**Steps**:
1. Use Supabase dashboard to set a blueprint to 'generating' with old timestamp:
   ```sql
   UPDATE blueprint_generator 
   SET status = 'generating',
       updated_at = NOW() - INTERVAL '15 minutes'
   WHERE id = 'your-blueprint-id';
   ```
2. Return to app dashboard (refresh if needed)
3. Click the **Play (▶️) icon**
4. Observe it routes to generating page
5. Watch for automatic retry

**Expected Result**: ✅ Detects stuck state and retries generation

---

## Visual Verification Checklist

When testing, verify these visual elements:

### Resume Button States
- [ ] **Default**: Secondary color background, Play icon visible
- [ ] **Hover**: Slight scale increase (1.05x), shadow enhancement
- [ ] **Click**: Momentary scale decrease (0.95x)
- [ ] **Loading**: Spinning sparkle icon, button disabled, opacity 50%
- [ ] **Disabled**: Cannot be clicked multiple times

### Console Logs
Open browser DevTools Console (F12) and verify you see:

```
[Dashboard] Resuming blueprint: [uuid]
[BlueprintService] Resume routing analysis: { ... }
[BlueprintService] [Appropriate routing message]
[Dashboard] Determined next route: /[appropriate-page]/[uuid]
```

### Navigation Timing
- [ ] Loading spinner appears immediately on click
- [ ] Minimum 300ms delay for visual feedback
- [ ] Smooth page transition to destination
- [ ] No flash of wrong page

---

## Database State Inspection

To understand what the system sees, run this query in Supabase SQL Editor:

```sql
SELECT 
  id,
  title,
  status,
  questionnaire_version,
  -- Check data completeness
  CASE 
    WHEN static_answers::text = '{}'::text THEN 'Empty'
    WHEN jsonb_array_length(jsonb_object_keys(static_answers)::jsonb) > 5 THEN 'Complete'
    ELSE 'Partial'
  END as static_status,
  CASE 
    WHEN dynamic_questions::text = '[]'::text THEN 'None'
    WHEN jsonb_array_length(dynamic_questions::jsonb) > 0 THEN 'Generated'
    ELSE 'Empty'
  END as dynamic_questions_status,
  CASE 
    WHEN dynamic_answers::text = '{}'::text THEN 'Empty'
    WHEN jsonb_array_length(jsonb_object_keys(dynamic_answers)::jsonb) > 0 THEN 'Has Answers'
    ELSE 'Empty'
  END as dynamic_answers_status,
  blueprint_markdown IS NOT NULL as has_markdown,
  created_at,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM blueprint_generator
WHERE user_id = auth.uid()
ORDER BY updated_at DESC
LIMIT 10;
```

This shows you exactly what state each blueprint is in.

---

## Expected Console Output Examples

### Complete Static → Generate Dynamic Questions
```
[Dashboard] Resuming blueprint: 2b638761-9540-4305-a2a8-90899b0955da
[BlueprintService] Resume routing analysis: {
  blueprintId: "2b638761-9540-4305-a2a8-90899b0955da",
  status: "draft",
  hasStaticAnswers: true,
  hasDynamicQuestions: false,
  hasDynamicAnswers: false,
  hasBlueprintJson: false,
  hasBlueprintMarkdown: false,
  questionnaireVersion: 2
}
[BlueprintService] No dynamic questions, routing to loading page to generate them
[Dashboard] Determined next route: /loading/2b638761-9540-4305-a2a8-90899b0955da
```

### Incomplete Static
```
[BlueprintService] Static answers incomplete, routing to static wizard
[Dashboard] Determined next route: /static-wizard?bid=2b638761-9540-4305-a2a8-90899b0955da
```

### Ready to Generate
```
[BlueprintService] All questionnaires complete, routing to generation
[Dashboard] Determined next route: /generating/2b638761-9540-4305-a2a8-90899b0955da
```

### Completed Blueprint
```
[BlueprintService] Blueprint completed, routing to viewer
[Dashboard] Determined next route: /blueprint/2b638761-9540-4305-a2a8-90899b0955da
```

---

## Troubleshooting

### Issue: Button doesn't show loading state
**Check**: 
- Verify `resumingBlueprintId` state is being set
- Check `isResuming` prop is passed to BlueprintCard
- Verify prop name matches in BlueprintCard interface

### Issue: Wrong page is shown
**Check**: 
- Review console logs to see routing decision
- Verify database state matches expectations
- Check if validation methods are working correctly

### Issue: Multiple navigations occur
**Check**: 
- Verify `resumingBlueprintId` check prevents duplicate calls
- Check button is properly disabled during loading
- Review React strict mode behavior (development only)

### Issue: Error messages don't appear
**Check**: 
- Open browser console to see error logs
- Verify try-catch blocks are working
- Check alert() calls are not being blocked by browser

---

## Success Criteria

All tests pass when:

✅ **Correct Routing**: Always lands on the right page for blueprint state  
✅ **Data Persistence**: All previously entered data is preserved  
✅ **Visual Feedback**: Loading states are clearly visible  
✅ **Error Handling**: Errors are handled gracefully with helpful messages  
✅ **Performance**: Navigation feels instant (<600ms total)  
✅ **Console Logs**: Appropriate logs appear for debugging  
✅ **Accessibility**: Screen readers announce state changes  
✅ **Edge Cases**: Handles all error, generating, and completed states  

---

## Automated Testing (Future)

Consider adding these E2E tests with Playwright/Cypress:

```typescript
test('resumes incomplete static questionnaire', async ({ page }) => {
  // Create draft blueprint
  // Fill partial data
  // Navigate away
  // Click resume
  // Assert on correct page
  // Assert data is preserved
});

test('resumes incomplete dynamic questionnaire', async ({ page }) => {
  // Complete static
  // Wait for dynamic generation
  // Answer some questions
  // Navigate away
  // Click resume
  // Assert on dynamic wizard
  // Assert answers preserved
});

// ... etc for all scenarios
```

---

## Performance Benchmarks

Expected performance characteristics:

| Metric | Target | Acceptable |
|--------|--------|------------|
| Database query | <100ms | <300ms |
| Routing decision | <50ms | <150ms |
| Total time to navigate | <300ms | <600ms |
| Button loading state | Immediate | <50ms |

Monitor these in browser DevTools Network and Performance tabs.

