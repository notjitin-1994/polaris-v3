/**
 * Test Helpers and Fixtures Validation
 */

import { describe, it, expect } from 'vitest';
import {
  RequestHelpers,
  DatabaseHelpers,
  AssertionHelpers,
  MockHelpers,
  PerformanceHelpers,
  SecurityHelpers,
  IntegrationHelpers
} from './index';
import {
  users,
  subscriptions,
  webhooks,
  blueprints,
  fixtureSets,
  getFixtureByTier,
  getSubscriptionByStatus,
  getWebhookByType,
  getBlueprintByStatus
} from '../fixtures';

describe('Test Helpers', () => {
  describe('RequestHelpers', () => {
    it('should create a mock NextRequest', () => {
      const request = RequestHelpers.createMockNextRequest('/api/test', {
        method: 'POST',
        body: { test: 'data' }
      });

      expect(request).toBeInstanceOf(Request);
      expect(request.method).toBe('POST');
      expect(request.url).toContain('/api/test');
    });

    it('should create an authenticated request', () => {
      const request = RequestHelpers.createAuthenticatedRequest('/api/test');

      expect(request.headers.get('authorization')).toBeTruthy();
      expect(request.headers.get('cookie')).toBeTruthy();
    });

    it('should create a subscription request', () => {
      const request = RequestHelpers.createSubscriptionRequest('navigator', 'monthly');

      expect(request.method).toBe('POST');
      expect(request.url).toContain('/api/subscriptions/create');
    });

    it('should create a webhook request', () => {
      const request = RequestHelpers.createWebhookRequest(
        'subscription.activated',
        { subscription: { id: 'test' } }
      );

      expect(request.method).toBe('POST');
      expect(request.headers.get('x-razorpay-signature')).toBeTruthy();
      expect(request.headers.get('x-razorpay-event-id')).toBeTruthy();
    });
  });

  describe('PerformanceHelpers', () => {
    it('should measure execution time', async () => {
      const { result, executionTime } = await PerformanceHelpers.measureExecutionTime(() => {
        return Promise.resolve('test result');
      });

      expect(result).toBe('test result');
      expect(executionTime).toBeGreaterThan(0);
      expect(typeof executionTime).toBe('number');
    });

    it('should assert execution time within limit', async () => {
      const result = await PerformanceHelpers.assertExecutionTime(
        () => Promise.resolve('test'),
        1000
      );

      expect(result).toBe('test');
    });

    it('should calculate average execution time', async () => {
      const avgTime = await PerformanceHelpers.getAverageExecutionTime(
        () => Promise.resolve('test'),
        3
      );

      expect(avgTime).toBeGreaterThan(0);
      expect(typeof avgTime).toBe('number');
    });
  });

  describe('SecurityHelpers', () => {
    it('should create malicious payloads', () => {
      const payloads = SecurityHelpers.createMaliciousPayloads();

      expect(payloads.sqlInjection).toBeDefined();
      expect(payloads.xssPayload).toBeDefined();
      expect(payloads.pathTraversal).toBeDefined();
      expect(payloads.largePayload).toBeDefined();
    });

    it('should create security test requests', () => {
      const requests = SecurityHelpers.createSecurityTestRequests('/api/test');

      expect(requests.sqlInjection).toBeDefined();
      expect(requests.xss).toBeDefined();
      expect(requests.pathTraversal).toBeDefined();
      expect(requests.largePayload).toBeDefined();
    });
  });

  describe('IntegrationHelpers', () => {
    it('should create webhook scenario', () => {
      const scenario = IntegrationHelpers.createWebhookScenario('subscription.activated');

      expect(scenario.webhookEvent).toBeDefined();
      expect(scenario.subscription).toBeDefined();
      expect(scenario.mockRequest).toBeDefined();
      expect(scenario.webhookEvent.event_type).toBe('subscription.activated');
    });
  });
});

