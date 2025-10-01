/**
 * Blueprint Generation Loading Page
 * Displays loading state while Claude generates the learning blueprint
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

interface GeneratingPageProps {
  params: Promise<{ id: string }>;
}

function GeneratingContent({ id }: { id: string }): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing blueprint generation...');
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [_model, setModel] = useState<'claude-sonnet-4' | 'claude-opus-4' | 'ollama' | null>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let statusInterval: NodeJS.Timeout | null = null;
    let completed = false;

    const steps = [
      'Analyzing questionnaire responses...',
      'Generating learning objectives...',
      'Designing instructional strategy...',
      'Creating content outline...',
      'Planning resources and timeline...',
      'Finalizing assessment strategy...',
    ];

    // Simulated progress (smooth animation)
    const startProgress = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90 || completed) return prev;
          return Math.min(90, prev + Math.random() * 3);
        });
      }, 400);
    };

    // Cycle through steps
    const startStepRotation = () => {
      statusInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev % steps.length) + 1;
          setStatus(steps[nextStep - 1]);
          return nextStep;
        });
      }, 8000); // Change step every 8 seconds
    };

    const stopIntervals = () => {
      if (progressInterval) clearInterval(progressInterval);
      if (statusInterval) clearInterval(statusInterval);
    };

    const generateBlueprint = async () => {
      const startTime = Date.now();

      try {
        startProgress();
        startStepRotation();

        logger.info('blueprint.generation.ui.start', 'Starting blueprint generation from UI', {
          blueprintId: id,
          userId: user?.id,
        });

        // Call blueprint generation endpoint
        const response = await fetch('/api/blueprints/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blueprintId: id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          logger.error('blueprint.generation.ui.error', 'Blueprint generation failed', {
            blueprintId: id,
            statusCode: response.status,
            error: errorData.error,
            duration: Date.now() - startTime,
          });

          throw new Error(errorData.error || 'Failed to generate blueprint');
        }

        const result = await response.json();

        completed = true;
        stopIntervals();

        setProgress(100);
        setStatus('Blueprint generated successfully!');
        setModel(result.metadata?.model);

        logger.info('blueprint.generation.ui.complete', 'Blueprint generated successfully', {
          blueprintId: id,
          model: result.metadata?.model,
          duration: Date.now() - startTime,
          fallbackUsed: result.metadata?.fallbackUsed,
        });

        // Redirect to blueprint viewer
        setTimeout(() => {
          router.push(`/blueprint/${id}`);
        }, 1500);
      } catch (error) {
        completed = true;
        stopIntervals();

        setError((error as Error).message);
        setStatus('Generation failed');
        setProgress(100);

        logger.error('blueprint.generation.ui.fatal_error', 'Fatal error during generation', {
          blueprintId: id,
          error: (error as Error).message,
          duration: Date.now() - startTime,
        });
      }
    };

    generateBlueprint();

    return () => {
      stopIntervals();
    };
  }, [id, router, user?.id]);

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header */}
      <StandardHeader
        title="Generating Your Learning Blueprint"
        subtitle="Our AI is analyzing your responses and creating a comprehensive, personalized learning blueprint. This typically takes 30-60 seconds."
        backHref="/"
        backLabel="Back to Dashboard"
        user={user}
      />

      {/* Main Content */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card animate-scale-in rounded-2xl p-8 md:p-12">
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
                  ? 'Blueprint Ready!'
                  : 'Generating Blueprint'}
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
                <span
                  className="font-semibold text-[#FFD700]"
                  style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}
                >
                  Solara
                </span>
              </div>
            </div>

            {/* Step Indicators */}
            {!error && progress < 100 && (
              <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
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
              <h3 className="text-foreground mb-3 text-sm font-semibold">What's happening?</h3>
              <ul className="text-text-secondary space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Analyzing your questionnaire responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Creating personalized learning objectives</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Designing instructional strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  {progress > 60 ? (
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <div className="border-primary mt-0.5 h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  <span>Generating comprehensive blueprint</span>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GeneratingPage({ params }: GeneratingPageProps): React.JSX.Element {
  const unwrappedParams = use(params);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <GeneratingContent id={unwrappedParams.id} />
      </ProtectedRoute>
    </AuthProvider>
  );
}
