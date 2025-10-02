import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate-blueprint/route';

// Mock external dependencies
vi.mock('@/lib/ollama/client', () => ({
  OllamaClient: vi.fn(),
}));
vi.mock('@/lib/services/answerAggregation', () => ({
  answerAggregationService: {
    getAggregatedAnswers: vi.fn(),
  },
}));
vi.mock('@/lib/prompts/blueprintTemplates', () => ({
  generateSystemPrompt: vi.fn(),
  generateUserPrompt: vi.fn(),
}));
vi.mock('@/lib/ollama/blueprintValidation', () => ({
  parseAndValidateBlueprintJSON: vi.fn(),
}));
vi.mock('@/lib/services/markdownGenerator', () => ({
  markdownGeneratorService: {
    generateMarkdown: vi
      .fn()
      .mockReturnValue('# Fallback Blueprint\n\nThis is fallback markdown content.'),
  },
}));
vi.mock('@/lib/fallbacks/blueprintFallbacks', () => ({
  blueprintFallbackService: {
    getFallbackBlueprint: vi.fn().mockReturnValue({
      title: 'Fallback Blueprint',
      overview: 'This is a fallback blueprint',
      learningObjectives: ['Learn basics'],
      modules: [
        {
          title: 'Module 1',
          duration: 1,
          topics: ['Topic 1'],
          activities: ['Activity 1'],
          assessments: ['Assessment 1'],
        },
      ],
      timeline: { 'Week 1': 'Introduction' },
      resources: [{ name: 'Resource 1', type: 'Document', url: 'http://example.com' }],
    }),
  },
}));
// Mock server-side supabase/session helpers to avoid Next cookies in test env
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: 'bid', user_id: 'test-user-id', static_answers: {}, dynamic_answers: {} },
              error: null,
            }),
          }),
        }),
      }),
    }),
  })),
  getServerSession: vi.fn(async () => ({ session: { user: { id: 'test-user-id' } }, error: null })),
}));
// Mock server blueprint service to avoid DB writes in tests
vi.mock('@/lib/db/blueprints.server', () => ({
  createServerBlueprintService: vi.fn(async () => ({
    hasCompletedGeneration: vi.fn(async () => false),
    saveBlueprint: vi.fn(async () => ({ id: 'saved-id' })),
  })),
}));

// Import mocked modules after mocking
import { OllamaClient } from '@/lib/ollama/client';
import { answerAggregationService } from '@/lib/services/answerAggregation';
import { getServerSession } from '@/lib/supabase/server';

// Create mock instances
const mockedOllamaClient = vi.mocked(OllamaClient);
const mockedGetServerSession = vi.mocked(getServerSession);

describe('/api/generate-blueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockedGetServerSession.mockResolvedValue({
      session: { user: { id: 'test-user-id' } },
      error: null as any,
    } as any);

    answerAggregationService.getAggregatedAnswers.mockResolvedValue({
      staticResponses: [
        { questionId: 'learningObjective', answer: 'Learn Testing' },
        { questionId: 'targetAudience', answer: 'Developers' },
      ],
      dynamicResponses: [{ questionId: 'techStack', answer: 'React' }],
    });
  });

  it('should return 503 if Ollama is not healthy', async () => {
    // Mock OllamaClient constructor to return instance with health method
    const mockInstance = {
      health: vi.fn().mockResolvedValue(false),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.error).toContain('Ollama service is unavailable');
    // The API should return fallback blueprint and markdown when Ollama is unhealthy
    expect(data.blueprint).toBeDefined();
    expect(data.markdown).toBeDefined();
    expect(typeof data.blueprint).toBe('object');
    expect(typeof data.markdown).toBe('string');
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock OllamaClient as healthy so we get past the health check
    const mockInstance = {
      health: vi.fn().mockResolvedValue(true),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    // Mock session as null/unauthenticated
    mockedGetServerSession.mockResolvedValueOnce({ session: null, error: null } as any);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request body', async () => {
    // Mock OllamaClient constructor to return instance with health method
    const mockInstance = {
      health: vi.fn().mockResolvedValue(true),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should successfully generate blueprint with streaming', async () => {
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('{"done": false, "message": {"content": "test"}}')
        );
        controller.enqueue(new TextEncoder().encode('{"done": true}'));
        controller.close();
      },
    });

    // Mock OllamaClient constructor to return instance with methods
    const mockInstance = {
      health: vi.fn().mockResolvedValue(true),
      streamBlueprint: vi.fn().mockResolvedValue(mockStream),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('should handle streaming errors gracefully', async () => {
    // Mock OllamaClient constructor to return instance with methods
    const mockInstance = {
      health: vi.fn().mockResolvedValue(true),
      streamBlueprint: vi.fn().mockRejectedValue(new Error('Ollama error')),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('should handle blueprint validation errors during streaming', async () => {
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('{"done": false, "message": {"content": "invalid json"}}')
        );
        controller.enqueue(new TextEncoder().encode('{"done": true}'));
        controller.close();
      },
    });

    // Mock OllamaClient constructor to return instance with methods
    const mockInstance = {
      health: vi.fn().mockResolvedValue(true),
      streamBlueprint: vi.fn().mockResolvedValue(mockStream),
    };
    mockedOllamaClient.mockImplementation(() => mockInstance as unknown as OllamaClient);

    const request = new NextRequest('http://localhost:3000/api/generate-blueprint', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });
});