describe('Test Fixtures', () => {
  it('should export user fixtures', () => {
    expect(users.explorerUser).toBeDefined();
    expect(users.navigatorUser).toBeDefined();
    expect(users.voyagerUser).toBeDefined();
    expect(users.developerUser).toBeDefined();
    expect(users.limitReachedUser).toBeDefined();
    expect(users.inactiveUser).toBeDefined();
  });

  it('should export subscription fixtures', () => {
    expect(subscriptions.activeNavigatorMonthly).toBeDefined();
    expect(subscriptions.activeVoyagerYearly).toBeDefined();
    expect(subscriptions.cancelledCrewMonthly).toBeDefined();
    expect(subscriptions.createdFleetYearly).toBeDefined();
    expect(subscriptions.authenticatedArmadaMonthly).toBeDefined();
  });

  it('should export webhook fixtures', () => {
    expect(webhooks.subscriptionActivated).toBeDefined();
    expect(webhooks.subscriptionCancelled).toBeDefined();
    expect(webhooks.paymentFailed).toBeDefined();
    expect(webhooks.subscriptionCreated).toBeDefined();
    expect(webhooks.subscriptionAuthenticated).toBeDefined();
  });

  it('should export blueprint fixtures', () => {
    expect(blueprints.completedBlueprint).toBeDefined();
    expect(blueprints.draftBlueprint).toBeDefined();
    expect(blueprints.generatingBlueprint).toBeDefined();
    expect(blueprints.errorBlueprint).toBeDefined();
  });

  it('should export fixture sets', () => {
    expect(fixtureSets.activeNavigatorUser).toBeDefined();
    expect(fixtureSets.cancelledCrewUser).toBeDefined();
    expect(fixtureSets.limitReachedUser).toBeDefined();
    expect(fixtureSets.subscriptionFlow).toBeDefined();
    expect(fixtureSets.paymentFailureFlow).toBeDefined();
    expect(fixtureSets.blueprintFlow).toBeDefined();
    expect(fixtureSets.errorScenario).toBeDefined();
  });

  it('should get fixture by tier', () => {
    const explorerUser = getFixtureByTier('explorer');
    const navigatorUser = getFixtureByTier('navigator');
    const voyagerUser = getFixtureByTier('voyager');

    expect(explorerUser.subscription_tier).toBe('explorer');
    expect(navigatorUser.subscription_tier).toBe('navigator');
    expect(voyagerUser.subscription_tier).toBe('voyager');
  });

  it('should get subscription by status', () => {
    const activeSub = getSubscriptionByStatus('active');
    const cancelledSub = getSubscriptionByStatus('cancelled');
    const createdSub = getSubscriptionByStatus('created');

    expect(activeSub?.status).toBe('active');
    expect(cancelledSub?.status).toBe('cancelled');
    expect(createdSub?.status).toBe('created');
  });

  it('should get webhook by type', () => {
    const activatedWebhook = getWebhookByType('subscription.activated');
    const cancelledWebhook = getWebhookByType('subscription.cancelled');
    const paymentFailedWebhook = getWebhookByType('payment.failed');

    expect(activatedWebhook?.event_type).toBe('subscription.activated');
    expect(cancelledWebhook?.event_type).toBe('subscription.cancelled');
    expect(paymentFailedWebhook?.event_type).toBe('payment.failed');
  });

  it('should get blueprint by status', () => {
    const completedBlueprint = getBlueprintByStatus('completed');
    const draftBlueprint = getBlueprintByStatus('draft');
    const generatingBlueprint = getBlueprintByStatus('generating');

    expect(completedBlueprint?.status).toBe('completed');
    expect(draftBlueprint?.status).toBe('draft');
    expect(generatingBlueprint?.status).toBe('generating');
  });

  it('should have consistent data structure across fixtures', () => {
    // Check user fixtures have required fields
    Object.values(users).forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('subscription_tier');
      expect(user).toHaveProperty('user_role');
      expect(user).toHaveProperty('blueprint_creation_limit');
      expect(user).toHaveProperty('blueprint_saving_limit');
    });

    // Check subscription fixtures have required fields
    Object.values(subscriptions).forEach(subscription => {
      expect(subscription).toHaveProperty('subscription_id');
      expect(subscription).toHaveProperty('user_id');
      expect(subscription).toHaveProperty('status');
      expect(subscription).toHaveProperty('subscription_tier');
      expect(subscription).toHaveProperty('plan_amount');
      expect(subscription).toHaveProperty('created_at');
    });

    // Check webhook fixtures have required fields
    Object.values(webhooks).forEach(webhook => {
      expect(webhook).toHaveProperty('webhook_event_id');
      expect(webhook).toHaveProperty('event_type');
      expect(webhook).toHaveProperty('payload');
      expect(webhook).toHaveProperty('created_at');
    });

    // Check blueprint fixtures have required fields
    Object.values(blueprints).forEach(blueprint => {
      expect(blueprint).toHaveProperty('blueprint_id');
      expect(blueprint).toHaveProperty('user_id');
      expect(blueprint).toHaveProperty('status');
      expect(blueprint).toHaveProperty('static_answers');
      expect(blueprint).toHaveProperty('created_at');
    });
  });
});