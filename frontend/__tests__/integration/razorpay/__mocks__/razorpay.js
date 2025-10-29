/**
 * Vitest manual mock for Razorpay SDK
 * Provides mock implementations for all required Razorpay SDK methods
 */

const { vi } = require('vitest');

const mockRazorpayInstance = {
  subscriptions: {
    create: vi.fn(),
    fetch: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    fetch: vi.fn(),
  },
  plans: {
    create: vi.fn(),
    all: vi.fn(),
  },
};

module.exports = mockRazorpayInstance;