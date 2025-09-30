'use client';

import React, { useState } from 'react';
import { SwirlBackground } from '@/components/layout/SwirlBackground';
import { Header } from '@/components/layout/Header';

export default function DemoLoadingPage(): JSX.Element {
  const [progress, setProgress] = useState(45);
  const [status, setStatus] = useState('Analyzing your responses...');
  const [error, setError] = useState<string | null>(null);

  // Demo controls
  const [showError, setShowError] = useState(false);

  React.useEffect(() => {
    if (showError) {
      setError('Failed to generate dynamic questions');
    } else {
      setError(null);
    }
  }, [showError]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <Header
        title="Generating Your Blueprint"
        subtitle="AI is creating your personalized learning blueprint"
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
              {error ? 'Generation Error' : 'Generating Your Blueprint'}
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

          {/* Demo Controls */}
          <div className="glass-card mt-8 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Demo Controls</h2>
            <div className="space-y-4">
              {/* Progress Slider */}
              <div>
                <label className="mb-2 block text-sm text-white/70">Progress: {progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
                  style={{
                    accentColor: '#a7dadb',
                  }}
                />
              </div>

              {/* Status Input */}
              <div>
                <label className="mb-2 block text-sm text-white/70">Status Message</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#a7dadb]/50 focus:outline-none"
                />
              </div>

              {/* Error Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="error-toggle"
                  checked={showError}
                  onChange={(e) => setShowError(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#a7dadb] focus:ring-[#a7dadb]/50"
                />
                <label htmlFor="error-toggle" className="text-sm text-white/70">
                  Show Error State
                </label>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setProgress(0)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
                >
                  Reset
                </button>
                <button
                  onClick={() => setProgress(50)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
                >
                  50%
                </button>
                <button
                  onClick={() => setProgress(100)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
