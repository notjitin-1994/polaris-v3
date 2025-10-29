/**
 * Razorpay Configuration
 *
 * @description Centralized configuration for Razorpay payment gateway integration
 * @version 1.0.0
 * @date 2025-10-29
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface RazorpayConfig {
  /** Razorpay API Key ID */
  keyId: string;
  /** Business/Brand name displayed in checkout */
  name?: string;
  /** Payment description */
  description?: string;
  /** Logo image URL */
  image?: string;
  /** Default notes for transactions */
  defaultNotes?: Record<string, string>;
  /** Theme configuration */
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  /** Callback URL for payment response */
  callbackUrl?: string;
}

// ============================================================================
// Configuration Implementation
// ============================================================================

/**
 * Get Razorpay configuration from environment variables
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) {
    console.warn('[RazorpayConfig] NEXT_PUBLIC_RAZORPAY_KEY_ID not configured');
  }

  return {
    keyId: keyId || '',
    name: process.env.NEXT_PUBLIC_RAZORPAY_NAME || 'SmartSlate',
    description:
      process.env.NEXT_PUBLIC_RAZORPAY_DESCRIPTION || 'AI-powered learning platform subscription',
    image: process.env.NEXT_PUBLIC_RAZORPAY_LOGO_URL,
    defaultNotes: {
      platform: 'SmartSlate Polaris v3',
      timestamp: new Date().toISOString(),
    },
    theme: {
      color: process.env.NEXT_PUBLIC_RAZORPAY_THEME_COLOR || '#6366f1',
      hide_topbar: process.env.NEXT_PUBLIC_RAZORPAY_HIDE_TOPBAR === 'true',
    },
    callbackUrl: process.env.NEXT_PUBLIC_RAZORPAY_CALLBACK_URL,
  };
}

/**
 * Check if Razorpay is configured properly
 */
export function isRazorpayConfigured(): boolean {
  const config = getRazorpayConfig();
  return !!config.keyId && config.keyId.startsWith('rzp_');
}

/**
 * Get environment mode (test or live)
 */
export function getRazorpayMode(): 'test' | 'live' {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) return 'test';

  return keyId.startsWith('rzp_live_') ? 'live' : 'test';
}

/**
 * Check if test mode is enabled
 */
export function isTestMode(): boolean {
  return getRazorpayMode() === 'test';
}

// ============================================================================
// Export
// ============================================================================

export default {
  getRazorpayConfig,
  isRazorpayConfigured,
  getRazorpayMode,
  isTestMode,
};
