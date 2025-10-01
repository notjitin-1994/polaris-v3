# 🚀 Quick Testing Guide

## ✅ What's Ready to Test

You have a **complete, tested Claude blueprint generation backend** with:
- ✅ **119 unit tests passing**
- ✅ Triple-fallback system (Sonnet 4 → Opus 4 → Ollama)
- ✅ Comprehensive logging
- ✅ Secure API key management
- ✅ ANTHROPIC_API_KEY already configured

---

## 🏃 Quick Tests (Choose One)

### Option 1: Run Unit Tests (Fastest - 16 seconds)
```bash
cd frontend
npm test -- __tests__/claude/
```

**Expected:** ✅ All 119 tests pass

---

### Option 2: Test Claude API Directly (Real API Call)

**Prerequisites:**
- Dev server running: `npm run dev`
- Ollama running locally (for fallback testing)

**Install tsx (if needed):**
```bash
cd frontend
npm install -D tsx dotenv
```

**Run test script:**
```bash
cd frontend
npx tsx scripts/test-claude-api.ts
```

**What it does:**
1. Checks environment configuration
2. Builds prompts from mock questionnaire data
3. Calls Claude Sonnet 4 API (real API call - uses your quota)
4. Validates and normalizes response
5. Saves test blueprint to `test-blueprint-output.json`

**Expected output:**
```
🧪 Testing Claude API Integration

1️⃣  Checking configuration...
   ✅ Configuration loaded
   Model: claude-sonnet-4-20250514

2️⃣  Testing prompt generation...
   ✅ System prompt: 2400 characters
   ✅ User prompt: 3100 characters

3️⃣  Testing Claude API call...
   ⏳ Calling Claude Sonnet 4...
   ✅ API call successful!
   Model: claude-sonnet-4-20250514
   Duration: 15000ms
   Input tokens: 3500
   Output tokens: 8000

4️⃣  Testing response parsing...
   ✅ Extracted text: 12000 characters

5️⃣  Testing validation...
   ✅ Validation successful!
   Sections: 10

✨ All tests passed!
```

---

### Option 3: Test Full Integration (End-to-End)

**Prerequisites:**
- Dev server: `npm run dev`
- Existing blueprint with completed questionnaires

**In browser console** (`http://localhost:3000`):
```javascript
// Replace with your real blueprint ID
const blueprintId = 'your-blueprint-id-here';

async function testGeneration() {
  console.log('🚀 Generating blueprint...');
  
  const response = await fetch('/api/blueprints/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprintId })
  });
  
  const data = await response.json();
  console.log('📊 Result:', data);
  
  if (data.success) {
    console.log(`✅ Generated with ${data.metadata.model}`);
    console.log(`⏱️  Took ${data.metadata.duration}ms`);
    console.log(`🔄 Fallback used: ${data.metadata.fallbackUsed}`);
    
    // View blueprint
    window.location.href = `/blueprint/${blueprintId}`;
  }
}

testGeneration();
```

**Then check:**
- `/logs` page for generation logs
- `/blueprint/{id}` to view generated blueprint

---

## 🔍 What to Look For

### Successful Generation
- ✅ Status: 200
- ✅ `success: true`
- ✅ `metadata.model`: "claude-sonnet-4-20250514"
- ✅ `metadata.fallbackUsed`: false
- ✅ `metadata.duration`: < 60000ms (under 1 minute)
- ✅ Blueprint JSON has metadata and sections
- ✅ All sections have `displayType`

### Logs at `/logs`
Filter by service: `claude-client`, `blueprint-generation`

**Look for events:**
- `claude.client.request` - Initial API call
- `claude.client.success` - Successful response
- `blueprint.generation.success` - Overall success

**Token usage in logs:**
- Input tokens: ~2000-5000 (depends on questionnaire length)
- Output tokens: ~5000-12000 (full blueprint)

### Fallback Testing
If you want to test fallbacks:

**Test Opus 4 fallback:**
- Temporarily set invalid Sonnet model name
- Should see: `claude.fallback.triggered` in logs
- `metadata.model`: "claude-opus-4-20250514"
- `metadata.fallbackUsed`: true

**Test Ollama fallback:**
- Temporarily disable API key
- Should fall back to Ollama
- `metadata.model`: "ollama"

---

## 📊 Cost Estimation

**Per blueprint generation:**
- **Claude Sonnet 4**: ~$0.05-$0.15
  - Input: 3000 tokens × $3/M = $0.009
  - Output: 8000 tokens × $15/M = $0.12
  - **Total: ~$0.13 per blueprint**

- **Claude Opus 4** (if fallback): ~$0.70-$0.90
  - Much higher cost, should be rare (<3% of generations)

- **Ollama**: Free (local)

**For testing:**
- Use Sonnet 4 (primary) - cost-effective
- Fallbacks should rarely trigger
- Monitor costs via Claude dashboard

---

## 🎯 Recommended Testing Sequence

1. **Run unit tests** ✅ (Already done - 119 passed)
   ```bash
   npm test -- __tests__/claude/
   ```

2. **Test API with mock data** (Optional, costs ~$0.13)
   ```bash
   npx tsx scripts/test-claude-api.ts
   ```

3. **Test with real blueprint** (Via browser console)
   - Navigate to dashboard
   - Create blueprint → Complete questionnaires
   - Generate using browser console script above

4. **Check logs** at `http://localhost:3000/logs`
   - Verify all events logged
   - Check token usage
   - Confirm no errors

5. **View generated blueprint** at `/blueprint/{id}`
   - Verify markdown renders
   - Check all sections present

---

## 🆘 Troubleshooting

### Issue: "ANTHROPIC_API_KEY environment variable is required"
**Solution:**
```bash
# Verify key is in .env.local
cat frontend/.env.local | grep ANTHROPIC_API_KEY

# If missing, add it:
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> frontend/.env.local

# Restart dev server
```

### Issue: Tests timeout
**Solution:**
```bash
# Increase test timeout
npm test -- __tests__/claude/ --testTimeout=30000
```

### Issue: "Ollama service unavailable"
**Solution:**
```bash
# Start Ollama
ollama serve

# Or disable Ollama fallback testing for now
```

### Issue: Rate limit errors
**Solution:**
- You're making too many API calls
- Wait a few minutes
- Consider using mock data for repeated tests

---

## ✨ Next Steps After Testing

Once backend tests pass:

1. **Continue to frontend visualization** (Tasks 9-12)
   - Infographic dashboard components
   - Timeline/chart/table visualizations
   - Markdown rendering
   - View toggle UI

2. **Add real-time status** (Task 7)
   - Status polling endpoint
   - Loading UI improvements

3. **Enhance logging** (Tasks 13-14)
   - Persistent log storage
   - Enhanced filtering
   - CSV export

4. **Error handling** (Task 15)
   - Error boundaries
   - User-friendly messages
   - Retry mechanisms

---

**You're ready to test! Start with the unit tests, then try the real API call if you want to see Claude in action.** 🎉

