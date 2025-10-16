#!/usr/bin/env node

// Simple script to test Ollama integration and show generated questions
// This script should be run with: npx tsx test-ollama.ts
import { OllamaClient } from './lib/ollama/client';

async function testOllama() {
  console.log('🤖 Testing Ollama Integration...\n');

  const client = new OllamaClient({
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3:30b-a3b',
    timeoutMs: 300000,
    maxTokens: 16384, // Increased for 10 sections
  });

  // Check health
  console.log('📡 Checking Ollama server health...');
  const healthy = await client.health();
  console.log(`✅ Server healthy: ${healthy}\n`);

  if (!healthy) {
    console.log("❌ Ollama server is not accessible. Please ensure it's running.");
    return;
  }

  // Generate questions
  console.log('🎯 Generating dynamic questions...');
  const input = {
    // Use canonical/new input shape to match prompts
    role: 'Learning Professional',
    organization: 'Engineering',
    learningGap: 'JavaScript fundamentals and problem-solving',
    resources: 'Online, mentorship',
    constraints: 'Quiz • 30m',
    numSections: 5,
    questionsPerSection: 7,
  } as any;

  console.log('📝 Input:', JSON.stringify(input, null, 2));
  console.log('\n⏳ Generating... (this may take 10-30 seconds)\n');

  try {
    const result = await client.generateQuestions(input);

    console.log('🎉 Generated Questions:\n');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📊 Summary:');
    console.log(`- Sections: ${result.sections.length}`);
    (result.sections as any[]).forEach((section, i) => {
      console.log(`  Section ${i + 1}: "${section.title}" (${section.questions.length} questions)`);
      (section.questions as any[]).forEach((q, j) => {
        const label = (q as any).question ?? (q as any).question_text;
        const type = (q as any).type ?? (q as any).input_type;
        console.log(`    ${j + 1}. ${label} [${type}]`);
      });
    });
  } catch (error) {
    console.error('❌ Error generating questions:', (error as any).message);
    console.error('Stack:', (error as any).stack);
  }
}

testOllama().catch(console.error);
