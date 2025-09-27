'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

export default function LoadingPage(): JSX.Element {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your blueprint...');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let statusInterval: NodeJS.Timeout;
    let redirectTimer: NodeJS.Timeout;

    if (!id) {
      setError('Missing blueprint ID');
      setStatus('Failed to generate dynamic questions');
      setProgress(100);
      return;
    }

    const generateDynamicQuestions = async () => {
      try {
        setStatus('Analyzing your responses...');
        setProgress(20);

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

        setStatus('Dynamic questions generated successfully!');
        setProgress(100);
        setIsComplete(true);

        // Redirect after a short delay
        redirectTimer = setTimeout(() => {
          router.push(`/dynamic-wizard/${id}`);
        }, 2000);

      } catch (err) {
        console.error('Error generating dynamic questions:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setStatus('Failed to generate dynamic questions');
        setProgress(100);
      }
    };

    // Start the generation process
    generateDynamicQuestions();

    // Simulate progress updates while generation is happening
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90 || isComplete) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Update status messages
    const statusUpdates = [
      'Preparing your blueprint...',
      'Analyzing your responses...',
      'Generating dynamic questions...',
      'Almost ready...',
    ];

    let statusIndex = 0;
    statusInterval = setInterval(() => {
      if (statusIndex < statusUpdates.length - 1 && !isComplete && !error) {
        statusIndex++;
        setStatus(statusUpdates[statusIndex]);
      }
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(redirectTimer);
    };
  }, [router, id, isComplete]);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <main className="min-h-screen bg-blue-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  error 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : isComplete 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  {error ? (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  ) : isComplete ? (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {error ? 'Generation Failed' : isComplete ? 'Ready!' : 'Generating Dynamic Questions'}
                </h1>
                <p className={`text-sm ${
                  error 
                    ? 'text-red-600 dark:text-red-400' 
                    : isComplete 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {status}
                </p>
              </div>

              <div className="mb-6">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      error 
                        ? 'bg-red-600 dark:bg-red-400' 
                        : isComplete 
                        ? 'bg-green-600 dark:bg-green-400' 
                        : 'bg-blue-600 dark:bg-blue-400'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  {Math.round(progress)}% complete
                </p>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {error ? (
                  <div className="space-y-3">
                    <p className="text-red-600 dark:text-red-400">
                      {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : isComplete ? (
                  <div className="space-y-2">
                    <p className="text-green-600 dark:text-green-400">
                      Dynamic questions have been generated successfully!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                      <ArrowRight className="w-4 h-4" />
                      <span>Redirecting to dynamic questionnaire...</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">
                      We&apos;re analyzing your static responses and generating personalized dynamic
                      questions tailored to your learning objectives.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                      <ArrowRight className="w-4 h-4" />
                      <span>Please wait...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    </AuthProvider>
  );
}
