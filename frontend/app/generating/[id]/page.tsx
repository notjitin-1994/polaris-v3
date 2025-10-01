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
            {error ? 'Generation Error' : 'Generating Your Blueprint'}
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
              <span className="text-[15px] font-semibold text-primary-accent tracking-wide">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-fade-in-up rounded-lg border border-error/30 bg-error/10 p-4">
              <p className="text-body font-medium text-error">{error}</p>
            </div>
          )}

          {/* Info Message */}
          {!error && progress < 100 && (
            <p className="animate-fade-in-up animate-delay-500 text-caption text-text-disabled">
              This may take a moment. Please don't close this page.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
