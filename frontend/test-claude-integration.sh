#!/bin/bash
echo "🧪 Claude Integration Smoke Test"
echo "================================="
echo ""
echo "1️⃣  Checking environment..."
if grep -q "ANTHROPIC_API_KEY" .env.local 2>/dev/null; then
  echo "   ✅ ANTHROPIC_API_KEY configured"
else
  echo "   ❌ ANTHROPIC_API_KEY not found"
  exit 1
fi
echo ""
echo "2️⃣  Running unit tests..."
npm test -- __tests__/claude/ --run 2>&1 | tail -20
echo ""
echo "✅ Test suite complete!"
