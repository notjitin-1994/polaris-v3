'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StepWizard } from '@/components/wizard/static-questions/StepWizard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { SwirlBackground } from '@/components/layout/SwirlBackground';
import { useAuth } from '@/contexts/AuthContext';

function StaticWizardContent(): JSX.Element {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header with Swirls */}
      <header className="relative sticky top-0 z-10 overflow-hidden border-b border-white/10 bg-[#020C1B]/80 backdrop-blur-xl">
        {/* Header background with swirls */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <SwirlBackground
            count={12}
            minSize={32}
            maxSize={64}
            opacityMin={0.03}
            opacityMax={0.08}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 30%, rgba(167,218,219,0.03) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            {/* Left side: Back button + Title */}
            <div className="min-w-0 flex-1">
              <Link
                href="/"
                className="pressable mb-4 inline-flex items-center gap-2 text-[rgb(176,197,198)] transition-colors hover:text-[#a7dadb]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>

              <h1 className="font-heading mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Learning Blueprint Creator
              </h1>
              <p className="max-w-3xl text-base text-[rgb(176,197,198)]">
                Let's start by understanding your learning objectives and requirements. This will
                help us generate personalized questions for your blueprint.
              </p>
            </div>

            {/* Right side: Controls */}
            <div className="flex shrink-0 items-center gap-3">
              <DarkModeToggle />
              <UserAvatar user={user} sizeClass="w-8 h-8" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <StepWizard />
        </div>
      </main>
    </div>
  );
}

export default function StaticWizardPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <StaticWizardContent />
    </ProtectedRoute>
  );
}
