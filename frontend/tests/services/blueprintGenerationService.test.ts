/**
 * Tests for Blueprint Generation Orchestrator Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlueprintGenerationService } from '@/lib/services/blueprintGenerationService';
import { ClaudeClient, ClaudeApiError } from '@/lib/claude/client';
import { OllamaClient } from '@/lib/ollama/client';
import type { BlueprintContext } from '@/lib/claude/prompts';

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

// Mock Ollama client
vi.mock('@/lib/ollama/client', () => {
  return {
    OllamaClient: vi.fn().mockImplementation(() => ({
      generateBlueprint: vi.fn(),
    })),
  };
});

// Mock config
vi.mock('@/lib/claude/config', () => {
  return {
    getClaudeConfig: vi.fn(() => ({
      primaryModel: 'claude-sonnet-4-20250514',
      fallbackModel: 'claude-opus-4-20250514',
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

// Mock validation
vi.mock('@/lib/claude/validation', () => {
  class ValidationError extends Error {
    constructor(
      message: string,
      public code: string
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  }

  return {
    validateAndNormalizeBlueprint: vi.fn((text: string) => {
      const parsed = JSON.parse(text);
      return { ...parsed, normalized: true };
    }),
    ValidationError,
  };
});

// Mock logging
vi.mock('@/lib/logging', () => {
  return {
    createServiceLogger: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  };
});

describe('BlueprintGenerationService', () => {
  let service: BlueprintGenerationService;

  const mockContext: BlueprintContext = {
    blueprintId: 'bp-123',
    userId: 'user-456',
    organization: 'Acme Corp',
    role: 'Training Manager',
    industry: 'Technology',
    staticAnswers: { company_size: '100-500' },
    dynamicAnswers: { budget: '$50k' },
    learningObjectives: ['Improve skills'],
  };

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BlueprintGenerationService();

    // Setup ClaudeClient.extractText mock
    ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);
  });

  describe('generate', () => {
    it('should generate blueprint with Claude Sonnet 4 (primary)', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (service as any).claudeClient.generate = mockGenerate;

      const result = await service.generate(mockContext);

      expect(result.success).toBe(true);
      expect(result.blueprint.normalized).toBe(true);
      expect(result.metadata.model).toBe('claude-sonnet-4');
      expect(result.metadata.fallbackUsed).toBe(false);
      expect(result.metadata.attempts).toBe(1);
      expect(result.usage).toEqual({
        input_tokens: 100,
        output_tokens: 500,
      });
    });

    it('should call Claude Sonnet 4 with correct parameters', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (service as any).claudeClient.generate = mockGenerate;

      await service.generate(mockContext);

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 12000,
          temperature: 0.2,
          system: expect.stringContaining('Learning Experience Designer'),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Acme Corp'),
            }),
          ]),
        })
      );
    });

    it('should fallback to Claude Opus 4 on Sonnet 4 failure', async () => {
      const mockGenerate = vi
        .fn()
        .mockRejectedValueOnce(new ClaudeApiError('Timeout', 408, 'timeout'))
        .mockResolvedValueOnce({
          ...mockClaudeResponse,
          model: 'claude-opus-4-20250514',
        });

      (service as any).claudeClient.generate = mockGenerate;
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      const result = await service.generate(mockContext);

      expect(result.success).toBe(true);
      expect(result.metadata.model).toBe('claude-opus-4');
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.metadata.attempts).toBe(2);
      expect(mockGenerate).toHaveBeenCalledTimes(2);
    });

    it('should call Claude Opus 4 with higher max_tokens', async () => {
      const mockGenerate = vi
        .fn()
        .mockRejectedValueOnce(new ClaudeApiError('Error', 500))
        .mockResolvedValueOnce(mockClaudeResponse);

      (service as any).claudeClient.generate = mockGenerate;
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      await service.generate(mockContext);

      // Second call should be Opus 4 with 16000 tokens
      expect(mockGenerate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          model: 'claude-opus-4-20250514',
          max_tokens: 16000,
        })
      );
    });

    it('should fallback to Ollama when both Claude models fail', async () => {
      const mockClaudeGenerate = vi
        .fn()
        .mockRejectedValueOnce(new ClaudeApiError('Sonnet error', 500))
        .mockRejectedValueOnce(new ClaudeApiError('Opus error', 500));

      (service as any).claudeClient.generate = mockClaudeGenerate;

      const mockOllamaResponse = {
        metadata: {
          title: 'Ollama Blueprint',
          organization: 'Acme',
          role: 'Manager',
          generated_at: '2025-10-01T12:00:00Z',
        },
        executive_summary: {
          content: 'Ollama summary',
          displayType: 'markdown',
        },
      };

      const mockOllamaGenerate = vi.fn().mockResolvedValue(mockOllamaResponse);
      (service as any).ollamaClient.generateBlueprint = mockOllamaGenerate;

      const result = await service.generate(mockContext);

      expect(result.success).toBe(true);
      expect(result.metadata.model).toBe('ollama');
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.metadata.attempts).toBe(3);
      expect(mockOllamaGenerate).toHaveBeenCalledTimes(1);
    });

    it('should return error when all models fail', async () => {
      const mockClaudeGenerate = vi
        .fn()
        .mockRejectedValueOnce(new ClaudeApiError('Sonnet error', 500))
        .mockRejectedValueOnce(new ClaudeApiError('Opus error', 500));

      (service as any).claudeClient.generate = mockClaudeGenerate;

      const mockOllamaGenerate = vi.fn().mockRejectedValue(new Error('Ollama unavailable'));
      (service as any).ollamaClient.generateBlueprint = mockOllamaGenerate;

      const result = await service.generate(mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('All blueprint generation methods failed');
      expect(result.metadata.attempts).toBe(3);
    });

    it('should not fallback if error does not warrant it', async () => {
      // Structural validation error - doesn't warrant fallback
      const mockGenerate = vi.fn().mockRejectedValue(new Error('Structural validation error'));

      (service as any).claudeClient.generate = mockGenerate;

      // Mock shouldFallbackToOpus to return false
      vi.doMock('@/lib/claude/fallback', () => ({
        shouldFallbackToOpus: () => ({ shouldFallback: false, originalError: new Error('test') }),
        logFallbackDecision: vi.fn(),
      }));

      const result = await service.generate(mockContext);

      expect(result.success).toBe(false);
      expect(mockGenerate).toHaveBeenCalledTimes(1); // Only called once, no fallback
    });

    it('should reuse same prompts for all models', async () => {
      const mockClaudeGenerate = vi
        .fn()
        .mockRejectedValueOnce(new ClaudeApiError('Sonnet error', 500))
        .mockResolvedValueOnce(mockClaudeResponse);

      (service as any).claudeClient.generate = mockClaudeGenerate;
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      await service.generate(mockContext);

      // Both calls should have same system prompt
      const call1 = mockClaudeGenerate.mock.calls[0][0];
      const call2 = mockClaudeGenerate.mock.calls[1][0];

      expect(call1.system).toBe(call2.system);
      expect(call1.messages[0].content).toBe(call2.messages[0].content);
    });

    it('should include duration in metadata', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (service as any).claudeClient.generate = mockGenerate;
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      const result = await service.generate(mockContext);

      expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.metadata.duration).toBe('number');
    });

    it('should include timestamp in metadata', async () => {
      const mockGenerate = vi.fn().mockResolvedValue(mockClaudeResponse);
      (service as any).claudeClient.generate = mockGenerate;
      ClaudeClient.extractText = vi.fn().mockReturnValue(mockClaudeResponse.content[0].text);

      const beforeTime = new Date().toISOString();
      const result = await service.generate(mockContext);
      const afterTime = new Date().toISOString();

      expect(result.metadata.timestamp).toBeDefined();
      expect(result.metadata.timestamp >= beforeTime).toBe(true);
      expect(result.metadata.timestamp <= afterTime).toBe(true);
    });
  });
});
