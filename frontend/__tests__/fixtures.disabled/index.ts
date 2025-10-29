/**
 * Test Fixtures Index
 *
 * Exports all fixture data for easy importing in tests
 */

import usersData from './users.json';
import subscriptionsData from './subscriptions.json';
import webhooksData from './webhooks.json';
import blueprintsData from './blueprints.json';

// Type definitions for fixtures
export type UserFixture = typeof usersData[keyof typeof usersData];
export type SubscriptionFixture = typeof subscriptionsData[keyof typeof subscriptionsData];
export type WebhookFixture = typeof webhooksData[keyof typeof webhooksData];
export type BlueprintFixture = typeof blueprintsData[keyof typeof blueprintsData];

// Export raw fixture data
export {
  usersData,
  subscriptionsData,
  webhooksData,
  blueprintsData
};

// Individual fixture exports
export const users = usersData;
export const subscriptions = subscriptionsData;
export const webhooks = webhooksData;
export const blueprints = blueprintsData;

// Common fixture combinations for test scenarios
export const fixtureSets = {
  // User with active subscription
  activeNavigatorUser: {
    user: usersData.navigatorUser,
    subscription: subscriptionsData.activeNavigatorMonthly
  },

  // User with cancelled subscription
  cancelledCrewUser: {
    user: usersData.navigatorUser, // Reuse navigator user for testing
    subscription: subscriptionsData.cancelledCrewMonthly
  },

  // User who has reached limits
  limitReachedUser: {
    user: usersData.limitReachedUser,
    subscription: null // Explorer user with no subscription
  },

  // Complete subscription flow
  subscriptionFlow: {
    user: usersData.explorerUser,
    subscription: subscriptionsData.createdFleetYearly,
    webhook: webhooksData.subscriptionCreated
  },

  // Payment failure scenario
  paymentFailureFlow: {
    user: usersData.voyagerUser,
    subscription: subscriptionsData.activeVoyagerYearly,
    webhook: webhooksData.paymentFailed
  },

  // Blueprint generation flow
  blueprintFlow: {
    user: usersData.navigatorUser,
    blueprint: blueprintsData.completedBlueprint
  },

  // Error scenario
  errorScenario: {
    user: usersData.crewUser,
    blueprint: blueprintsData.errorBlueprint
  }
};

// Helper functions to get fixtures by criteria
export const getFixtureByTier = (tier: string): UserFixture => {
  const tierMap = {
    explorer: usersData.explorerUser,
    navigator: usersData.navigatorUser,
    voyager: usersData.voyagerUser,
    crew: usersData.developerUser, // Using developer user as crew user
    armada: usersData.developerUser
  };
  return tierMap[tier as keyof typeof tierMap] || usersData.explorerUser;
};

export const getSubscriptionByStatus = (status: string): SubscriptionFixture | null => {
  const statusMap = {
    active: subscriptionsData.activeNavigatorMonthly,
    cancelled: subscriptionsData.cancelledCrewMonthly,
    created: subscriptionsData.createdFleetYearly,
    authenticated: subscriptionsData.authenticatedArmadaMonthly
  };
  return statusMap[status as keyof typeof statusMap] || null;
};

export const getWebhookByType = (eventType: string): WebhookFixture | null => {
  const eventMap = {
    'subscription.activated': webhooksData.subscriptionActivated,
    'subscription.cancelled': webhooksData.subscriptionCancelled,
    'payment.failed': webhooksData.paymentFailed,
    'subscription.created': webhooksData.subscriptionCreated,
    'subscription.authenticated': webhooksData.subscriptionAuthenticated
  };
  return eventMap[eventType as keyof typeof eventMap] || null;
};

export const getBlueprintByStatus = (status: string): BlueprintFixture | null => {
  const statusMap = {
    completed: blueprintsData.completedBlueprint,
    draft: blueprintsData.draftBlueprint,
    generating: blueprintsData.generatingBlueprint,
    error: blueprintsData.errorBlueprint
  };
  return statusMap[status as keyof typeof statusMap] || null;
};

// Export all as default
export default {
  users: usersData,
  subscriptions: subscriptionsData,
  webhooks: webhooksData,
  blueprints: blueprintsData,
  fixtureSets,
  getFixtureByTier,
  getSubscriptionByStatus,
  getWebhookByType,
  getBlueprintByStatus
};