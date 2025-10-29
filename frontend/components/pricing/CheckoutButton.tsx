/**
 * Checkout Button Component
 *
 * @description Reusable checkout button component with loading states and error handling for Razorpay integration
 * @version 1.0.0
 * @date 2025-10-29
 *
 * This component provides:
 * - Loading states and button disable during processing
 * - Integration with create-subscription API
 * - Razorpay modal opening and payment handling
 * - Success/failure callback handling
 * - Comprehensive error handling with user-friendly messages
 * - Integration with pricing page components
 *
 * @example
 * <CheckoutButton
 *   planId="navigator"
 *   tier="Navigator"
 *   disabled={false}
 *   billingCycle="monthly"
 * />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRazorpayCheckout } from '@/lib/hooks/useRazorpayCheckout';
import { classifyRazorpayError, getUserFriendlyMessage } from '@/lib/razorpay/errorHandling';
import { useToast } from '@/components/ui/Toast';
import { getPlanPrice } from '@/lib/config/razorpayPlans';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Checkout button props
 */
interface CheckoutButtonProps {
  /** Plan ID for the subscription (e.g., 'navigator', 'voyager') */
  planId: string;
  /** Plan tier name for display (e.g., 'Navigator', 'Voyager') */
  tier: string;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Billing cycle ('monthly' or 'yearly') */
  billingCycle?: 'monthly' | 'yearly';
  /** Custom button text */
  buttonText?: string;
  /** Custom CSS className */
  className?: string;
  /** Custom styling variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner */
  showSpinner?: boolean;
  /** Callback when checkout starts */
  onCheckoutStart?: () => void;
  /** Callback when checkout succeeds */
  onCheckoutSuccess?: (response: any) => void;
  /** Callback when checkout fails */
  onCheckoutError?: (error: Error) => void;
}

/**
 * Component state interface
 */
interface CheckoutButtonState {
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
}

// ============================================================================
// Checkout Button Component
// ============================================================================

/**
 * CheckoutButton component
 *
 * Provides a reusable button for initiating Razorpay checkout process
 * with loading states, error handling, and success/failure callbacks.
 *
 * @param props - CheckoutButton props
 * @returns JSX element
 */
