/**
 * Razorpay Plan Configuration
 *
 * @description Central configuration for all Razorpay subscription plans
 * Maps subscription tiers to Razorpay plan IDs for both monthly and yearly billing
 *
 * @version 1.0.0
 * @date 2025-10-29
 *
 * @see docs/RAZORPAY_INTEGRATION_GUIDE.md - Section 13: Pricing Configuration
 * @see docs/RAZORPAY_SETUP_MANUAL_STEPS.md - Plan creation instructions
 */

import type { SubscriptionTier, BillingCycle, RazorpayPlanMapping } from '../../types/razorpay';

// ============================================================================
// Plan IDs Configuration
// ============================================================================

/**
 * Razorpay Plan IDs for each subscription tier
 *
 * **IMPORTANT SETUP INSTRUCTIONS**:
 * 1. Create plans in Razorpay Dashboard (https://dashboard.razorpay.com/)
 * 2. Navigate to: Products → Subscriptions → Plans → Create Plan
 * 3. Or use the automated script: `npm run create-razorpay-plans`
 * 4. Copy the generated plan IDs from Razorpay dashboard
 * 5. Replace the placeholder values below with actual plan IDs
 *
 * **Plan ID Format**:
 * - Test Mode: Starts with `plan_` (e.g., `plan_NVzJKOXN1eRx5Y`)
 * - Live Mode: Also starts with `plan_` but generated in live mode
 *
 * **NOTE**: Plan IDs are different for test mode and live mode
 * Switch all plan IDs when moving from test to production
 */
export const RAZORPAY_PLANS: RazorpayPlanMapping = {
  /**
   * Free Tier (No Razorpay plan - users don't pay)
   */
  free: {
    monthly: null,
    yearly: null,
  },

  /**
   * Explorer Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  explorer: {
    monthly: 'plan_RZGmbMjd9u0qtI', // Plan ID for monthly billing (₹159) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGmc1LbRLGH5a', // Plan ID for yearly billing (₹1,590) ✅ CURRENT ACTIVE PLAN
  },

  /**
   * Navigator Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  navigator: {
    monthly: 'plan_RZGf8oI6VAEW3h', // Plan ID for monthly billing (₹39) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGf9MME1Bs4Vd', // Plan ID for yearly billing (₹390) ✅ CURRENT ACTIVE PLAN
  },

  /**
   * Voyager Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  voyager: {
    monthly: 'plan_RZGfA1SbZQnZyM', // Plan ID for monthly billing (₹79) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGfAdVwwRTQah', // Plan ID for yearly billing (₹790) ✅ CURRENT ACTIVE PLAN
  },

  /**
   * Crew Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  crew: {
    monthly: 'plan_RZGfBEA99LRzFq', // Plan ID for monthly billing (₹24) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGfBkdSfXnmbj', // Plan ID for yearly billing (₹240) ✅ CURRENT ACTIVE PLAN
  },

  /**
   * Fleet Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  fleet: {
    monthly: 'plan_RZGfCI7A2I714z', // Plan ID for monthly billing (₹64) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGfCtTYD4rC1y', // Plan ID for yearly billing (₹640) ✅ CURRENT ACTIVE PLAN
  },

  /**
   * Armada Tier
   * CURRENT ACTIVE Razorpay plan IDs with correct pricing
   * Using the live plans with proper amounts from Razorpay dashboard
   */
  armada: {
    monthly: 'plan_RZGfDTm2erB6km', // Plan ID for monthly billing (₹129) ✅ CURRENT ACTIVE PLAN
    yearly: 'plan_RZGfE89sNsuNMo', // Plan ID for yearly billing (₹1,290) ✅ CURRENT ACTIVE PLAN
  },
} as const;

// ============================================================================
// Plan Pricing Configuration (For Display Purposes)
// ============================================================================

