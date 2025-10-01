/**
 * Log Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LogStore } from '@/lib/logging/logStore';
import { LogEntry } from '@/lib/logging/types';

describe('LogStore', () => {
  let store: LogStore;

  beforeEach(() => {
    store = new LogStore(1000);
  });

  const createLogEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    id: `log_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'system',
    event: 'test.event',
    message: 'Test message',
    metadata: {},
    ...overrides,
  });

  describe('Basic Operations', () => {
    it('should add logs', () => {
      const entry = createLogEntry();
      store.add(entry);

      expect(store.count()).toBe(1);
      expect(store.getById(entry.id)).toEqual(entry);
    });

    it('should get all logs', () => {
      store.add(createLogEntry({ message: 'Log 1' }));
      store.add(createLogEntry({ message: 'Log 2' }));

      const logs = store.getAll();

      expect(logs.length).toBe(2);
    });

    it('should clear logs', () => {
      store.add(createLogEntry());
      store.add(createLogEntry());

      expect(store.count()).toBe(2);

      store.clear();

      expect(store.count()).toBe(0);
    });
  });

  describe('Querying', () => {
    beforeEach(() => {
      store.add(createLogEntry({ level: 'debug', service: 'perplexity', message: 'Debug' }));
      store.add(createLogEntry({ level: 'info', service: 'ollama', message: 'Info' }));
      store.add(createLogEntry({ level: 'warn', service: 'database', message: 'Warning' }));
      store.add(createLogEntry({ level: 'error', service: 'api', message: 'Error' }));
    });

    it('should filter by level', () => {
      const errors = store.query({ level: 'error' });

      expect(errors.length).toBe(1);
      expect(errors[0].level).toBe('error');
    });

    it('should filter by multiple levels', () => {
      const results = store.query({ level: ['warn', 'error'] });

      expect(results.length).toBe(2);
    });

    it('should filter by service', () => {
      const results = store.query({ service: 'ollama' });

      expect(results.length).toBe(1);
      expect(results[0].service).toBe('ollama');
    });

    it('should filter by multiple criteria', () => {
      const results = store.query({
        level: 'info',
        service: 'ollama',
      });

      expect(results.length).toBe(1);
      expect(results[0].level).toBe('info');
      expect(results[0].service).toBe('ollama');
    });

    it('should search in message', () => {
      const results = store.query({ search: 'Error' });

      expect(results.length).toBe(1);
      expect(results[0].message).toBe('Error');
    });

    it('should apply limit', () => {
      const results = store.query({ limit: 2 });

      expect(results.length).toBe(2);
    });

    it('should apply offset', () => {
      const results = store.query({ offset: 2, limit: 2 });

      expect(results.length).toBe(2);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      store.add(createLogEntry({ level: 'info' }));
      store.add(createLogEntry({ level: 'info' }));
      store.add(createLogEntry({ level: 'warn' }));
      store.add(createLogEntry({ level: 'error' }));
      store.add(
        createLogEntry({
          level: 'info',
          metadata: { duration: 100 },
        })
      );
      store.add(
        createLogEntry({
          level: 'info',
          metadata: { duration: 200 },
        })
      );
    });

    it('should calculate total count', () => {
      const stats = store.getStats();

      expect(stats.total).toBe(6);
    });

    it('should count by level', () => {
      const stats = store.getStats();

      expect(stats.byLevel.info).toBe(4);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
    });

    it('should calculate error rate', () => {
      const stats = store.getStats();

      expect(stats.errorRate).toBeCloseTo(16.67, 1);
    });

    it('should calculate average duration', () => {
      const stats = store.getStats();

      expect(stats.avgDuration).toBe(150); // (100 + 200) / 2
    });
  });

  describe('Export', () => {
    beforeEach(() => {
      store.add(
        createLogEntry({
          level: 'info',
          message: 'Test message',
          metadata: { userId: 'user-123' },
        })
      );
    });

    it('should export as JSON', () => {
      const json = store.exportJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].message).toBe('Test message');
    });

    it('should export as CSV', () => {
      const csv = store.exportCSV();

      expect(csv).toContain('ID,Timestamp,Level,Service,Event');
      expect(csv).toContain('Test message');
    });

    it('should export as text', () => {
      const text = store.exportText();

      expect(text).toContain('[INFO]');
      expect(text).toContain('Test message');
    });
  });

  describe('Time Range Queries', () => {
    it('should filter by time range', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago

      store.add(createLogEntry({ timestamp: past.toISOString() }));
      store.add(createLogEntry({ timestamp: now.toISOString() }));

      const recent = store.getByTimeRange(
        new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
        now
      );

      expect(recent.length).toBe(1);
    });
  });

  describe('Recent Logs', () => {
    it('should get recent logs', () => {
      for (let i = 0; i < 10; i++) {
        store.add(createLogEntry({ message: `Log ${i}` }));
      }

      const recent = store.getRecent(5);

      expect(recent.length).toBe(5);
      // Should be in reverse chronological order (newest first)
      expect(recent[0].message).toBe('Log 9');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old logs when exceeding threshold', () => {
      const smallStore = new LogStore(10); // Max 10 logs, cleanup at 12

      // Add 15 logs
      for (let i = 0; i < 15; i++) {
        smallStore.add(createLogEntry({ message: `Log ${i}` }));
      }

      // Should keep only the most recent 10
      expect(smallStore.count()).toBe(10);
    });
  });
});
