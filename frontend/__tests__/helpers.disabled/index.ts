/**
 * Test Helpers and Utilities
 *
 * Provides comprehensive helper functions for common test scenarios
 */

import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { faker } from '@faker-js/faker';
import {
  createUser,
  createSession,
  createUserProfile,
  createApiRequest,
  createRazorpayCustomer,
  createRazorpaySubscription,
  createSubscription,
  createPayment,
  createWebhookEvent,
  generateId,
  generateDate
} from '../mocks/factories';

/**
 * Request helpers for API testing
 */
export class RequestHelpers {
  /**
   * Creates a mock NextRequest for testing API routes
   */
  static createMockNextRequest(
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, string>;
    } = {}
  ): NextRequest {
    const { method = 'POST', headers = {}, body, query } = options;

    // Build URL with query parameters
    let fullUrl = url;
    if (query) {
      const searchParams = new URLSearchParams(query);
      fullUrl = `${url}?${searchParams.toString()}`;
    }

    const request = new NextRequest(fullUrl, {
      method,
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': faker.internet.ip(),
        'x-real-ip': faker.internet.ip(),
        'user-agent': faker.internet.userAgent(),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return request;
  }

  /**
   * Creates a mock authenticated request
   */
  static createAuthenticatedRequest(
    url: string,
    user = createUser(),
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ): NextRequest {
    const session = createSession(user);
    return this.createMockNextRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        authorization: `Bearer ${session.access_token}`,
        cookie: `access_token=${session.access_token}`,
      },
    });
  }

  /**
   * Creates a mock subscription request
   */
  static createSubscriptionRequest(
    tier = 'navigator',
    billingCycle = 'monthly',
    overrides = {}
  ): NextRequest {
    return this.createMockNextRequest('/api/subscriptions/create', {
      body: {
        tier,
        billingCycle,
        customerInfo: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          contact: faker.phone.number('+91##########')
        },
        ...overrides
      }
    });
  }

  /**
   * Creates a mock webhook request
   */
  static createWebhookRequest(
    eventType: string,
    payload: any,
    signature?: string
  ): NextRequest {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-razorpay-signature': signature || faker.datatype.string(64),
      'x-razorpay-event-id': generateId('evt_'),
    };

    return this.createMockNextRequest('/api/webhooks/razorpay', {
      method: 'POST',
      headers,
      body: {
        event: eventType,
        payload,
        created_at: Math.floor(Date.now() / 1000)
      }
    });
  }
}

/**
 * Database helpers for test data management
 */
export class DatabaseHelpers {
  /**
   * Seeds test data in Supabase
   */
  static async seedTestData(supabase: any, data: {
    users?: any[];
    profiles?: any[];
    subscriptions?: any[];
    payments?: any[];
    webhooks?: any[];
  }) {
    const results: Record<string, any> = {};

    if (data.users?.length) {
      const { data: users, error } = await supabase
        .from('users')
        .upsert(data.users)
        .select();
      results.users = { data: users, error };
    }

    if (data.profiles?.length) {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .upsert(data.profiles)
        .select();
      results.profiles = { data: profiles, error };
    }

    if (data.subscriptions?.length) {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .upsert(data.subscriptions)
        .select();
      results.subscriptions = { data: subscriptions, error };
    }

    if (data.payments?.length) {
      const { data: payments, error } = await supabase
        .from('payments')
        .upsert(data.payments)
        .select();
      results.payments = { data: payments, error };
    }

    if (data.webhooks?.length) {
      const { data: webhooks, error } = await supabase
        .from('razorpay_webhook_events')
        .upsert(data.webhooks)
        .select();
      results.webhooks = { data: webhooks, error };
    }

    return results;
  }

  /**
   * Cleans up test data
   */
  static async cleanupTestData(supabase: any, userIds: string[]) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .in('user_id', userIds);

    if (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  /**
   * Creates a complete test user with profile and subscription
   */
  static async createTestUserWithSubscription(
    supabase: any,
    overrides: {
      user?: any;
      profile?: any;
      subscription?: any;
    } = {}
  ) {
    const user = createUser(overrides.user);
    const profile = createUserProfile(user.id, overrides.profile);
    const subscription = createSubscription(user.id, overrides.subscription);

    await this.seedTestData(supabase, {
      users: [user],
      profiles: [profile],
      subscriptions: [subscription]
    });

    return { user, profile, subscription };
  }
}

/**
 * Assertion helpers for common test patterns
 */
export class AssertionHelpers {
  /**
   * Asserts that an API response has the expected structure
   */
  static assertApiResponse(
    response: any,
    expectedStatus: number,
    expectedFields?: string[]
  ) {
    expect(response.status).toBe(expectedStatus);

    const data = response.data || response.body || response;
    expect(data).toBeDefined();

    if (expectedFields) {
      expectedFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    }
  }

