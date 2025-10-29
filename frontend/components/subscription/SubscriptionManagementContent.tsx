'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import SubscriptionInfo from '@/components/subscription/SubscriptionInfo';
import PaymentHistory from '@/components/subscription/PaymentHistory';
import CancelSubscriptionButton from '@/components/subscription/CancelSubscriptionButton';
import { cn } from '@/lib/utils';
import type { SubscriptionManagementPageProps } from '@/types/subscription';

/**
 * SubscriptionManagementContent
 *
 * Client component for the subscription management interface that handles
 * user interactions and state management.
 */
function SubscriptionManagementContent({
  userProfile,
  subscription,
  isLoading,
  error,
}: SubscriptionManagementPageProps): React.JSX.Element {
  // Mock payment data for now - this will be replaced with real data fetching
  const [mockPayments] = React.useState([
    {
      payment_id: 'pay_mock_1',
      subscription_id: 'sub_mock_1',
      razorpay_payment_id: 'pay_example1234',
      razorpay_order_id: 'order_example1234',
      amount: 3900, // ₹39 in paise
      currency: 'INR',
      status: 'captured' as const,
      payment_method: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
      },
      description: 'Navigator Plan - Monthly',
      invoice_id: 'inv_example1234',
      invoice_url: '#',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [paymentHistoryLoading, setPaymentHistoryLoading] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage your subscription, payment history, and billing preferences
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/pricing"
                className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>View Plans</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center space-x-3 text-red-600">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">Error Loading Subscription Data</h3>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </GlassCard>
              </div>
              <div>
                <GlassCard className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Subscription Info & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Information */}
              <SubscriptionInfo
                subscription={subscription}
                userProfile={userProfile}
              />

              {/* Payment History */}
              <PaymentHistory
                payments={mockPayments}
                isLoading={paymentHistoryLoading}
              />
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                  {/* Cancel Subscription Button */}
                  <CancelSubscriptionButton
                    subscription={subscription as any} // Type assertion for now
                  />

                  {/* Other Actions */}
                  <Link
                    href="/pricing"
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Change Plan</span>
                  </Link>

                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Update Payment Method</span>
                  </button>
                </div>
              </GlassCard>

              {/* Support Card */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Have questions about your subscription or billing? Our support team is here to help.
                </p>

                <div className="space-y-2">
                  <a
                    href="mailto:support@polaris.app"
                    className="block px-4 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Email Support
                  </a>
                  <a
                    href="/docs/billing"
                    className="block px-4 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Billing Documentation
                  </a>
                  <a
                    href="/faq"
                    className="block px-4 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    FAQ
                  </a>
                </div>
              </GlassCard>

              {/* Billing Summary */}
              {subscription && (
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Billing Summary</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Plan</span>
                      <span className="font-medium text-gray-900">
                        {subscription.planName}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Cost</span>
                      <span className="font-medium text-gray-900">
                        ₹{(subscription.planAmount / 100).toFixed(0)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Payment</span>
                      <span className="font-medium text-gray-900">
                        {subscription.nextBillingDate
                          ? new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'
                        }
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Link
                        href="/billing"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Detailed Billing →
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {/* Mobile Quick Actions */}
        <div className="lg:hidden mt-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/pricing"
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center text-sm"
              >
                Change Plan
              </Link>

              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Update Payment
              </button>

              <CancelSubscriptionButton
                subscription={subscription as any}
              />

              <Link
                href="/support"
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
              >
                Get Support
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SubscriptionManagementContent;