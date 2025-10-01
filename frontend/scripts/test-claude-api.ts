/**
 * Manual Test Script for Claude API Integration
 * Run with: npx tsx scripts/test-claude-api.ts
 */

import { ClaudeClient } from '../lib/claude/client';
import { getClaudeConfig } from '../lib/claude/config';
import {
  BLUEPRINT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
  extractLearningObjectives,
} from '../lib/claude/prompts';
import { validateAndNormalizeBlueprint } from '../lib/claude/validation';

// Load environment
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testClaudeAPI() {
  console.log('🧪 Testing Claude API Integration\n');

  // Step 1: Verify configuration
  console.log('1️⃣  Checking configuration...');
  try {
    const config = getClaudeConfig();
    console.log('   ✅ Configuration loaded');
    console.log(`   Model: ${config.primaryModel}`);
    console.log(`   Max Tokens: ${config.maxTokens}`);
    console.log(`   Temperature: ${config.temperature}`);
    console.log(`   Timeout: ${config.timeout}ms\n`);
  } catch (error) {
    console.error('   ❌ Configuration error:', (error as Error).message);
    process.exit(1);
  }

  // Step 2: Test prompt building
  console.log('2️⃣  Testing prompt generation...');
  const mockContext = {
    blueprintId: 'test-123',
    userId: 'user-456',
    organization: 'Test Company',
    role: 'Training Manager',
    industry: 'Technology',
    staticAnswers: {
      organization: { name: 'Test Company', industry: 'Technology' },
      role: 'Training Manager',
      team_size: '50-100',
    },
    dynamicAnswers: {
      learning_objectives: ['Improve technical skills', 'Enhance team collaboration'],
      budget: '$50,000',
    },
    learningObjectives: extractLearningObjectives({
      learning_objectives: ['Improve technical skills', 'Enhance team collaboration'],
    }),
  };

  const systemPrompt = BLUEPRINT_SYSTEM_PROMPT;
  const userPrompt = buildBlueprintPrompt(mockContext);

  console.log(`   ✅ System prompt: ${systemPrompt.length} characters`);
  console.log(`   ✅ User prompt: ${userPrompt.length} characters`);
  console.log(`   ✅ Learning objectives extracted: ${mockContext.learningObjectives.length}\n`);

  // Step 3: Test Claude API call
  console.log('3️⃣  Testing Claude API call...');
  console.log('   ⏳ Calling Claude Sonnet 4 (this may take 10-30 seconds)...\n');

  const client = new ClaudeClient();

  try {
    const startTime = Date.now();

    const response = await client.generate({
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const duration = Date.now() - startTime;

    console.log(`   ✅ API call successful!`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Input tokens: ${response.usage.input_tokens}`);
    console.log(`   Output tokens: ${response.usage.output_tokens}`);
    console.log(`   Stop reason: ${response.stop_reason}\n`);

    // Step 4: Test response parsing
    console.log('4️⃣  Testing response parsing...');
    const text = ClaudeClient.extractText(response);
    console.log(`   ✅ Extracted text: ${text.length} characters`);

    // Step 5: Test validation
    console.log('\n5️⃣  Testing validation...');
    const validated = validateAndNormalizeBlueprint(text);

    console.log('   ✅ Validation successful!');
    console.log(`   Metadata present: ${!!validated.metadata}`);
    console.log(`   Title: ${validated.metadata?.title || 'N/A'}`);
    console.log(`   Sections: ${Object.keys(validated).filter((k) => k !== 'metadata').length}`);

    // Check displayType
    const sections = Object.keys(validated).filter((k) => k !== 'metadata');
    console.log(`\n   Sections with displayType:`);
    sections.forEach((section) => {
      const displayType = validated[section]?.displayType || 'missing';
      console.log(`   - ${section}: ${displayType}`);
    });

    console.log('\n✨ All tests passed! Claude integration is working correctly.');

    // Optional: Save test blueprint to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      path.join(__dirname, '../test-blueprint-output.json'),
      JSON.stringify(validated, null, 2)
    );
    console.log('\n📄 Test blueprint saved to: frontend/test-blueprint-output.json');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('   Error:', (error as Error).message);

    if ((error as any).statusCode) {
      console.error(`   Status: ${(error as any).statusCode}`);
    }

    if ((error as any).errorType) {
      console.error(`   Type: ${(error as any).errorType}`);
    }

    process.exit(1);
  }
}

// Run test
testClaudeAPI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