  /**
   * Asserts that a subscription has the expected structure
   */
  static assertSubscriptionStructure(subscription: any) {
    expect(subscription).toHaveProperty('subscription_id');
    expect(subscription).toHaveProperty('user_id');
    expect(subscription).toHaveProperty('razorpay_subscription_id');
    expect(subscription).toHaveProperty('status');
    expect(subscription).toHaveProperty('subscription_tier');
    expect(subscription).toHaveProperty('created_at');
  }

  /**
   * Asserts that a payment has the expected structure
   */
  static assertPaymentStructure(payment: any) {
    expect(payment).toHaveProperty('payment_id');
    expect(payment).toHaveProperty('subscription_id');
    expect(payment).toHaveProperty('razorpay_payment_id');
    expect(payment).toHaveProperty('amount');
    expect(payment).toHaveProperty('currency');
    expect(payment).toHaveProperty('status');
  }

  /**
   * Asserts that a webhook event has the expected structure
   */
  static assertWebhookEventStructure(event: any) {
    expect(event).toHaveProperty('webhook_event_id');
    expect(event).toHaveProperty('event_type');
    expect(event).toHaveProperty('payload');
    expect(event).toHaveProperty('processed');
    expect(event).toHaveProperty('created_at');
  }

  /**
   * Asserts that a user profile has the expected structure
   */
  static assertUserProfileStructure(profile: any) {
    expect(profile).toHaveProperty('user_id');
    expect(profile).toHaveProperty('subscription_tier');
    expect(profile).toHaveProperty('user_role');
    expect(profile).toHaveProperty('blueprint_creation_count');
    expect(profile).toHaveProperty('blueprint_creation_limit');
    expect(profile).toHaveProperty('blueprint_saving_count');
    expect(profile).toHaveProperty('blueprint_saving_limit');
  }
}

/**
 * Mock helpers for creating predictable test scenarios
 */
export class MockHelpers {
  /**
   * Creates a mock Supabase client with specific user context
   */
  static createMockSupabaseWithContext(user = createUser()) {
    const profile = createUserProfile(user.id);

    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null })
          })
        })
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: user, error: null }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: createSession(user) },
          error: null
        })
      },
      rpc: vi.fn().mockResolvedValue({ data: null, error: null })
    };
  }

  /**
   * Creates a mock Razorpay client with specific responses
   */
  static createMockRazorpayWithContext() {
    const customer = createRazorpayCustomer();
    const subscription = createRazorpaySubscription(customer.id);
    const payment = createPayment(subscription.id);

    return {
      customers: {
        create: vi.fn().mockResolvedValue({ id: customer.id, ...customer }),
        fetch: vi.fn().mockResolvedValue({ id: customer.id, ...customer })
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({ id: subscription.id, ...subscription }),
        fetch: vi.fn().mockResolvedValue({ id: subscription.id, ...subscription }),
        cancel: vi.fn().mockResolvedValue({ id: subscription.id, ...subscription })
      },
      payments: {
        fetch: vi.fn().mockResolvedValue({ id: payment.razorpay_payment_id, ...payment })
      },
      plans: {
        all: vi.fn().mockResolvedValue({
          data: [subscription],
          has_more: false
        })
      }
    };
  }

  /**
   * Creates mock environment variables for testing
   */
  static createMockEnvironment(overrides: Record<string, string> = {}) {
    const defaults = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      ANTHROPIC_API_KEY: 'test-anthropic-key',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_test_1234567890',
      NODE_ENV: 'test',
      ...overrides
    };

    Object.entries(defaults).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return defaults;
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceHelpers {
  /**
   * Measures execution time of a function
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T> | T
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();

    return {
      result,
      executionTime: Math.round((endTime - startTime) * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Asserts that a function completes within time limit
   */
  static async assertExecutionTime<T>(
    fn: () => Promise<T> | T,
    maxTimeMs: number
  ): Promise<T> {
    const { result, executionTime } = await this.measureExecutionTime(fn);

    expect(executionTime).toBeLessThan(maxTimeMs);

    return result;
  }

  /**
   * Runs multiple iterations and returns average time
   */
  static async getAverageExecutionTime<T>(
    fn: () => Promise<T> | T,
    iterations = 10
  ): Promise<number> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { executionTime } = await this.measureExecutionTime(fn);
      times.push(executionTime);
    }

    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    return Math.round(average * 100) / 100;
  }
}

