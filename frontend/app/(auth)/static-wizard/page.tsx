'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StepWizard } from '@/components/wizard/static-questions/StepWizard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { useAuth } from '@/contexts/AuthContext';

function StaticWizardContent(): React.JSX.Element {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header */}
      <StandardHeader
        title="Mission Parameters"
        backHref="/"
        backLabel="Back to Dashboard"
        backButtonStyle="icon-only"
        showDarkModeToggle={false}
        showUserAvatar={false}
        size="compact"
        user={user}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="max-w-6xl text-left">
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-8"
            >
              <h1 className="font-heading lg:text-10xl text-7xl font-bold tracking-tight text-white sm:text-8xl md:text-9xl">
                <span>Starmap </span>
                <span className="bg-gradient-to-r from-[#a7dadb] to-[#7bc4c4] bg-clip-text text-transparent">
                  Navigator
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-12"
            >
              <p className="text-xl leading-relaxed text-white/70 sm:text-2xl lg:text-3xl">
                Begin your journey by defining your{' '}
                <span className="font-medium text-[#a7dadb]">learning destination</span> and{' '}
                <span className="font-medium text-[#a7dadb]">mission scope</span>. We'll use this to{' '}
                <span className="font-medium text-[#a7dadb] brightness-110 drop-shadow-[0_0_8px_rgba(167,218,219,0.8)] filter">
                  illuminate the path
                </span>{' '}
                ahead with{' '}
                <span className="font-medium text-[#a7dadb]">personalized questions</span>
              </p>
            </motion.div>

            {/* Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-16 h-px w-24"
              style={{ background: 'linear-gradient(to right, transparent, #a7dadb, transparent)' }}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <StepWizard />
        </div>
      </main>
    </div>
  );
}

export default function StaticWizardPage(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <StaticWizardContent />
    </ProtectedRoute>
  );
}
