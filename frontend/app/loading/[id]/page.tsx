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

                {/* Animated Logo/Icon */}
                <div className="mb-8 inline-flex items-center justify-center">
                  <img
                    src="/logo-swirl.png"
                    alt="SmartSlate Logo"
                    className="h-20 w-20"
                    style={{
                      animation: 'spin 0.8s linear infinite',
                      filter:
                        'brightness(1.4) saturate(1.3) drop-shadow(0 0 20px rgba(167, 218, 219, 0.7)) drop-shadow(0 0 10px rgba(167, 218, 219, 0.5)) drop-shadow(0 0 5px rgba(167, 218, 219, 0.3))',
                      transform: 'scale(1)',
                      transition: 'transform 0.3s ease',
                      willChange: 'transform',
                    }}
                  />
                </div>

                {/* Status Message */}
                <h1 className="font-heading animate-fade-in-up mb-3 text-2xl font-bold text-white sm:text-3xl">
                  {error ? 'Generation Error' : 'Generating Dynamic Questions'}
                </h1>
                <p className="animate-fade-in-up animate-delay-150 mb-8 text-base text-[rgb(176,197,198)] sm:text-lg">
                  {status}
                </p>

                {/* Progress Bar */}
                <div className="animate-fade-in-up animate-delay-300 mb-6 w-full">
                  <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#a7dadb] to-[#4F46E5] transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-white/60">Progress</span>
                    <span className="text-sm font-semibold text-[#a7dadb]">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="glass-card animate-fade-in-up border border-[#ef4444]/30 bg-[#ef4444]/10 p-4">
                    <p className="text-sm font-medium text-[#ef4444]">{error}</p>
                  </div>
                )}

                {/* Info Message */}
                {!error && progress < 100 && (
                  <p className="animate-fade-in-up animate-delay-500 text-sm text-white/50">
                    This may take a moment. Please don't close this page.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