/**
 * Security testing helpers
 */
export class SecurityHelpers {
  /**
   * Creates malicious payloads for security testing
   */
  static createMaliciousPayloads() {
    return {
      sqlInjection: "'; DROP TABLE users; --",
      xssPayload: "<script>alert('XSS')</script>",
      pathTraversal: "../../../etc/passwd",
      largePayload: 'A'.repeat(10 * 1024 * 1024), // 10MB
      malformedJson: '{"unclosed": "json"',
      nullBytes: "test\x00payload",
      controlCharacters: "test\r\n\t\x1b[31mred\x1b[0m"
    };
  }

  /**
   * Creates test requests with various attack vectors
   */
  static createSecurityTestRequests(baseUrl: string) {
    const payloads = this.createMaliciousPayloads();

    return {
      sqlInjection: RequestHelpers.createMockNextRequest(baseUrl, {
        body: { query: payloads.sqlInjection }
      }),
      xss: RequestHelpers.createMockNextRequest(baseUrl, {
        body: { content: payloads.xssPayload }
      }),
      pathTraversal: RequestHelpers.createMockNextRequest(`${baseUrl}/${payloads.pathTraversal}`),
      largePayload: RequestHelpers.createMockNextRequest(baseUrl, {
        body: { data: payloads.largePayload }
      }),
      malformedJson: RequestHelpers.createMockNextRequest(baseUrl, {
        headers: { 'content-type': 'application/json' },
        body: payloads.malformedJson
      })
    };
  }

  /**
   * Tests rate limiting by making multiple rapid requests
   */
  static async testRateLimiting(
    requestFn: () => Promise<any>,
    maxRequests = 10
  ): Promise<{ successCount: number; rateLimitedCount: number; responses: any[] }> {
    const responses: any[] = [];
    let successCount = 0;
    let rateLimitedCount = 0;

    for (let i = 0; i < maxRequests; i++) {
      try {
        const response = await requestFn();
        responses.push(response);

        if (response.status === 429) {
          rateLimitedCount++;
        } else if (response.status < 400) {
          successCount++;
        }
      } catch (error) {
        responses.push({ error: error.message });
      }
    }

    return { successCount, rateLimitedCount, responses };
  }
}

/**
 * Integration test helpers
 */
export class IntegrationHelpers {
  /**
   * Creates a complete subscription flow test scenario
   */
  static async createSubscriptionFlow(
    supabase: any,
    razorpay: any,
    tier = 'navigator',
    billingCycle = 'monthly'
  ) {
    // Create user
    const user = createUser();
    const profile = createUserProfile(user.id);

    // Create Razorpay entities
    const customer = createRazorpayCustomer(user.id);
    const plan = { id: generateId('plan_'), item: { amount: 290000 } };
    const subscription = createRazorpaySubscription(customer.id, plan.id);
    const payment = createPayment(subscription.id);

    // Set up mocks
    razorpay.customers.create.mockResolvedValue(customer);
    razorpay.subscriptions.create.mockResolvedValue(subscription);
    razorpay.payments.fetch.mockResolvedValue(payment);

    // Seed database
    await DatabaseHelpers.seedTestData(supabase, {
      users: [user],
      profiles: [profile]
    });

    return {
      user,
      profile,
      customer,
      plan,
      subscription,
      payment
    };
  }

  /**
   * Creates a webhook processing test scenario
   */
  static createWebhookScenario(eventType: string, overrides = {}) {
    const subscription = createRazorpaySubscription();
    const payment = createPayment();

    const webhookEvent = createWebhookEvent({
      event_type: eventType,
      payload: {
        subscription: { id: subscription.id, ...subscription },
        payment: eventType.includes('payment') ? { id: payment.razorpay_payment_id, ...payment } : null
      },
      ...overrides
    });

    return {
      webhookEvent,
      subscription,
      payment,
      mockRequest: RequestHelpers.createWebhookRequest(
        eventType,
        webhookEvent.payload,
        faker.datatype.string(64)
      )
    };
  }
}

// Export commonly used utility functions
export {
  generateId,
  generateDate,
  faker
};

// Default export with all helpers
export default {
  RequestHelpers,
  DatabaseHelpers,
  AssertionHelpers,
  MockHelpers,
  PerformanceHelpers,
  SecurityHelpers,
  IntegrationHelpers,
  generateId,
  generateDate,
  faker
};