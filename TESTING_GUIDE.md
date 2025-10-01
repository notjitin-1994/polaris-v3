# Testing Guide: Claude Blueprint Generation

## ✅ Prerequisites

Your environment is already set up:
- ✅ `ANTHROPIC_API_KEY` configured in `frontend/.env.local`
- ✅ All dependencies installed
- ✅ 140+ unit tests passing

---

## 🧪 Test Suite Overview

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test Suites

**Claude Module Tests (140 tests):**
```bash
npm test -- __tests__/claude/
npm test -- __tests__/api/claude-generate-blueprint.test.ts
npm test -- __tests__/services/blueprintGenerationService.test.ts
```

**Individual Module Tests:**
```bash
# Configuration (16 tests)
npm test -- __tests__/claude/config.test.ts

# API Client (21 tests)
npm test -- __tests__/claude/client.test.ts

# Prompts (22 tests)
npm test -- __tests__/claude/prompts.test.ts

# Validation (31 tests)
npm test -- __tests__/claude/validation.test.ts

# Fallback Logic (29 tests)
npm test -- __tests__/claude/fallback.test.ts

# API Endpoint (11 tests)
npm test -- __tests__/api/claude-generate-blueprint.test.ts

# Orchestrator Service (10 tests)
npm test -- __tests__/services/blueprintGenerationService.test.ts
```

---

## 🔧 Manual API Testing

### Option 1: Using cURL (Quick Test)

**Test Claude API Proxy Endpoint:**
```bash
# 1. Start your development server
cd frontend
npm run dev

# 2. In another terminal, test the Claude endpoint
curl -X POST http://localhost:3000/api/claude/generate-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "test-bp-123",
    "systemPrompt": "You are a helpful assistant. Return only valid JSON without markdown.",
    "userPrompt": "Generate a simple test blueprint with metadata and one section. Include displayType for each section."
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "blueprint": {
    "metadata": { ... },
    "test_section": {
      "content": "...",
      "displayType": "markdown"
    }
  },
  "usage": {
    "input_tokens": 150,
    "output_tokens": 300
  },
  "metadata": {
    "model": "claude-sonnet-4-20250514",
    "duration": 2500,
    "timestamp": "2025-10-01T..."
  }
}
```

### Option 2: Using Postman/Insomnia

1. **Import this request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/claude/generate-blueprint`
   - Headers:
     - `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "blueprintId": "test-123",
       "systemPrompt": "You are an expert. Return only JSON.",
       "userPrompt": "Generate test data with metadata."
     }
     ```

2. **Send request** and verify:
   - Status: `200 OK`
   - Response has `success: true`
   - Blueprint JSON is valid
   - Usage stats included

### Option 3: Browser Console (Full Integration Test)

1. **Navigate to** `http://localhost:3000`
2. **Open DevTools Console**
3. **Run this script:**

```javascript
// Test Claude API endpoint
async function testClaudeAPI() {
  const response = await fetch('/api/claude/generate-blueprint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blueprintId: 'test-123',
      systemPrompt: 'You are a helpful assistant. Return valid JSON only.',
      userPrompt: 'Generate a simple test object with metadata and displayType fields.'
    })
  });
  
  const data = await response.json();
  console.log('✅ Claude API Test Result:', data);
  return data;
}

// Run test
testClaudeAPI();
```

---

## 🔄 Testing the Triple-Fallback Cascade

### Test 1: Successful Claude Sonnet 4 (Primary)
This should work with a valid API key:

```bash
curl -X POST http://localhost:3000/api/claude/generate-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "test-sonnet",
    "systemPrompt": "Return JSON only.",
    "userPrompt": "Generate test data."
  }' | jq '.metadata.model'

# Expected output: "claude-sonnet-4-20250514"
```

### Test 2: Fallback to Claude Opus 4
To test fallback, you'd need to simulate a Sonnet failure. The service automatically handles this.

**Verify fallback in logs:**
```bash
# Check logs after generation
# Look for: claude.fallback.triggered
```

### Test 3: Emergency Ollama Fallback
If both Claude models fail (e.g., API key invalid), it falls back to Ollama.

**Temporarily test Ollama fallback:**
```bash
# 1. Temporarily rename your API key (to simulate failure)
# In frontend/.env.local, change:
# ANTHROPIC_API_KEY=xxx  →  ANTHROPIC_API_KEY_DISABLED=xxx

# 2. Restart your dev server

# 3. Make a request - should fallback to Ollama
curl -X POST http://localhost:3000/api/blueprints/generate \
  -H "Content-Type: application/json" \
  -d '{"blueprintId": "your-blueprint-id"}' | jq '.metadata.model'

# Expected: "ollama"

# 4. IMPORTANT: Restore your API key after testing!
```

