'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CancelSubscriptionButtonProps, CancellationOptions } from '@/types/subscription';
import { formatCurrency, formatDate } from '@/types/subscription';

/**
 * CancelSubscriptionButton Component
 *
 * Provides a subscription cancellation interface with confirmation dialog
 * supporting both immediate and end-of-cycle cancellation options.
 */
export function CancelSubscriptionButton({
  subscription,
  isLoading = false,
}: CancelSubscriptionButtonProps): React.JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'immediate' | 'end-of-cycle'>('end-of-cycle');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<any>(null);

  // Don't show the button if there's no active subscription
  if (!subscription || subscription.status !== 'active') {
    return null;
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setError(null);
    setReason('');
    setSelectedOption('end-of-cycle');
    setShowSuccess(false);
    setCancellationResult(null);
  };

  const handleCloseDialog = () => {
    if (isCancelling) return;
    setIsDialogOpen(false);
    setError(null);
    setReason('');
    setShowSuccess(false);
    setCancellationResult(null);
  };

  const handleCancel = async () => {
    if (isCancelling) return;

    setIsCancelling(true);
    setError(null);

    const cancellationOptions: CancellationOptions = {
      cancelAtCycleEnd: selectedOption === 'end-of-cycle',
      reason: reason.trim() || undefined,
    };

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancellationOptions),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to cancel subscription');
      }

      setCancellationResult(result);
      setShowSuccess(true);

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setIsDialogOpen(false);
        setShowSuccess(false);
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpenDialog}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-colors",
          "border border-red-200 text-red-600 hover:bg-red-50",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Cancel Subscription
      </motion.button>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={handleCloseDialog}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Success State */}
                {showSuccess ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Subscription Cancelled
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {cancellationResult?.data?.cancelledAtCycleEnd
                        ? 'Your subscription will remain active until the end of your current billing cycle.'
                        : 'Your subscription has been cancelled immediately and you have been downgraded to the free tier.'
                      }
                    </p>
                    {cancellationResult?.data?.accessUntilDate && (
                      <p className="text-sm text-orange-600">
                        You will have access until {formatDate(cancellationResult.data.accessUntilDate)}.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cancel Subscription
                          </h3>
                          <p className="text-sm text-gray-600">
                            {subscription.plan_name} - {formatCurrency(subscription.plan_amount, subscription.plan_currency)}/{subscription.plan_period}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseDialog}
                        disabled={isCancelling}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Warning Message */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-red-900 mb-1">
                              Important: Cancellation Consequences
                            </h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• You will lose access to premium features</li>
                              <li>• Your blueprint limits will be reduced</li>
                              <li>• No refunds for partial billing periods</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Options */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Choose cancellation timing:</h4>

                        {/* End of Cycle Option */}
                        <label className={cn(
                          "block p-4 border rounded-lg cursor-pointer transition-all",
                          selectedOption === 'end-of-cycle'
                            ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20"
                            : "border-gray-200 hover:border-gray-300"
                        )}>
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              name="cancellation-option"
                              value="end-of-cycle"
                              checked={selectedOption === 'end-of-cycle'}
                              onChange={(e) => setSelectedOption(e.target.value as any)}
                              className="mt-1"
                              disabled={isCancelling}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="h-4 w-4 text-primary-600" />
                                <span className="font-medium text-gray-900">
                                  Cancel at end of billing cycle
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Continue using premium features until{' '}
                                <span className="font-medium">
                                  {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'next billing date'}
                                </span>
                                . No further charges will be made.
                              </p>
                            </div>
                          </div>
                        </label>

                        {/* Immediate Option */}
                        <label className={cn(
                          "block p-4 border rounded-lg cursor-pointer transition-all",
                          selectedOption === 'immediate'
                            ? "border-red-500 bg-red-50 ring-2 ring-red-500 ring-opacity-20"
                            : "border-gray-200 hover:border-gray-300"
                        )}>
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              name="cancellation-option"
                              value="immediate"
                              checked={selectedOption === 'immediate'}
                              onChange={(e) => setSelectedOption(e.target.value as any)}
                              className="mt-1"
                              disabled={isCancelling}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-gray-900">
                                  Cancel immediately
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Cancel immediately and downgrade to free tier right away.
                                You will lose access to premium features immediately.
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Optional Reason */}
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for cancellation (optional)
                        </label>
                        <textarea
                          id="reason"
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Help us improve by sharing why you're cancelling..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          disabled={isCancelling}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {reason.length}/500 characters
                        </p>
                      </div>

                      {/* Error Display */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <div className="flex items-start space-x-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={handleCloseDialog}
                        disabled={isCancelling}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Keep Subscription
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling || (selectedOption === 'end-of-cycle' && !subscription.next_billing_date)}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2",
                          selectedOption === 'immediate'
                            ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            : "bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                        )}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <span>
                            {selectedOption === 'immediate' ? 'Cancel Immediately' : 'Schedule Cancellation'}
                          </span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default CancelSubscriptionButton;