/**
 * Plan pricing in INR (paise)
 * 1 INR = 100 paise
 * Used for creating plans and displaying prices
 *
 * Note: To enable USD pricing, you need to activate international payments
 * in your Razorpay dashboard at https://dashboard.razorpay.com/
 */
export const PLAN_PRICING = {
  explorer: {
    monthly: 15900, // ₹159 per month (actual Razorpay plan amount)
    yearly: 159000, // ₹1,590 per year (actual Razorpay plan amount)
  },
  navigator: {
    monthly: 3900, // ₹39 per month (actual Razorpay plan amount)
    yearly: 39000, // ₹390 per year (actual Razorpay plan amount)
  },
  voyager: {
    monthly: 7900, // ₹79 per month (actual Razorpay plan amount)
    yearly: 79000, // ₹790 per year (actual Razorpay plan amount)
  },
  crew: {
    monthly: 2400, // ₹24 per seat per month (actual Razorpay plan amount)
    yearly: 24000, // ₹240 per seat per year (actual Razorpay plan amount)
  },
  fleet: {
    monthly: 6400, // ₹64 per seat per month (actual Razorpay plan amount)
    yearly: 64000, // ₹640 per seat per year (actual Razorpay plan amount)
  },
  armada: {
    monthly: 12900, // ₹129 per seat per month (actual Razorpay plan amount)
    yearly: 129000, // ₹1,290 per seat per year (actual Razorpay plan amount)
  },
} as const;

/**
 * Plan limits (blueprints per month)
 */
export const PLAN_LIMITS = {
  free: 2, // Lifetime free tier: 2 blueprints/month
  explorer: 5,
  navigator: 25,
  voyager: 50,
  crew: 10, // per seat
  fleet: 30, // per seat
  armada: 60, // per seat
} as const;

/**
 * Team-based tiers (require seat management)
 */
export const TEAM_TIERS: SubscriptionTier[] = ['crew', 'fleet', 'armada'];

/**
 * Individual tiers
 */
export const INDIVIDUAL_TIERS: SubscriptionTier[] = ['free', 'explorer', 'navigator', 'voyager'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Razorpay plan ID for a specific tier and billing cycle
 *
 * @param tier - Subscription tier (e.g., 'navigator', 'voyager')
 * @param billing - Billing cycle ('monthly' or 'yearly')
 * @returns Razorpay plan ID string or null if not configured
 *
 * @example
 * ```typescript
 * const planId = getPlanId('navigator', 'monthly');
 * // Returns: 'plan_XXXXX' or null if not set
 * ```
 */
export function getPlanId(tier: SubscriptionTier, billing: BillingCycle): string | null {
  // Free tier doesn't have a plan ID
  if (tier === 'free') {
    return null;
  }

  const plan = RAZORPAY_PLANS[tier as keyof typeof RAZORPAY_PLANS];
  if (!plan) {
    console.error(`[Razorpay Config] Invalid tier: ${tier}`);
    return null;
  }

  const planId = plan[billing];
  if (!planId) {
    console.warn(
      `[Razorpay Config] Plan ID not configured for tier "${tier}" with billing "${billing}". ` +
        'Please create the plan in Razorpay dashboard and update razorpayPlans.ts'
    );
    return null;
  }

  return planId;
}

/**
 * Get plan pricing in paise for a specific tier and billing cycle
 *
 * @param tier - Subscription tier
 * @param billing - Billing cycle ('monthly' or 'yearly')
 * @returns Price in paise or 0 for free tier
 *
 * @example
 * ```typescript
 * const price = getPlanPrice('navigator', 'monthly');
 * // Returns: 3900 (₹39 in paise)
 * ```
 */
export function getPlanPrice(tier: SubscriptionTier, billing: BillingCycle): number {
  if (tier === 'free') {
    return 0;
  }

  const pricing = PLAN_PRICING[tier as keyof typeof PLAN_PRICING];
  return pricing ? pricing[billing] : 0;
}

/**
 * Convert paise to rupees for display
 *
 * @param paise - Amount in paise
 * @returns Amount in rupees as number
 *
 * @example
 * ```typescript
 * const rupees = paiseToRupees(3900);
 * // Returns: 39
 * ```
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Convert rupees to paise for API calls
 *
 * @param rupees - Amount in rupees
 * @returns Amount in paise as number
 *
 * @example
 * ```typescript
 * const paise = rupeesToPaise(39);
 * // Returns: 3900
 * ```
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format price for display with currency symbol
 *
 * @param paise - Amount in paise
 * @param currency - Currency symbol (default: '₹')
 * @returns Formatted price string
 *
 * @example
 * ```typescript
 * const formatted = formatPrice(3900);
 * // Returns: "₹39"
 *
 * const formattedWithDecimals = formatPrice(3950);
 * // Returns: "₹39.50"
 * ```
 */
export function formatPrice(paise: number, currency: string = '₹'): string {
  const rupees = paiseToRupees(paise);
  return `${currency}${rupees.toLocaleString('en-IN')}`;
}

/**
 * Check if a tier is a team-based plan
 *
 * @param tier - Subscription tier
 * @returns true if team-based, false otherwise
 *
 * @example
 * ```typescript
 * isTeamTier('crew');     // true
 * isTeamTier('navigator'); // false
 * ```
 */
export function isTeamTier(tier: SubscriptionTier): boolean {
  return TEAM_TIERS.includes(tier);
}

/**
 * Get blueprint limit for a specific tier
 *
 * @param tier - Subscription tier
 * @returns Blueprint limit per month
 *
 * @example
 * ```typescript
 * const limit = getPlanLimit('navigator');
 * // Returns: 25
 * ```
 */
export function getPlanLimit(tier: SubscriptionTier): number {
  return PLAN_LIMITS[tier] || 0;
}

/**
 * Validate that all required plan IDs are configured
 *
 * @param billing - Billing cycle to validate ('monthly' or 'yearly')
 * @returns Object with validation result and missing plans
 *
 * @example
 * ```typescript
 * const validation = validatePlanConfiguration('monthly');
 * if (!validation.isValid) {
 *   console.error('Missing plan IDs:', validation.missing);
 * }
 * ```
 */
export function validatePlanConfiguration(billing: BillingCycle = 'monthly'): {
  isValid: boolean;
  missing: SubscriptionTier[];
} {
  const missing: SubscriptionTier[] = [];

  // Exclude 'free' tier as it doesn't need a plan ID
  const tiersToCheck: SubscriptionTier[] = [
    'explorer',
    'navigator',
    'voyager',
    'crew',
    'fleet',
    'armada',
  ];

  for (const tier of tiersToCheck) {
    const planId = getPlanId(tier, billing);
    if (!planId) {
      missing.push(tier);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

// ============================================================================
// Development Mode Warnings
// ============================================================================

/**
 * Check plan configuration and log warnings in development
 * This runs automatically when the module is imported
 */
if (process.env.NODE_ENV === 'development') {
  const monthlyValidation = validatePlanConfiguration('monthly');
  const yearlyValidation = validatePlanConfiguration('yearly');

  if (!monthlyValidation.isValid || !yearlyValidation.isValid) {
    console.warn(
      '⚠️  [Razorpay Config] Some plan IDs are not configured:\n' +
        `   Monthly: ${monthlyValidation.missing.length > 0 ? monthlyValidation.missing.join(', ') : 'All configured ✅'}\n` +
        `   Yearly: ${yearlyValidation.missing.length > 0 ? yearlyValidation.missing.join(', ') : 'All configured ✅'}\n` +
        '\n' +
        '   To fix this:\n' +
        '   1. Create plans in Razorpay Dashboard\n' +
        '   2. Or run: npm run create-razorpay-plans\n' +
        '   3. Update RAZORPAY_PLANS in lib/config/razorpayPlans.ts\n'
    );
  }
}
