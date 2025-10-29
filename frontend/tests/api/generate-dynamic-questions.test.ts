import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn(() => {
  return {
    select: mockSelect,
    update: mockUpdate,
  };
});

const mockSupabase = {
  from: mockFrom,
};

vi.mock('@/src/lib/services/dynamicQuestionGenerationV2', () => ({
  generateDynamicQuestionsV2: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

// Import after mocking
import { POST } from '@/app/api/generate-dynamic-questions/route';
import { generateDynamicQuestionsV2 } from '@/src/lib/services/dynamicQuestionGenerationV2';

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

  it('should generate a full 10-section dynamic questionnaire successfully', async () => {
    const blueprintId = '123e4567-e89b-12d3-a456-426614174000';
    const mockBlueprint = {
      id: blueprintId,
      static_answers: {
        section_1_role_experience: {
          current_role: 'Software Developer',
          years_in_role: '3-5',
          custom_role: 'Frontend Developer',
        },
        section_2_organization: {
          organization_name: 'Tech Corp',
          industry_sector: 'Technology',
          organization_size: '100-500',
        },
        section_3_learning_gap: {
          learning_gap_description: 'Need to improve React skills',
          total_learners_range: '10-25',
          budget_available: { amount: 5000, currency: 'USD' },
        },
      },
      user_id: 'test-user-id',
      status: 'draft',
    };

    const mockDynamicQuestions = {
      sections: Array.from({ length: 10 }, (_, si) => ({
        id: `section-${si + 1}`,
        title: `Section ${si + 1}`,
        description: `Description for section ${si + 1}`,
        questions: Array.from({ length: 6 }, (_, qi) => ({
          id: `q${si + 1}-${qi + 1}`,
          label: `Question ${qi + 1} in section ${si + 1}`,
          type: 'text',
          required: true,
        })),
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        totalQuestions: 60,
      },
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

    // Mock the generation service response
    const mockGenerate = vi.mocked(generateDynamicQuestionsV2);
    mockGenerate.mockResolvedValue(mockDynamicQuestions);

    const request = new NextRequest('http://localhost:3000/api/generate-dynamic-questions', {
      method: 'POST',
      body: JSON.stringify({ blueprintId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.dynamicQuestions)).toBe(true);
    expect(data.dynamicQuestions.length).toBe(10);
    for (const section of data.dynamicQuestions) {
      expect(Array.isArray(section.questions)).toBe(true);
      expect(section.questions.length).toBeGreaterThan(0);
    }
    expect(mockGenerate).toHaveBeenCalledWith(blueprintId, mockBlueprint.static_answers);
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
        id: 'section-1',
        title: 'Existing Section',
        description: 'Existing description',
        questions: [
          {
            id: 'q1',
            label: 'Existing question',
            type: 'text',
            required: true,
          },
        ],
      },
    ];

    const mockBlueprint = {
      id: blueprintId,
      static_answers: {
        section_1_role_experience: {},
        section_2_organization: {},
        section_3_learning_gap: {},
      },
      dynamic_questions: existingQuestions,
      user_id: 'test-user-id',
      status: 'draft',
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
    expect(vi.mocked(generateDynamicQuestionsV2)).not.toHaveBeenCalled();
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