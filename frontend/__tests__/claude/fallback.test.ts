/**
 * Tests for Claude Fallback Logic
 */

import { describe, it, expect } from 'vitest';
import {
  shouldFallbackToOpus,
  shouldFallbackToOllama,
  FallbackTrigger,
  type FallbackDecision,
} from '@/lib/claude/fallback';
import { ClaudeApiError } from '@/lib/claude/client';
import { ValidationError } from '@/lib/claude/validation';

describe('Claude Fallback Logic', () => {
  describe('shouldFallbackToOpus', () => {
    describe('ClaudeApiError scenarios', () => {
      it('should fallback on timeout error', () => {
        const error = new ClaudeApiError('Request timeout', 408, 'timeout');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.TIMEOUT);
        expect(decision.reason).toContain('timeout');
      });

      it('should fallback on rate limit error (429)', () => {
        const error = new ClaudeApiError('Rate limit', 429);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.RATE_LIMIT);
      });

      it('should fallback on rate_limit_error type', () => {
        const error = new ClaudeApiError('Rate limit', 200, 'rate_limit_error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.RATE_LIMIT);
      });

      it('should fallback on 401 Unauthorized', () => {
        const error = new ClaudeApiError('Unauthorized', 401);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.INVALID_API_KEY);
      });

      it('should fallback on 403 Forbidden', () => {
        const error = new ClaudeApiError('Forbidden', 403);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.INVALID_API_KEY);
      });

      it('should fallback on 4xx client errors', () => {
        const error = new ClaudeApiError('Bad Request', 400);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.API_ERROR_4XX);
        expect(decision.reason).toContain('400');
      });

      it('should fallback on 404 Not Found', () => {
        const error = new ClaudeApiError('Not Found', 404);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.API_ERROR_4XX);
      });

      it('should fallback on 5xx server errors', () => {
        const error = new ClaudeApiError('Internal Server Error', 500);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.API_ERROR_5XX);
        expect(decision.reason).toContain('500');
      });

      it('should fallback on 502 Bad Gateway', () => {
        const error = new ClaudeApiError('Bad Gateway', 502);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.API_ERROR_5XX);
      });

      it('should fallback on 503 Service Unavailable', () => {
        const error = new ClaudeApiError('Service Unavailable', 503);
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.API_ERROR_5XX);
      });

      it('should fallback on network_error type', () => {
        const error = new ClaudeApiError('Network failed', undefined, 'network_error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.NETWORK_ERROR);
      });

      it('should fallback on parse_error type', () => {
        const error = new ClaudeApiError('Parse failed', undefined, 'parse_error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.JSON_PARSE_ERROR);
      });
    });

    describe('ValidationError scenarios', () => {
      it('should fallback on INVALID_JSON validation error', () => {
        const error = new ValidationError('Invalid JSON', 'INVALID_JSON');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.JSON_PARSE_ERROR);
      });

      it('should NOT fallback on structural validation errors', () => {
        const error = new ValidationError('Missing metadata', 'MISSING_METADATA');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(false);
      });

      it('should NOT fallback on NO_SECTIONS error', () => {
        const error = new ValidationError('No sections', 'NO_SECTIONS');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(false);
      });

      it('should NOT fallback on MISSING_METADATA_FIELD error', () => {
        const error = new ValidationError('Missing field', 'MISSING_METADATA_FIELD');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(false);
      });
    });

    describe('Generic Error scenarios', () => {
      it('should fallback on network-related errors', () => {
        const error = new Error('fetch failed');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.NETWORK_ERROR);
      });

      it('should fallback on network connectivity errors', () => {
        const error = new Error('network timeout');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.NETWORK_ERROR);
      });

      it('should NOT fallback on unknown error types', () => {
        const error = new Error('Unknown error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(false);
      });

      it('should NOT fallback on application logic errors', () => {
        const error = new Error('Invalid input');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(false);
      });
    });

    describe('Decision object structure', () => {
      it('should include originalError in decision', () => {
        const error = new ClaudeApiError('Test error', 500);
        const decision = shouldFallbackToOpus(error);

        expect(decision.originalError).toBe(error);
      });

      it('should include trigger when fallback is warranted', () => {
        const error = new ClaudeApiError('Test error', 500);
        const decision = shouldFallbackToOpus(error);

        expect(decision.trigger).toBeDefined();
        expect(decision.reason).toBeDefined();
      });

      it('should not include trigger when fallback is not warranted', () => {
        const error = new Error('Unknown error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.trigger).toBeUndefined();
        expect(decision.reason).toBeUndefined();
      });
    });

    describe('Edge cases', () => {
      it('should handle ClaudeApiError without status code', () => {
        const error = new ClaudeApiError('Generic error');
        const decision = shouldFallbackToOpus(error);

        // Should only fallback if errorType indicates a fallback-worthy error
        expect(decision.shouldFallback).toBe(false);
      });

      it('should handle ClaudeApiError with only errorType', () => {
        const error = new ClaudeApiError('Error', undefined, 'timeout');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.TIMEOUT);
      });

      it('should prioritize errorType over statusCode for rate limits', () => {
        const error = new ClaudeApiError('Rate limit', 200, 'rate_limit_error');
        const decision = shouldFallbackToOpus(error);

        expect(decision.shouldFallback).toBe(true);
        expect(decision.trigger).toBe(FallbackTrigger.RATE_LIMIT);
      });
    });
  });

  describe('shouldFallbackToOllama', () => {
    it('should always return true when both Claude models fail', () => {
      const sonnetError = new ClaudeApiError('Sonnet failed', 500);
      const opusError = new ClaudeApiError('Opus failed', 500);

      const result = shouldFallbackToOllama(sonnetError, opusError);

      expect(result).toBe(true);
    });

    it('should handle different error types for both models', () => {
      const sonnetError = new Error('Network error');
      const opusError = new ValidationError('Parse error', 'INVALID_JSON');

      const result = shouldFallbackToOllama(sonnetError, opusError);

      expect(result).toBe(true);
    });

    it('should work with generic errors', () => {
      const sonnetError = new Error('Error 1');
      const opusError = new Error('Error 2');

      const result = shouldFallbackToOllama(sonnetError, opusError);

      expect(result).toBe(true);
    });
  });
});
