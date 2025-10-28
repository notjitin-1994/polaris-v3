'use client';

import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Footer } from '@/components/layout/Footer';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SubscriptionSection } from '@/components/settings/SubscriptionSection';
import { UsageDetailPanel } from '@/components/settings/UsageDetailPanel';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { cn } from '@/lib/utils';

/**
 * SettingsPage - Comprehensive settings interface
 * Industry-standard settings page with section navigation in global sidebar
 */
function SettingsContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className={cn(
            'mb-4 inline-flex items-center gap-2',
            'text-text-secondary hover:text-primary',
            'transition-colors duration-200',
            'text-caption font-medium',
            'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'rounded-lg px-2 py-1'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <div className="mb-2 flex items-center gap-4">
          <div className="from-primary/20 to-secondary/20 border-primary/30 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br">
            <SettingsIcon className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-display text-foreground font-bold">Settings</h1>
            <p className="text-body text-text-secondary mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <ProfileSection />
        <SubscriptionSection />
        <UsageDetailPanel />
        <PreferencesSettings />
        <NotificationsSettings />
        <SecuritySettings />
      </motion.main>

      {/* Save Reminder (Sticky on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className={cn(
          'fixed right-6 bottom-6 left-6 lg:left-auto',
          'mx-auto max-w-sm lg:mx-0',
          'rounded-xl p-4',
          'glass-card border-primary/30 border',
          'shadow-primary/10 shadow-lg',
          'z-40',
          'hidden' // Hide by default, show when changes are detected
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-caption text-foreground font-medium">You have unsaved changes</p>
          </div>
          <button
            className={cn(
              'rounded-lg px-4 py-2',
              'bg-primary text-primary-foreground',
              'text-sm font-medium',
              'hover:bg-primary/90',
              'transition-colors duration-200',
              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * SettingsPage - Protected settings route
 */
export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
      <Footer />
    </ProtectedRoute>
  );
}
