'use client';

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import StepWizard from '@/components/wizard/static-questions/StepWizard';

function StaticWizardContent() {
  return (
    <main className="min-h-screen bg-blue-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Learning Blueprint Creator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Let&apos;s start by understanding your learning objectives and requirements. This will
              help us generate personalized questions for your blueprint.
            </p>
          </div>
        </div>

        {/* Wizard Container */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <StepWizard />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your progress is automatically saved as you complete each step
          </p>
        </div>
      </div>
    </main>
  );
}

export default function StaticWizardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <StaticWizardContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
