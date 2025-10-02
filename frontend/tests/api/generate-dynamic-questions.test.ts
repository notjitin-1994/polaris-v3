import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate-dynamic-questions/route';

// Mock Supabase
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
}));

const mockSupabase = {
  from: mockFrom,
};

// Mock OllamaClient
const mockOllamaClient = {
  generateQuestions: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

vi.mock('@/lib/ollama/client', () => ({
  OllamaClient: vi.fn(() => mockOllamaClient),
}));

describe('/api/generate-dynamic-questions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chain
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn(),
      }),
    });

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn(),
        }),
      }),
    });
  });

  it('should generate a full 5x7 dynamic questionnaire successfully', async () => {
    const blueprintId = '123e4567-e89b-12d3-a456-426614174000';
    const mockBlueprint = {
      id: blueprintId,
      static_answers: {
        learningObjective: 'Learn React',
        targetAudience: 'Beginners',
        deliveryMethod: 'Online',
        duration: '60',
        assessmentType: 'Formative',
      },
      user_id: 'test-user-id',
    };

    const mockDynamicQuestions = {
      sections: Array.from({ length: 5 }, (_, si) => ({
        title: `Section ${si + 1}`,
        questions: Array.from({ length: 7 }, (_, qi) => ({
          id: `q${si + 1}-${qi + 1}`,
          question_text: `Question ${qi + 1} in section ${si + 1}`,
          input_type: 'text',
          validation: { required: true, data_type: 'string' },
        })),
      })),
    };

    // Mock Supabase responses
    const mockSelectChain = mockSelect();
    mockSelectChain.eq().single.mockResolvedValue({
      data: mockBlueprint,
      error: null,
    });

    const mockUpdateChain = mockUpdate();
    mockUpdateChain
      .eq()
      .select()
      .single.mockResolvedValue({
        data: { ...mockBlueprint, dynamic_questions: mockDynamicQuestions.sections },
        error: null,
      });

    // Mock Ollama response
    mockOllamaClient.generateQuestions.mockResolvedValue(mockDynamicQuestions);

    const request = new NextRequest('http://localhost:3000/api/generate-dynamic-questions', {
      method: 'POST',
      body: JSON.stringify({ blueprintId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.dynamicQuestions)).toBe(true);
    expect(data.dynamicQuestions.length).toBe(5);
    for (const section of data.dynamicQuestions) {
      expect(Array.isArray(section.questions)).toBe(true);
      expect(section.questions.length).toBe(7);
    }
    expect(mockOllamaClient.generateQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        role: expect.any(String),
        organization: expect.any(String),
        learningGap: expect.any(String),
        resources: expect.any(String),
        constraints: expect.any(String),
        numSections: 5,
        questionsPerSection: 7,
      })
    );
  });

  it('should return 404 if blueprint not found', async () => {
    const blueprintId = '123e4567-e89b-12d3-a456-426614174001';

    const mockSelectChain = mockSelect();
    mockSelectChain.eq().single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    const request = new NextRequest('http://localhost:3000/api/generate-dynamic-questions', {
      method: 'POST',
      body: JSON.stringify({ blueprintId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Blueprint not found');
  });

  it('should return existing dynamic questions if already generated', async () => {
    const blueprintId = '123e4567-e89b-12d3-a456-426614174002';
    const existingQuestions = [
      {
        title: 'Existing Section',
        questions: [
          {
            id: 'q1',
            question: 'Existing question',
            type: 'text',
            required: true,
          },
        ],
      },
    ];

    const mockBlueprint = {
      id: blueprintId,
      static_answers: {},
      dynamic_questions: existingQuestions,
      user_id: 'test-user-id',
    };

    const mockSelectChain = mockSelect();
    mockSelectChain.eq().single.mockResolvedValue({
      data: mockBlueprint,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/generate-dynamic-questions', {
      method: 'POST',
      body: JSON.stringify({ blueprintId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.dynamicQuestions).toEqual(existingQuestions);
    expect(data.message).toBe('Dynamic questions already exist');
    expect(mockOllamaClient.generateQuestions).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-dynamic-questions', {
      method: 'POST',
      body: JSON.stringify({ invalidField: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });
});
