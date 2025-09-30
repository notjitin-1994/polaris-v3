import { describe, it, expect } from 'vitest';
import { OllamaClient } from '@/lib/ollama/client';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:30b-a3b';

describe.skipIf(!process.env.RUN_OLLAMA_INTEGRATION)('Ollama Integration (real server)', () => {
  it('generates a full 5x7 dynamic questionnaire from real Ollama', async () => {
    const client = new OllamaClient({
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      timeoutMs: 300000,
      maxTokens: 8192,
    });
    const healthy = await client.health();
    expect(healthy).toBe(true);

    const result = await client.generateQuestions({
      role: 'Learning Professional',
      organization: 'Engineering',
      learningGap: 'JavaScript fundamentals and problem-solving',
      resources: 'Online, mentorship',
      constraints: 'Quiz • 30m',
      numSections: 5,
      questionsPerSection: 7,
    } as any);

    // Expect a full questionnaire: 5 sections × 7 questions
    expect(result.sections.length).toBe(5);
    result.sections.forEach((section) => {
      expect(section.questions.length).toBe(7);
    });

    // Log the generated questions for visibility
    console.log('\n🎉 Generated Questions:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📊 Summary:');
    result.sections.forEach((section, i) => {
      console.log(`  Section ${i + 1}: "${section.title}" (${section.questions.length} questions)`);
      (section.questions as any[]).forEach((q, j) => {
        const label = (q as any).question ?? (q as any).question_text;
        const type = (q as any).type ?? (q as any).input_type;
        console.log(`    ${j + 1}. ${label} [${type}]`);
        const opts = (q as any).options as string[] | undefined;
        if (Array.isArray(opts) && opts.length > 0) {
          console.log(`       Options: ${opts.join(', ')}`);
        }
      });
    });
  }, 300000);
});
