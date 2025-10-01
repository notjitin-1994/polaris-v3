/**
 * Tests for Claude Blueprint Generation API Endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, OPTIONS } from '@/app/api/claude/generate-blueprint/route';
import { ClaudeClient, ClaudeApiError } from '@/lib/claude/client';
import { ValidationError } from '@/lib/claude/validation';

// Mock Claude client
vi.mock('@/lib/claude/client', () => {
  return {
    ClaudeClient: vi.fn().mockImplementation(() => ({
      generate: vi.fn(),
    })),
    ClaudeApiError: class ClaudeApiError extends Error {
      constructor(
        message: string,
        public statusCode?: number,
        public errorType?: string
      ) {
        super(message);
        this.name = 'ClaudeApiError';
      }
    },
  };
});

// Mock validation
vi.mock('@/lib/claude/validation', () => {
  return {
    validateAndNormalizeBlueprint: vi.fn((text: string) => {
      const parsed = JSON.parse(text);
      return { ...parsed, normalized: true };
    }),
    ValidationError: class ValidationError extends Error {
      constructor(
        message: string,
        public code: string
      ) {
        super(message);
        this.name = 'ValidationError';
      }
    },
  };
});

// Mock config
vi.mock('@/lib/claude/config', () => {
  return {
    getClaudeConfig: vi.fn(() => ({
      primaryModel: 'claude-sonnet-4-20250514',
      apiKey: 'test-key',
      baseUrl: 'https://api.anthropic.com',
      version: '2023-06-01',
      maxTokens: 12000,
      temperature: 0.2,
      timeout: 120000,
      retries: 2,
    })),
  };
});

// Mock logger
vi.mock('@/lib/logging', () => {
  return {
    createServiceLogger: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  };
});

describe('Claude Blueprint Generation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/claude/generate-blueprint', () => {
    const mockRequest = (body: any) =>
      ({
        json: async () => body,
      }) as any;

    const mockClaudeResponse = {
      id: 'msg_123',
      type: 'message' as const,
      role: 'assistant' as const,
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            metadata: {
              title: 'Test Blueprint',
              organization: 'Acme',
              role: 'Manager',
              generated_at: '2025-10-01T12:00:00Z',
            },
            executive_summary: {
              content: 'Summary',
              displayType: 'markdown',
            },
          }),
        },
      ],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 100,
        output_tokens: 500,
      },
    };

    it('should generate blueprint successfully', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      // Mock extractText static method
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.blueprint).toBeDefined();
      expect(data.blueprint.normalized).toBe(true);
      expect(data.usage).toEqual({
        input_tokens: 100,
        output_tokens: 500,
      });
      expect(data.metadata).toHaveProperty('model');
      expect(data.metadata).toHaveProperty('duration');
      expect(data.metadata).toHaveProperty('timestamp');
    });

    it('should use custom model if provided', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      const req = mockRequest({
        model: 'claude-opus-4-20250514',
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      await POST(req);

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-opus-4-20250514',
        })
      );
    });

    it('should return 400 for missing systemPrompt', async () => {
      const req = mockRequest({
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for missing userPrompt', async () => {
      const req = mockRequest({
        systemPrompt: 'You are an expert',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for missing blueprintId', async () => {
      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should handle ClaudeApiError', async () => {
      const mockGenerate = vi
        .fn()
        .mockRejectedValue(new ClaudeApiError('Rate limit exceeded', 429, 'rate_limit_error'));
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Claude API error');
    });

    it('should handle ValidationError', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      // Mock validation to throw error
      const { validateAndNormalizeBlueprint } = await import('@/lib/claude/validation');
      (validateAndNormalizeBlueprint as any).mockImplementation(() => {
        throw new ValidationError('Invalid blueprint', 'INVALID_STRUCTURE');
      });

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation error');
    });

    it('should handle unknown errors', async () => {
      const mockGenerate = vi.fn().mockRejectedValue(new Error('Unknown error'));
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('unexpected error');
    });

    it('should include duration in metadata', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      // Reset validation mock to default behavior
      const { validateAndNormalizeBlueprint } = await import('@/lib/claude/validation');
      (validateAndNormalizeBlueprint as any).mockImplementation((text: string) => {
        const parsed = JSON.parse(text);
        return { ...parsed, normalized: true };
      });

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.metadata.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include timestamp in metadata', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (ClaudeClient as any).mockImplementation(() => ({
        generate: mockGenerate,
      }));

      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      // Reset validation mock to default behavior
      const { validateAndNormalizeBlueprint } = await import('@/lib/claude/validation');
      (validateAndNormalizeBlueprint as any).mockImplementation((text: string) => {
        const parsed = JSON.parse(text);
        return { ...parsed, normalized: true };
      });

      const beforeTime = new Date().toISOString();

      const req = mockRequest({
        systemPrompt: 'You are an expert',
        userPrompt: 'Generate a blueprint',
        blueprintId: 'bp-123',
      });

      const response = await POST(req);
      const data = await response.json();

      const afterTime = new Date().toISOString();

      expect(data.metadata.timestamp).toBeDefined();
      expect(data.metadata.timestamp >= beforeTime).toBe(true);
      expect(data.metadata.timestamp <= afterTime).toBe(true);
    });
  });

  describe('OPTIONS /api/claude/generate-blueprint', () => {
    it('should handle CORS preflight request', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });
  });
});
