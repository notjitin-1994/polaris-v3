'use client';

import React from 'react';
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
        title="Learning Blueprint Creator"
        subtitle="Let's start by understanding your learning objectives and requirements. This will help us generate personalized questions for your blueprint."
        backHref="/"
        backLabel="Back to Dashboard"
        user={user}
      />

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
