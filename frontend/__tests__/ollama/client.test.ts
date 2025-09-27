import { describe, it, expect, vi } from 'vitest';
import { OllamaClient } from '@/lib/ollama/client';

function mockFetchOK(json: unknown) {
  return vi.fn().mockResolvedValue({ ok: true, json: async () => json });
}

describe('OllamaClient', () => {
  it('parses fenced JSON', async () => {
    const response = {
      message: {
        content:
          '```json\n{"sections":[{"title":"S1","questions":[{"id":"q1","question":"Q?","type":"text","required":true}]}]}\n```',
      },
    };
    const client = new OllamaClient({ fetchImpl: mockFetchOK(response), timeoutMs: 2000 });
    const result = await client.generateQuestions({
      assessmentType: 'Quiz',
      deliveryMethod: 'Online',
      duration: '30m',
      learningObjectives: ['Obj1'],
      targetAudience: 'Developers',
      numSections: 1,
      questionsPerSection: 1,
    });
    expect(result.sections[0].questions[0].id).toBe('q1');
  });

  it('retries on failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content:
              '{"sections":[{"title":"S","questions":[{"id":"q","question":"Q","type":"text","required":true}]}]}',
          },
        }),
      });
    const client = new OllamaClient({ fetchImpl: fetchMock, timeoutMs: 2000 });
    const res = await client.generateQuestions({
      assessmentType: 'Quiz',
      deliveryMethod: 'Online',
      duration: '30m',
      learningObjectives: ['Obj1'],
      targetAudience: 'Developers',
      numSections: 1,
      questionsPerSection: 1,
    });
    expect(res.sections.length).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
