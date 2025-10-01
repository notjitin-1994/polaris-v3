/**
 * Logger Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLogger, createServiceLogger } from '@/lib/logging';
import { LogLevel } from '@/lib/logging/types';

describe('Logger Service', () => {
  beforeEach(() => {
    // Clear logs before each test
    const logger = getLogger();
    logger.clear();
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      const logger = getLogger();
      const entry = logger.info('test.event', 'Test message', { test: true });

      expect(entry).toBeDefined();
      expect(entry.level).toBe('info');
      expect(entry.event).toBe('test.event');
      expect(entry.message).toBe('Test message');
      expect(entry.metadata.test).toBe(true);
    });

    it('should log error messages', () => {
      const logger = getLogger();
      const error = new Error('Test error');
      const entry = logger.error('test.error', 'Error occurred', { error });

      expect(entry).toBeDefined();
      expect(entry.level).toBe('error');
      expect(entry.metadata.error).toBe('Test error');
      expect(entry.metadata.errorStack).toBeDefined();
    });

    it('should log warning messages', () => {
      const logger = getLogger();
      const entry = logger.warn('test.warning', 'Warning message');

      expect(entry).toBeDefined();
      expect(entry.level).toBe('warn');
    });

    it('should log debug messages', () => {
      const logger = getLogger();
      logger.setMinLevel('debug'); // Ensure debug is logged
      const entry = logger.debug('test.debug', 'Debug message');

      expect(entry).toBeDefined();
      expect(entry!.level).toBe('debug');
    });
  });

  describe('Service-Specific Loggers', () => {
    it('should create service-specific logger', () => {
      const perplexityLogger = getLogger('perplexity');
      const entry = perplexityLogger.info('request', 'Test');

      expect(entry).toBeDefined();
      expect(entry!.service).toBe('perplexity');
    });

    it('should maintain service context across logs', () => {
      const ollamaLogger = getLogger('ollama');
      const entry1 = ollamaLogger.info('event1', 'Message 1');
      const entry2 = ollamaLogger.info('event2', 'Message 2');

      expect(entry1).toBeDefined();
      expect(entry2).toBeDefined();
      expect(entry1!.service).toBe('ollama');
      expect(entry2!.service).toBe('ollama');
    });
  });

  describe('Sensitive Data Scrubbing', () => {
    it('should redact API keys', () => {
      const logger = getLogger();
      const entry = logger.info('test', 'Message', {
        api_key: 'secret-key-123',
        apiKey: 'another-secret',
      });

      expect(entry.metadata.api_key).toBe('[REDACTED]');
      expect(entry.metadata.apiKey).toBe('[REDACTED]');
    });

    it('should redact tokens', () => {
      const logger = getLogger();
      const entry = logger.info('test', 'Message', {
        token: 'bearer-token-123',
        access_token: 'access-123',
      });

      expect(entry.metadata.token).toBe('[REDACTED]');
      expect(entry.metadata.access_token).toBe('[REDACTED]');
    });

    it('should redact passwords', () => {
      const logger = getLogger();
      const entry = logger.info('test', 'Message', {
        password: 'secret-password',
        user_password: 'another-secret',
      });

      expect(entry.metadata.password).toBe('[REDACTED]');
      expect(entry.metadata.user_password).toBe('[REDACTED]');
    });

    it('should not redact non-sensitive data', () => {
      const logger = getLogger();
      const entry = logger.info('test', 'Message', {
        userId: 'user-123',
        blueprintId: 'bp-456',
        model: 'sonar-pro',
      });

      expect(entry.metadata.userId).toBe('user-123');
      expect(entry.metadata.blueprintId).toBe('bp-456');
      expect(entry.metadata.model).toBe('sonar-pro');
    });
  });

  describe('Timer Functionality', () => {
    it('should measure duration', async () => {
      const logger = getLogger();
      const endTimer = logger.startTimer('test.operation', 'Test operation');

      await new Promise((resolve) => setTimeout(resolve, 100));
      endTimer();

      const logs = logger.getStore().getAll();
      const completionLog = logs.find((l) => l.event === 'test.operation.complete');

      expect(completionLog).toBeDefined();
      expect(completionLog!.metadata.duration).toBeGreaterThanOrEqual(99);
    });
  });

  describe('Error Wrapping', () => {
    it('should log successful operations', async () => {
      const logger = getLogger();
      logger.setMinLevel('debug'); // Ensure debug logs are captured

      await logger.withLogging(
        'test.success',
        'Successful operation',
        async () => {
          return 'result';
        },
        { test: true }
      );

      const logs = logger.getStore().getAll();
      const startLog = logs.find((l) => l.event === 'test.success.start');
      const completeLog = logs.find((l) => l.event === 'test.success.complete');

      expect(startLog).toBeDefined();
      expect(completeLog).toBeDefined();
      expect(completeLog!.metadata.duration).toBeDefined();
    });

    it('should log failed operations', async () => {
      const logger = getLogger();
      const testError = new Error('Operation failed');

      await expect(
        logger.withLogging('test.failure', 'Failed operation', async () => {
          throw testError;
        })
      ).rejects.toThrow('Operation failed');

      const logs = logger.getStore().getAll();
      const errorLog = logs.find((l) => l.event === 'test.failure.error');

      expect(errorLog).toBeDefined();
      expect(errorLog!.level).toBe('error');
    });
  });

  describe('Log Levels', () => {
    it('should respect minimum log level', () => {
      const logger = getLogger();
      logger.setMinLevel('warn');

      logger.debug('test', 'Debug message');
      logger.info('test', 'Info message');
      logger.warn('test', 'Warning message');

      const logs = logger.getStore().getAll();

      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('warn');
    });

    it('should log all levels when set to debug', () => {
      const logger = getLogger();
      logger.setMinLevel('debug');

      logger.debug('test', 'Debug');
      logger.info('test', 'Info');
      logger.warn('test', 'Warning');
      logger.error('test', 'Error');

      const logs = logger.getStore().getAll();

      expect(logs.length).toBe(4);
    });
  });

  describe('Log Storage', () => {
    it('should store logs in memory', () => {
      const logger = getLogger();

      logger.info('event1', 'Message 1');
      logger.info('event2', 'Message 2');
      logger.info('event3', 'Message 3');

      const logs = logger.getStore().getAll();

      expect(logs.length).toBe(3);
    });

    it('should clear logs', () => {
      const logger = getLogger();

      logger.info('event1', 'Message 1');
      logger.info('event2', 'Message 2');

      expect(logger.getStore().count()).toBe(2);

      logger.clear();

      expect(logger.getStore().count()).toBe(0);
    });
  });
});
