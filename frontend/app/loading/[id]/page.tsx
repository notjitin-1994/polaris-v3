'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SwirlBackground } from '@/components/layout/SwirlBackground';
import { Header } from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

interface LoadingPageProps {
  params: Promise<{ id: string }>;
}

export default function LoadingPage({ params }: LoadingPageProps): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your questions...');
  const [error, setError] = useState<string | null>(null);

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
      try {
        startProgress();
        setStatus('Analyzing your responses...');

        // Call the API to generate dynamic questions
        const response = await fetch('/api/generate-dynamic-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blueprintId: id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate dynamic questions');
        }

        // Update progress incrementally
        setStatus('Generating personalized questions...');
        setProgress((p) => Math.min(95, p + 5));

        // If API reports already generating or already has questions, proceed directly
        try {
          const json = await response.json();
          if (json?.success) {
            // continue to redirect
          }
        } catch {
          // no-op
        }

        completed = true;
        setStatus('Questions ready! Redirecting...');
        setProgress(100);

        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dynamic-wizard/${id}`);
        }, 900);
      } catch (err) {
        console.error('Error generating dynamic questions:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
                    <div className="h-20 w-20 animate-spin rounded-full border-[3px] border-neutral-300/30 border-t-primary" 
                         style={{ animationDuration: '1s' }} />
                    <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-[3px] border-transparent border-b-primary-accent-light" 
                         style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-2 h-16 w-16 rounded-full bg-primary/10 blur-lg animate-pulse" />
                  </div>
                </div>

                {/* Status Message */}
                <h1 className="font-heading animate-fade-in-up mb-3 text-display text-foreground">
                  {error ? 'Generation Error' : 'Generating Dynamic Questions'}
                </h1>
                <p className="animate-fade-in-up animate-delay-150 mb-8 text-body text-text-secondary">
                  {status}
                </p>

                {/* Premium Progress Bar */}
                <div className="animate-fade-in-up animate-delay-300 mb-8 w-full">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 shadow-inner">
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-primary-accent via-primary-accent-light to-primary-accent transition-all duration-500 ease-out"
                      style={{ 
                        width: `${progress}%`,
                        boxShadow: '0 0 16px rgba(167, 218, 219, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {/* Animated shimmer */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[13px] text-text-disabled font-medium">Progress</span>
                    <span className="text-[15px] font-semibold text-primary-accent tracking-wide">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="animate-fade-in-up rounded-xl border-[1.5px] border-error/40 bg-error/10 p-5 shadow-md">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-error" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[15px] font-medium text-error leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {/* Info Message */}
                {!error && progress < 100 && (
                  <div className="animate-fade-in-up animate-delay-500 flex items-center justify-center gap-2 rounded-lg bg-primary/5 border border-primary/10 py-3 px-4">
                    <svg className="h-4 w-4 text-primary-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[13px] text-text-secondary font-medium">
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
