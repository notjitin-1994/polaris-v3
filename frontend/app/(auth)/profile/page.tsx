'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Footer } from '@/components/layout/Footer';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AccountInfoSection } from '@/components/profile/AccountInfoSection';
import { ActivitySection } from '@/components/profile/ActivitySection';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

/**
 * ProfilePage - User profile interface with account information and activity
 * Dedicated profile page with comprehensive user information display
 */
function ProfileContent() {
  const { user } = useAuth();
  const { profile, loading: _loading } = useUserProfile();

  // Format join date
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

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

        {/* Page Title & User Info */}
        <div className="mb-2 flex items-start gap-6">
          {/* User Avatar */}
          <div className="relative">
            <GlassCard className="h-20 w-20 p-1">
              <div className="border-primary/30 bg-primary/10 flex h-full w-full items-center justify-center rounded-full border">
                <span className="text-primary text-2xl font-bold">{getUserInitials()}</span>
              </div>
            </GlassCard>
            <div className="bg-success border-background absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-display text-foreground font-bold">
              {profile?.first_name && profile?.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Profile'}
            </h1>
            <p className="text-body text-text-secondary mt-1">{user?.email}</p>

            {/* Quick Stats */}
            <div className="mt-3 flex items-center gap-4">
              <div className="text-text-secondary flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-caption">Joined {joinDate}</span>
              </div>
              {profile?.subscription_tier && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'text-caption rounded-full px-2 py-1 font-medium',
                      profile.subscription_tier === 'explorer' &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                      profile.subscription_tier === 'navigator' &&
                        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                      profile.subscription_tier === 'voyager' &&
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                      profile.subscription_tier === 'developer' &&
                        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                    )}
                  >
                    {profile.subscription_tier.charAt(0).toUpperCase() +
                      profile.subscription_tier.slice(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <ProfileSection />
        <AccountInfoSection />
        <ActivitySection />
      </motion.main>
    </div>
  );
}

/**
 * ProfilePage - Protected profile route
 */
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
      <Footer />
    </ProtectedRoute>
  );
}
