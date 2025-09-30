'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SwirlBackground } from '@/components/layout/SwirlBackground';

interface GeneratingPageProps {
  params: Promise<{ id: string }>;
}

export default function GeneratingPage({ params }: GeneratingPageProps): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const [status, setStatus] = useState<string>('Preparing your blueprint...');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let completed = false;

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

    const start = async () => {
      // Use fetch stream via EventSource poly path: We expose an SSE endpoint already
      const url = '/api/generate-blueprint';
      try {
        startProgress();
        setStatus('Aggregating your responses...');
        const es = new EventSource(`${url}?bid=${encodeURIComponent(id)}`);
        // However our API expects POST with JSON. We'll create a small POST-to-SSE bridge using fetch + ReadableStream in this client.
        // Fallback to POST streaming
      } catch {
        // no-op; we use POST stream below
      }

      try {
        setStatus('Generating your blueprint...');
        const response = await fetch('/api/generate-blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blueprintId: id }),
        });

        if (
          !response.ok &&
          response.headers.get('content-type')?.includes('text/event-stream') !== true
        ) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to start generation');
        }

        // Read SSE stream manually
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffered = '';
        if (!reader) throw new Error('No readable stream');

        // Pump
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          // Parse SSE events
          const events = buffered.split('\n\n');
          // Keep the last partial chunk in buffer
          buffered = events.pop() || '';
          for (const evt of events) {
            const lines = evt.split('\n');
            const typeLine = lines.find((l) => l.startsWith('event: '));
            const dataLine = lines.find((l) => l.startsWith('data: '));
            const eventType = typeLine ? typeLine.slice('event: '.length) : 'message';
            const dataRaw = dataLine ? dataLine.slice('data: '.length) : '{}';
            let data: any = {};
            try {
              data = JSON.parse(dataRaw);
            } catch {
              /* ignore */
            }

            if (eventType === 'progress') {
              setStatus('Generating your blueprint...');
              setProgress((p) => Math.min(95, p + 2));
            } else if (eventType === 'warning') {
              // Non-fatal duplicate warning
              setStatus(data?.message || 'Finalizing...');
            } else if (eventType === 'error') {
              setError(data?.message || 'Failed to generate blueprint');
              completed = true;
              setProgress(100);
            } else if (eventType === 'complete') {
              completed = true;
              setStatus('Blueprint ready! Redirecting...');
              setProgress(100);
              const savedId: string | undefined = data?.savedBlueprintId;
              // Redirect to view page; fallback to dashboard
              setTimeout(() => {
                if (savedId) router.push(`/blueprint/${savedId}`);
                else router.push('/');
              }, 900);
            } else if (eventType === 'error') {
              // If backend returned a saved fallback id, still redirect to view it
              const savedId: string | undefined = data?.savedBlueprintId;
              if (savedId) {
                completed = true;
                setStatus('Showing fallback blueprint...');
                setProgress(100);
                setTimeout(() => router.push(`/blueprint/${savedId}`), 900);
              }
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
        setProgress(100);
      } finally {
        stopProgress();
      }
    };

    void start();
    return () => {
      stopProgress();
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [id, router]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020C1B] text-[rgb(224,224,224)]">
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
              <span className="text-sm font-semibold text-[#a7dadb]">{Math.round(progress)}%</span>
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
  );
}
