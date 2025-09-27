'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { DynamicFormRenderer } from '@/components/dynamic-form';
import { blueprintService } from '@/lib/db/blueprints';
import { BlueprintRow } from '@/lib/db/blueprints';

interface DynamicWizardPageProps {
  params: Promise<{ id: string }>;
}

export default function DynamicWizardPage({ params }: DynamicWizardPageProps): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const [blueprint, setBlueprint] = useState<BlueprintRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlueprint = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blueprintService.getBlueprint(id);
      if (!data) {
        setError('Blueprint not found');
        return;
      }
      
      // Debug logging
      console.log('Loaded blueprint:', data);
      console.log('Dynamic questions:', data.dynamic_questions);
      console.log('Dynamic questions type:', typeof data.dynamic_questions);
      console.log('Dynamic questions length:', Array.isArray(data.dynamic_questions) ? data.dynamic_questions.length : 'not an array');
      
      setBlueprint(data);
    } catch (error) {
      console.error('Error loading blueprint:', error);
      setError('Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBlueprint();
  }, [id, loadBlueprint]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dynamic questionnaire...</p>
        </div>
      </main>
    );
  }

  if (error || !blueprint) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Blueprint Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The blueprint you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to access it.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // Check if dynamic questions are available
  const hasDynamicQuestions = blueprint.dynamic_questions && blueprint.dynamic_questions.length > 0;

  if (!hasDynamicQuestions) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Dynamic Questionnaire
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Blueprint #{blueprint.id.slice(0, 8)} •{' '}
              {blueprint.static_answers?.learningObjective || 'No learning objective set'}
            </p>
          </div>

          {/* No questions message */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Dynamic Questions Not Available
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                The dynamic questions for this blueprint haven&apos;t been generated yet. This
                feature is currently under development.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      In a complete implementation, this page would:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Generate personalized questions based on your static responses</li>
                      <li>• Present them in an interactive, multi-step form</li>
                      <li>• Allow you to provide detailed answers with rich input types</li>
                      <li>• Save your responses and generate a comprehensive blueprint</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </Link>
                <Link
                  href="/static-wizard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Create Another Blueprint
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <main className="min-h-screen bg-blue-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Draft Blueprint
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <svg
                      className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Dynamic Questionnaire
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-5xl mx-auto">
                  Blueprint #{blueprint.id.slice(0, 8)} •{' '}
                  {blueprint.static_answers?.learningObjective || 'No learning objective set'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Answer these personalized questions to complete your learning blueprint
                </div>
              </div>
            </div>

            {/* Dynamic Form Container */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Debug logging for form schema */}
                  {console.log('Form schema sections:', blueprint.dynamic_questions || [])}
                  <DynamicFormRenderer
                    formSchema={{
                      id: `dynamic-${blueprint.id}`,
                      title: 'Dynamic Questions',
                      description: 'Generated questions based on your responses',
                      sections: blueprint.dynamic_questions || [],
                      settings: {
                        allowSaveProgress: true,
                        autoSaveInterval: 2000,
                        showProgress: true,
                        allowSectionJump: true,
                        submitButtonText: 'Complete Blueprint',
                        saveButtonText: 'Save Progress',
                        theme: 'auto',
                      },
                    }}
                    onSubmit={async (answers) => {
                      try {
                        // Save dynamic answers to the blueprint
                        await blueprintService.updateDynamicAnswers(id, answers);
                        
                        // Generate the final blueprint
                        const response = await fetch('/api/generate-blueprint', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ blueprintId: id }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to generate blueprint');
                        }

                        // Redirect to dashboard with success message
                        router.push('/?blueprint=completed');
                      } catch (error) {
                        console.error('Error saving dynamic answers:', error);
                        // Still redirect but show error state
                        router.push('/?blueprint=error');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="max-w-6xl mx-auto mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your responses are automatically saved as you progress
              </p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    </AuthProvider>
  );
}
