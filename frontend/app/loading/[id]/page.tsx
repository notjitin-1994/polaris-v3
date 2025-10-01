'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SwirlBackground } from '@/components/layout/SwirlBackground';
import { Header } from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('ui');

interface LoadingPageProps {
  params: Promise<{ id: string }>;
}

export default function LoadingPage({ params }: LoadingPageProps): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your questions...');
  const [error, setError] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<'perplexity' | 'ollama' | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let completed = false;

    // Validate blueprint id is a UUID before proceeding
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      setError('Invalid or missing blueprint ID');
      setStatus('Failed to generate dynamic questions');
      setProgress(100);
      return;
    }

    const startProgress = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90 || completed) return prev;
          return Math.min(90, prev + Math.random() * 7);
        });
      }, 300);
    };

    const stopProgress = () => {
      if (progressInterval) clearInterval(progressInterval);
    };

    const generateDynamicQuestions = async () => {
      const startTime = Date.now();

      try {
        startProgress();
        setStatus('Analyzing your responses...');

        logger.info('dynamic_questions.generation.start', 'Starting question generation from UI', {
          blueprintId: id,
        });

        // Call the NEW Perplexity-powered API
        const response = await fetch('/api/dynamic-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blueprintId: id,
            // Static answers will be fetched from DB by the API
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          logger.error('dynamic_questions.generation.error', 'Question generation failed', {
            blueprintId: id,
            statusCode: response.status,
            error: errorData.error,
            duration: Date.now() - startTime,
          });

          throw new Error(errorData.error || 'Failed to generate dynamic questions');
        }

        // Parse response
        const result = await response.json();

        // Update progress states
        setStatus('Generating personalized questions...');
        setProgress((p) => Math.min(95, p + 5));

        // Capture generation metadata
        if (result.metadata) {
          setGenerationSource(result.metadata.source);
          setFallbackUsed(result.metadata.fallbackUsed || false);

          logger.info('dynamic_questions.generation.complete', 'Questions generated successfully', {
            blueprintId: id,
            source: result.metadata.source,
            fallbackUsed: result.metadata.fallbackUsed,
            sectionCount: result.sections?.length,
            duration: Date.now() - startTime,
          });

          // Show source indicator briefly
          if (result.metadata.source === 'perplexity') {
            setStatus('✨ Questions generated with Perplexity Research');
          } else if (result.metadata.fallbackUsed) {
            setStatus('⚡ Questions generated with Ollama (Fallback)');
          } else {
            setStatus('✅ Questions generated with Ollama');
          }
        }

        completed = true;
        setProgress(100);

        // Redirect after showing source badge
        setTimeout(() => {
          setStatus('Questions ready! Redirecting...');
          setTimeout(() => {
            router.push(`/dynamic-wizard/${id}`);
          }, 500);
        }, 1500);
      } catch (err) {
        console.error('Error generating dynamic questions:', err);

        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

        logger.error('dynamic_questions.generation.error', 'Question generation failed in UI', {
          blueprintId: id,
          error: errorMessage,
          duration: Date.now() - startTime,
        });

        setError(errorMessage);
        setStatus('Failed to generate dynamic questions');
        setProgress(100);
        completed = true;
      } finally {
        stopProgress();
      }
    };

    void generateDynamicQuestions();

    return () => {
      stopProgress();
    };
  }, [router, id]);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen w-full flex-col bg-[#020C1B] text-[rgb(224,224,224)]">
          {/* Header */}
          <Header
            title="Generating Dynamic Questions"
            subtitle="AI is analyzing your responses to create personalized questions"
          />

          {/* Main Loading Content */}
          <main className="relative flex flex-1 items-center justify-center overflow-hidden">
            <div className="page-enter animate-fade-in-up relative z-10 mx-auto w-full max-w-2xl px-4">
              <div className="glass-card relative overflow-hidden p-8 text-center sm:p-12">
                {/* Header area swirls */}
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <SwirlBackground
                    count={8}
                    minSize={40}
                    maxSize={72}
                    opacityMin={0.02}
                    opacityMax={0.05}
                  />
                </div>

                {/* Premium Loading Indicator */}
                <div className="mb-10 inline-flex items-center justify-center">
                  <div className="relative">
                    <div
                      className="border-t-primary h-20 w-20 animate-spin rounded-full border-[3px] border-neutral-300/30"
                      style={{ animationDuration: '1s' }}
                    />
                    <div
                      className="border-b-primary-accent-light absolute inset-0 h-20 w-20 animate-spin rounded-full border-[3px] border-transparent"
                      style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
                    />
                    <div className="bg-primary/10 absolute inset-2 h-16 w-16 animate-pulse rounded-full blur-lg" />
                  </div>
                </div>

                {/* Status Message */}
                <h1 className="font-heading animate-fade-in-up text-display text-foreground mb-3">
                  {error ? 'Generation Error' : 'Generating Dynamic Questions'}
                </h1>
                <p className="animate-fade-in-up animate-delay-150 text-body text-text-secondary mb-8">
                  {status}
                </p>

                {/* Premium Progress Bar */}
                <div className="animate-fade-in-up animate-delay-300 mb-8 w-full">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 shadow-inner">
                    <div
                      className="from-primary-accent via-primary-accent-light to-primary-accent relative h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out"
                      style={{
                        width: `${progress}%`,
                        boxShadow:
                          '0 0 16px rgba(167, 218, 219, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {/* Animated shimmer */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-text-disabled text-[13px] font-medium">Progress</span>
                    <span className="text-primary-accent text-[15px] font-semibold tracking-wide">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="animate-fade-in-up border-error/40 bg-error/10 rounded-xl border-[1.5px] p-5 shadow-md">
                    <div className="flex items-start gap-3">
                      <svg
                        className="text-error mt-0.5 h-5 w-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-error text-[15px] leading-relaxed font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Generation Source Badge */}
                {generationSource && progress === 100 && !error && (
                  <div className="animate-fade-in-up mb-4">
                    {generationSource === 'perplexity' ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-4 py-2 dark:border-purple-700 dark:bg-purple-900">
                        <svg
                          className="h-4 w-4 text-purple-600 dark:text-purple-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Generated with Perplexity Research
                        </span>
                      </div>
                    ) : fallbackUsed ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-100 px-4 py-2 dark:border-yellow-700 dark:bg-yellow-900">
                        <svg
                          className="h-4 w-4 text-yellow-600 dark:text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                          Generated with Ollama (Fallback)
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 dark:border-blue-700 dark:bg-blue-900">
                        <svg
                          className="h-4 w-4 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          Generated with Ollama
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Info Message */}
                {!error && progress < 100 && (
                  <div className="animate-fade-in-up animate-delay-500 bg-primary/5 border-primary/10 flex items-center justify-center gap-2 rounded-lg border px-4 py-3">
                    <svg
                      className="text-primary-accent h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-text-secondary text-[13px] font-medium">
                      This may take a moment. Please don't close this page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
