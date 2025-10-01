'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DynamicFormRenderer } from '@/components/dynamic-form';
import { DynamicQuestionsLoader } from '@/components/wizard/dynamic-questions';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import { BlueprintRow } from '@/lib/db/blueprints';
import { StandardHeader } from '@/components/layout/StandardHeader';

interface DynamicWizardPageProps {
  params: Promise<{ id: string }>;
}

function DynamicWizardContent({ id }: { id: string }): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [blueprint, setBlueprint] = useState<BlueprintRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlueprint = useCallback(async () => {
    try {
      setLoading(true);
      const svc = createBrowserBlueprintService();
      const data = await svc.getBlueprint(id);
      if (!data) {
        setError('Blueprint not found');
        return;
      }

      // Debug logging
      console.log('Loaded blueprint:', data);
      console.log('Dynamic questions:', data.dynamic_questions);
      console.log('Dynamic questions type:', typeof data.dynamic_questions);
      console.log(
        'Dynamic questions length:',
        Array.isArray(data.dynamic_questions) ? data.dynamic_questions.length : 'not an array'
      );

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
      <div className="flex min-h-screen items-center justify-center bg-[#020C1B] p-4">
        <div className="w-full max-w-2xl">
          <DynamicQuestionsLoader message="Loading dynamic questionnaire..." statusText="Loading" />
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020C1B] p-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Blueprint Not Found</h1>
          <p className="mb-6 text-[rgb(176,197,198)]">
            The blueprint you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to access it.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#a7dadb] px-4 py-2 font-medium text-[#020C1B] transition-colors hover:bg-[#8bc5c6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if dynamic questions are available
  const hasDynamicQuestions =
    Array.isArray(blueprint.dynamic_questions) && blueprint.dynamic_questions.length > 0;

  if (!hasDynamicQuestions) {
    return (
      <div className="min-h-screen bg-[#020C1B]">
        {/* Header */}
        <StandardHeader
          title="Dynamic Questions"
          subtitle="Dynamic questions are being generated for your blueprint."
          backHref="/"
          backLabel="Back to Dashboard"
          user={user}
        />

        <main className="w-full px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            {/* No questions message */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto max-w-md">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                  <svg
                    className="h-8 w-8 text-amber-400"
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

                <h2 className="mb-4 text-2xl font-bold text-white">
                  Dynamic Questions Not Available
                </h2>
                <p className="mb-8 text-[rgb(176,197,198)]">
                  The dynamic questions for this blueprint haven&apos;t been generated yet. This
                  feature is currently under development.
                </p>

                <div className="mb-8 rounded-lg border border-[#a7dadb]/20 bg-[#a7dadb]/10 p-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#a7dadb]"
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
                      <p className="mb-2 text-sm font-medium text-[#a7dadb]">
                        In a complete implementation, this page would:
                      </p>
                      <ul className="space-y-1 text-sm text-[rgb(176,197,198)]">
                        <li>• Generate personalized questions based on your static responses</li>
                        <li>• Present them in an interactive, multi-step form</li>
                        <li>• Allow you to provide detailed answers with rich input types</li>
                        <li>• Save your responses and generate a comprehensive blueprint</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a7dadb] px-6 py-2.5 text-sm font-medium text-[#020C1B] shadow-sm transition-all duration-200 hover:bg-[#8bc5c6] hover:shadow-md"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Return to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const supabase = getSupabaseBrowserClient();
                        const { data: userResp } = await supabase.auth.getUser();
                        const userId = userResp?.user?.id;
                        if (!userId) {
                          router.push('/static-wizard');
                          return;
                        }
                        const { count } = await supabase
                          .from('blueprint_generator')
                          .select('*', { count: 'exact', head: true })
                          .eq('user_id', userId);
                        const nextIndex = (count ?? 0) + 1;
                        const { data, error } = await supabase
                          .from('blueprint_generator')
                          .insert({
                            user_id: userId,
                            status: 'draft',
                            title: `New Blueprint (${nextIndex})`,
                            static_answers: {}, // Empty - form will use defaults
                            questionnaire_version: 2, // V2 schema
                            completed_steps: [], // No steps completed
                          })
                          .select()
                          .single();
                        if (error) throw error;
                        const draftId = data.id as string;
                        console.log('[DynamicWizard] Created new blueprint:', draftId);
                        router.push(`/static-wizard?bid=${draftId}`);
                      } catch (error) {
                        console.error('[DynamicWizard] Error creating new blueprint:', error);
                        router.push('/static-wizard');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-[rgb(176,197,198)] transition-colors hover:bg-white/10"
                  >
                    Create Another Blueprint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header */}
      <StandardHeader
        title="Dynamic Questions"
        subtitle="Answer these personalized questions based on your learning objectives. Your responses will help us create a comprehensive learning blueprint tailored to your needs."
        backHref="/"
        backLabel="Back to Dashboard"
        user={user}
      />

      {/* Main Content */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <DynamicFormRenderer
            formSchema={{
              id: `dynamic-${blueprint.id}`,
              title: 'Dynamic Questions',
              description: 'Generated questions based on your responses',
              sections: (Array.isArray(blueprint.dynamic_questions)
                ? blueprint.dynamic_questions.map((section: any) => ({
                    ...section,
                    isCollapsible: section.isCollapsible ?? true,
                    isRequired: section.isRequired ?? true,
                  }))
                : []) as any,
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
            initialData={(blueprint.dynamic_answers as Record<string, unknown>) || {}}
            onSubmit={async (answers) => {
              try {
                // Save dynamic answers to the current draft blueprint
                const svc = createBrowserBlueprintService();
                await svc.updateDynamicAnswers(id, answers);
                // Redirect to generating screen which will stream SSE and finalize save
                router.push(`/generating/${id}`);
              } catch (error) {
                console.error('Error saving dynamic answers:', error);
                router.push('/?blueprint=error');
              }
            }}
            onSave={async (partialAnswers) => {
              try {
                // Persist in real-time to the same line item; user is enforced by RLS
                const svc = createBrowserBlueprintService();
                await svc.updateDynamicAnswers(id, partialAnswers as Record<string, unknown>);
              } catch (e) {
                console.error('Realtime save error:', e);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default function DynamicWizardPage({ params }: DynamicWizardPageProps): React.JSX.Element {
  const { id } = use(params);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <DynamicWizardContent id={id} />
      </ProtectedRoute>
    </AuthProvider>
  );
}
