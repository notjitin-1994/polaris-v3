/**
 * Dynamic Questions Loading Page
 * Displays loading state while Perplexity/Ollama generates dynamic questions
 */

'use client';

import { useEffect, useState, use } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('ui');

interface LoadingPageProps {
  params: Promise<{ id: string }>;
}

function LoadingContent({ id }: { id: string }): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your questions...');
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [_generationSource, setGenerationSource] = useState<'perplexity' | 'ollama' | null>(null);
  const [_fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let statusInterval: NodeJS.Timeout | null = null;
    let completed = false;

    // Validate blueprint id is a UUID before proceeding
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      setError('Invalid or missing blueprint ID');
      setStatus('Failed to generate dynamic questions');
      setProgress(100);
      return;
    }

    const steps = [
      'Analyzing your responses...',
      'Researching best practices...',
      'Crafting personalized questions...',
      'Validating question quality...',
      'Finalizing dynamic questionnaire...',
    ];

    // Simulated progress (smooth animation)
    const startProgress = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90 || completed) return prev;
          return Math.min(90, prev + Math.random() * 4);
        });
      }, 350);
    };

    // Cycle through steps
    const startStepRotation = () => {
      statusInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev % steps.length) + 1;
          setStatus(steps[nextStep - 1]);
          return nextStep;
        });
      }, 6000); // Change step every 6 seconds
    };

    const stopIntervals = () => {
      if (progressInterval) clearInterval(progressInterval);
      if (statusInterval) clearInterval(statusInterval);
    };

    const generateDynamicQuestions = async () => {
      const startTime = Date.now();

      try {
        startProgress();
        startStepRotation();

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
        }

        completed = true;
        stopIntervals();
        setProgress(100);
        setStatus('Questions generated successfully!');

        // Redirect to dynamic wizard
        setTimeout(() => {
          router.push(`/dynamic-wizard/${id}`);
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
        stopIntervals();
      }
    };

    void generateDynamicQuestions();

    return () => {
      stopIntervals();
    };
  }, [router, id, user?.id]);

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header */}
      <StandardHeader
        title="Generating Dynamic Questions"
        subtitle="Our AI is analyzing your responses and creating personalized questions. This typically takes 5-15 seconds."
        backHref="/"
        backLabel="Back to Dashboard"
        user={user}
      />

      {/* Main Content with Glassmorphic Background */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient glow background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="bg-primary/[0.02] absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <div className="glass-card animate-scale-in p-8 text-center md:p-12">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              {error ? (
                <div className="bg-error/10 flex h-20 w-20 items-center justify-center rounded-full">
                  <AlertCircle className="text-error h-10 w-10" />
                </div>
              ) : progress === 100 && !error ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="bg-success/10 flex h-20 w-20 items-center justify-center rounded-full"
                >
                  <CheckCircle className="text-success h-10 w-10" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full"
                >
                  <Sparkles className="text-primary h-10 w-10" />
                </motion.div>
              )}
            </div>

            {/* Status Message */}
            <h2 className="text-title text-foreground mb-3 text-center">
              {error
                ? 'Generation Failed'
                : progress === 100
                  ? 'Questions Ready!'
                  : 'Generating Questions'}
            </h2>

            <p className="text-body text-text-secondary mb-8 text-center">{error || status}</p>

            {/* Progress Bar */}
            {!error && (
              <div className="mx-auto mb-6 max-w-md">
                <div className="text-text-secondary mb-2 flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-full">
                  <motion.div
                    className="bg-primary h-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Powered by Solara Badge */}
            <div className="mt-6 flex justify-center">
              <div className="glass-strong rounded-full px-4 py-2 text-xs">
                <span className="text-text-secondary">Powered by </span>
                <span className="font-semibold text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                  Solara
                </span>
              </div>
            </div>

            {/* Step Indicators */}
            {!error && progress < 100 && (
              <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <motion.div
                    key={step}
                    className={`h-2 w-2 rounded-full ${
                      step === currentStep
                        ? 'bg-primary'
                        : step < currentStep
                          ? 'bg-secondary'
                          : 'bg-surface'
                    }`}
                    animate={
                      step === currentStep
                        ? {
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error Actions */}
            {error && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="bg-surface text-foreground hover:bg-surface/80 rounded-xl px-6 py-3 text-sm font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => router.refresh()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Info Card */}
          {!error && progress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="glass-strong mt-6 rounded-xl p-6"
            >
              <h3 className="text-foreground mb-3 text-sm font-semibold">What&apos;s happening?</h3>
              <ul className="text-text-secondary space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Analyzing your static questionnaire responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Researching industry-specific best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Creating personalized questions</span>
                </li>
                <li className="flex items-start gap-2">
                  {progress > 60 ? (
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <div className="border-primary mt-0.5 h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  <span>Generating comprehensive questionnaire</span>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoadingPage({ params }: LoadingPageProps): React.JSX.Element {
  const unwrappedParams = use(params);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <LoadingContent id={unwrappedParams.id} />
      </ProtectedRoute>
    </AuthProvider>
  );
}