export function CheckoutButton({
  planId,
  tier,
  disabled = false,
  billingCycle = 'monthly',
  buttonText,
  className = '',
  variant = 'primary',
  size = 'md',
  showSpinner = true,
  onCheckoutStart,
  onCheckoutSuccess,
  onCheckoutError,
}: CheckoutButtonProps): React.JSX.Element {
  // State management
  const [state, setState] = React.useState<CheckoutButtonState>({
    isLoading: false,
    error: null,
    isProcessing: false,
  });

  // Razorpay checkout hooks
  const { openCheckout, isLoading: isRazorpayLoading } = useRazorpayCheckout();

  // Toast notifications
  const { showError, showSuccess } = useToast();

  // Check if payments are enabled
  const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

  // Router for navigation
  const router = useRouter();

  /**
   * Generate default button text based on state
   */
  const getButtonText = (): string => {
    if (buttonText) return buttonText;

    if (state.isProcessing) return 'Processing...';
    if (state.isLoading) return 'Loading...';

    return billingCycle === 'yearly' ? 'Upgrade Yearly' : 'Upgrade Monthly';
  };

  /**
   * Handle checkout button click
   */
  const handleCheckout = async (): Promise<void> => {
    // Prevent multiple simultaneous checkouts
    if (state.isLoading || state.isProcessing || disabled) {
      return;
    }

    // Check if payments are enabled
    if (!paymentsEnabled) {
      showError('Payments are currently disabled', 'Contact support for assistance');
      return;
    }

    // Check if user is authenticated (prevent loading state stuck issue)
    // This is a quick client-side check to avoid API call when not authenticated
    if (typeof window !== 'undefined') {
      // Quick check for auth cookies or session
      const hasAuthCookie = document.cookie.includes('sb-');
      if (!hasAuthCookie) {
        showError('Please sign in to upgrade your subscription', 'Authentication required');
        return;
      }
    }

    // Clear previous errors
    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    try {
      // Notify parent component that checkout is starting
      onCheckoutStart?.();

      // Call create-subscription API to get subscription details
      const response = await fetch('/api/subscriptions/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: planId,
          billingCycle: billingCycle,
          metadata: {
            source: 'pricing_page',
            planName: tier,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const subscriptionData = await response.json();

      if (!subscriptionData.success) {
        throw new Error(subscriptionData.error?.message || 'Failed to create subscription');
      }

      setState((prev) => ({ ...prev, isLoading: false, isProcessing: true }));

      // Open Razorpay checkout modal
      await openCheckout({
        subscriptionId: subscriptionData.data.razorpaySubscriptionId,
        plan: {
          name: tier,
          description: `SmartSlate Polaris ${tier} subscription - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing`,
          price: subscriptionData.data.planAmount
            ? subscriptionData.data.planAmount / 100
            : getPlanPrice(planId as any, billingCycle) / 100, // Convert paise to INR
          currency: subscriptionData.data.planCurrency || 'INR',
          billingCycle: billingCycle === 'yearly' ? 'annual' : 'monthly',
          tier: tier,
        },
        customer: {
          name: subscriptionData.data.customerName || undefined,
          email: subscriptionData.data.customerEmail || undefined,
        },
        onSuccess: (response) => {
          console.log('[CheckoutButton] Payment successful:', response);
          // Handle successful payment
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: null,
          }));

          showSuccess(
            'Payment successful!',
            'Your subscription has been activated. Redirecting to dashboard...'
          );

          // Notify parent component of success
          onCheckoutSuccess?.(response);

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        },
        onFailure: (error) => {
          console.log('[CheckoutButton] Payment failed:', error);
          // Handle payment failure
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: error.message || 'Payment failed',
          }));

          showError('Payment failed', error.message || 'Please try again or contact support');

          // Notify parent component of error
          onCheckoutError?.(
            error instanceof Error ? error : new Error(error.message || 'Payment failed')
          );
        },
      });
    } catch (error) {
      // Handle checkout error
      console.error('[CheckoutButton] Checkout failed:', error);

      // Always ensure loading states are cleared
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isProcessing: false,
      }));

      // Handle different error types
      if (error instanceof Error) {
        const classifiedError = classifyRazorpayError(error);
        const userMessage = getUserFriendlyMessage(classifiedError);

        setState((prev) => ({
          ...prev,
          error: userMessage,
        }));

        // Show error toast notification
        showError(userMessage, 'Please try again or contact support if the issue persists');

        // Notify parent component of error
        onCheckoutError?.(classifiedError);
      } else {
        // Handle non-Error objects
        const fallbackMessage = 'Payment failed. Please try again.';
        setState((prev) => ({
          ...prev,
          error: fallbackMessage,
        }));
        showError(fallbackMessage, 'Please try again or contact support.');
        onCheckoutError?.(new Error(fallbackMessage));
      }
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setState((prev) => ({ ...prev, error: null }));
  };

  /**
   * Get button CSS classes based on variant and state
   */
  const getButtonClasses = (): string => {
    const baseClasses =
      'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[40px]',
      md: 'px-6 py-3 text-sm min-h-[48px]',
      lg: 'px-8 py-4 text-base min-h-[56px]',
    };

    const variantClasses = {
      primary:
        'from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 focus-visible:ring-primary/50 bg-gradient-to-r shadow-xl hover:shadow-2xl',
      secondary:
        'from-surface to-surface/90 text-foreground hover:from-surface/90 hover:to-surface/80 border border-neutral-200/40 bg-gradient-to-r shadow-md hover:border-neutral-300/60 hover:shadow-lg focus-visible:ring-neutral-400/50',
      outline:
        'border border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent hover:shadow-lg focus-visible:ring-primary/50',
    };

    const stateClasses =
      state.isLoading || state.isProcessing
        ? 'cursor-wait opacity-90'
        : 'hover:scale-[1.02] active:scale-[0.98]';

    return [baseClasses, sizeClasses[size], variantClasses[variant], stateClasses, className]
      .filter(Boolean)
      .join(' ');
  };

  /**
   * Generate button content with spinner
   */
  const renderButtonContent = (): React.ReactNode => {
    const showLoader = showSpinner && (state.isLoading || state.isProcessing || isRazorpayLoading);

    return (
      <>
        {showLoader && <Loader2 className="h-4 w-4 animate-spin" />}

        {!showLoader && !state.isLoading && !state.isProcessing && (
          <ArrowUpRight className="h-4 w-4" />
        )}

        <span>{getButtonText()}</span>
      </>
    );
  };

  return (
    <>
      <div className="relative">
        {/* Error Display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          >
            <div className="flex items-center justify-between">
              <span>{state.error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Clear error"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Checkout Button */}
        <motion.button
          onClick={handleCheckout}
          disabled={
            disabled ||
            state.isLoading ||
            state.isProcessing ||
            isRazorpayLoading ||
            !paymentsEnabled
          }
          className={getButtonClasses()}
          whileHover={{
            scale: state.isLoading || state.isProcessing || disabled || !paymentsEnabled ? 1 : 1.02,
            transition: { duration: 0.2 },
          }}
          whileTap={{
            scale: state.isLoading || state.isProcessing || disabled || !paymentsEnabled ? 1 : 0.98,
            transition: { duration: 0.1 },
          }}
          aria-label={`Upgrade to ${tier} plan (${billingCycle})`}
        >
          {renderButtonContent()}
        </motion.button>
      </div>
    </>
  );
}

// ============================================================================
// Export
// ============================================================================

export default CheckoutButton;
export type { CheckoutButtonProps };
export type { CheckoutButtonState };