---

## 🔍 Testing with Real Blueprint Data

### Complete End-to-End Test:

1. **Create a test blueprint** (via UI or database)
2. **Complete static questionnaire**
3. **Complete dynamic questionnaire**
4. **Generate blueprint:**

```javascript
// In browser console at http://localhost:3000
async function generateBlueprint(blueprintId) {
  console.log('🚀 Starting blueprint generation...');
  
  const response = await fetch('/api/blueprints/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprintId })
  });
  
  const data = await response.json();
  console.log('📊 Generation Result:', data);
  
  if (data.success) {
    console.log(`✅ Success!`);
    console.log(`   Model: ${data.metadata.model}`);
    console.log(`   Duration: ${data.metadata.duration}ms`);
    console.log(`   Fallback used: ${data.metadata.fallbackUsed}`);
    console.log(`   Attempts: ${data.metadata.attempts}`);
  } else {
    console.error('❌ Failed:', data.error);
  }
  
  return data;
}

// Replace with your actual blueprint ID
generateBlueprint('your-blueprint-id-here');
```

5. **Check the database:**
```sql
-- Verify blueprint was saved
SELECT 
  id, 
  status, 
  blueprint_json->'_generation_metadata'->>'model' as model,
  blueprint_json->'metadata'->>'title' as title
FROM blueprint_generator 
WHERE id = 'your-blueprint-id';
```

6. **View the blueprint** at `http://localhost:3000/blueprint/your-blueprint-id`

---

## 📊 Checking Logs

### View Logs in Browser
Navigate to: **`http://localhost:3000/logs`**

**Filter for blueprint generation events:**
- Service: `blueprint-generation`, `claude-client`, `api-claude`, `api-blueprints`
- Look for events like:
  - `blueprint.generation.started`
  - `blueprint.generation.success`
  - `claude.client.request`
  - `claude.client.success`
  - `claude.fallback.triggered` (if fallback occurred)

### Check Console Logs
Watch your terminal where `npm run dev` is running:

```bash
# You should see structured logs like:
[claude-client] claude.client.request { model: 'claude-sonnet-4...', ... }
[claude-client] claude.client.success { inputTokens: 100, outputTokens: 500, ... }
[blueprint-generation] blueprint.generation.success { ... }
```

---

## ⚡ Quick Smoke Test Script

Create a test script to verify everything works:

```bash
cd /home/jitin-m-nair/Desktop/smartslate-polaris-v3/frontend
cat > test-claude-integration.sh << 'EOF'
#!/bin/bash

echo "🧪 Claude Integration Smoke Test"
echo "================================="
echo ""

# Check environment
echo "1️⃣  Checking environment variables..."
if grep -q "ANTHROPIC_API_KEY" .env.local 2>/dev/null; then
  echo "   ✅ ANTHROPIC_API_KEY found"
else
  echo "   ❌ ANTHROPIC_API_KEY not found in .env.local"
  exit 1
fi
echo ""

# Run unit tests
echo "2️⃣  Running unit tests..."
npm test -- __tests__/claude/ __tests__/api/claude-generate-blueprint.test.ts __tests__/services/blueprintGenerationService.test.ts --run
echo ""

# Check if dev server is running
echo "3️⃣  Checking dev server..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "   ✅ Dev server is running"
  
  echo ""
  echo "4️⃣  Testing Claude API endpoint..."
  curl -X POST http://localhost:3000/api/claude/generate-blueprint \
    -H "Content-Type: application/json" \
    -d '{
      "blueprintId": "smoke-test-123",
      "systemPrompt": "Return only valid JSON without markdown wrappers.",
      "userPrompt": "{\"metadata\": {\"title\": \"Test\", \"organization\": \"Test\", \"role\": \"Test\", \"generated_at\": \"2025-10-01T12:00:00Z\"}, \"test_section\": {\"content\": \"Test content\", \"displayType\": \"markdown\"}}"
    }' \
    -s -w "\n\nHTTP Status: %{http_code}\n" | head -50
    
else
  echo "   ⚠️  Dev server not running. Start with: npm run dev"
fi

echo ""
echo "================================="
echo "✅ Smoke test complete!"
EOF

chmod +x test-claude-integration.sh
./test-claude-integration.sh

