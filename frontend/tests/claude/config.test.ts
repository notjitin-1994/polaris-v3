/**
 * Tests for Claude API Configuration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getClaudeConfig, isClaudeConfigured } from '@/lib/claude/config';

describe('Claude Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getClaudeConfig', () => {
    it('should load configuration from environment variables', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      process.env.ANTHROPIC_BASE_URL = 'https://test.api.com';
      process.env.ANTHROPIC_VERSION = '2024-01-01';

      const config = getClaudeConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://test.api.com');
      expect(config.version).toBe('2024-01-01');
    });

    it('should use default values when optional env vars are missing', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      delete process.env.ANTHROPIC_BASE_URL;
      delete process.env.ANTHROPIC_VERSION;

      const config = getClaudeConfig();

      expect(config.baseUrl).toBe('https://api.anthropic.com');
      expect(config.version).toBe('2023-06-01');
    });

    it('should trim whitespace from environment variables', () => {
      process.env.ANTHROPIC_API_KEY = '  test-api-key  ';
      process.env.ANTHROPIC_BASE_URL = '  https://test.api.com  ';

      const config = getClaudeConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://test.api.com');
    });

    it('should remove trailing slash from base URL', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      process.env.ANTHROPIC_BASE_URL = 'https://test.api.com/';

      const config = getClaudeConfig();

      expect(config.baseUrl).toBe('https://test.api.com');
    });

    it('should throw error if API key is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

      expect(() => getClaudeConfig()).toThrow('ANTHROPIC_API_KEY environment variable is required');
    });

    it('should throw error if API key is empty string', () => {
      process.env.ANTHROPIC_API_KEY = '';

      expect(() => getClaudeConfig()).toThrow('ANTHROPIC_API_KEY environment variable is required');
    });

    it('should throw error if API key is only whitespace', () => {
      process.env.ANTHROPIC_API_KEY = '   ';

      expect(() => getClaudeConfig()).toThrow('ANTHROPIC_API_KEY environment variable is required');
    });

    it('should return correct model names', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      const config = getClaudeConfig();

      expect(config.primaryModel).toBe('claude-sonnet-4-20250514');
      expect(config.fallbackModel).toBe('claude-opus-4-20250514');
    });

    it('should return correct configuration values', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      const config = getClaudeConfig();

      expect(config.maxTokens).toBe(12000);
      expect(config.temperature).toBe(0.2);
      expect(config.timeout).toBe(120000);
      expect(config.retries).toBe(2);
    });

    it('should try NEXT_PUBLIC_ANTHROPIC_API_KEY as fallback', () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY = 'fallback-api-key';

      const config = getClaudeConfig();

      expect(config.apiKey).toBe('fallback-api-key');
    });
  });

  describe('isClaudeConfigured', () => {
    it('should return true when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      expect(isClaudeConfigured()).toBe(true);
    });

    it('should return true when NEXT_PUBLIC_ANTHROPIC_API_KEY is set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY = 'test-api-key';

      expect(isClaudeConfigured()).toBe(true);
    });

    it('should return false when no API key is set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

      expect(isClaudeConfigured()).toBe(false);
    });

    it('should not throw error when no API key is set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

      expect(() => isClaudeConfigured()).not.toThrow();
    });
  });

  describe('Security', () => {
    it('should not expose API key in client-safe function', () => {
      process.env.ANTHROPIC_API_KEY = 'secret-api-key';

      // isClaudeConfigured should not return the key itself
      const result = isClaudeConfigured();
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    it('should only expose API key through server-side function', () => {
      process.env.ANTHROPIC_API_KEY = 'secret-api-key';

      const config = getClaudeConfig();

      // API key should only be accessible through getClaudeConfig
      expect(config.apiKey).toBe('secret-api-key');
    });
  });
});
