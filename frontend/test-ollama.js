#!/usr/bin/env node

// Simple script to test Ollama integration and show generated questions
// This script should be run with: npx tsx test-ollama.ts
import { OllamaClient } from './lib/ollama/client';

async function testOllama() {
  console.log('🤖 Testing Ollama Integration...\n');

  const client = new OllamaClient({
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3:30b-a3b',
    timeoutMs: 60000,
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
    assessmentType: 'Quiz',
    deliveryMethod: 'Online',
    duration: '30m',
    learningObjectives: ['Assess JavaScript fundamentals', 'Test problem-solving skills'],
    targetAudience: 'Junior Developers',
    numSections: 2,
    questionsPerSection: 3,
  };

  console.log('📝 Input:', JSON.stringify(input, null, 2));
  console.log('\n⏳ Generating... (this may take 10-30 seconds)\n');

  try {
    const result = await client.generateQuestions(input);

    console.log('🎉 Generated Questions:\n');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📊 Summary:');
    console.log(`- Sections: ${result.sections.length}`);
    result.sections.forEach((section, i) => {
      console.log(`  Section ${i + 1}: "${section.title}" (${section.questions.length} questions)`);
      section.questions.forEach((q, j) => {
        console.log(`    ${j + 1}. ${q.question} [${q.type}]`);
      });
    });
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOllama().catch(console.error);
