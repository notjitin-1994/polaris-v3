import { describe, it, expect } from 'vitest';
import { OllamaClient } from '@/lib/ollama/client';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:30b-a3b';

describe.skipIf(!process.env.RUN_OLLAMA_INTEGRATION)('Ollama Integration (real server)', () => {
  it('generates valid dynamic questions JSON from real Ollama', async () => {
    const client = new OllamaClient({
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      timeoutMs: 60000,
    });
    const healthy = await client.health();
    expect(healthy).toBe(true);

    const result = await client.generateQuestions({
      assessmentType: 'Quiz',
      deliveryMethod: 'Online',
      duration: '30m',
      learningObjectives: ['Assess JS fundamentals concisely'],
      targetAudience: 'Junior Developers',
      numSections: 2,
      questionsPerSection: 2,
    });

    expect(result.sections.length).toBeGreaterThanOrEqual(1);
    expect(result.sections[0].questions.length).toBeGreaterThanOrEqual(1);

    // Log the generated questions for visibility
    console.log('\n🎉 Generated Questions:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📊 Summary:');
    result.sections.forEach((section, i) => {
      console.log(`  Section ${i + 1}: "${section.title}" (${section.questions.length} questions)`);
      section.questions.forEach((q, j) => {
        console.log(`    ${j + 1}. ${q.question} [${q.type}]`);
        if (q.options) {
          console.log(`       Options: ${q.options.join(', ')}`);
        }
      });
    });
  }, 120000);
});
