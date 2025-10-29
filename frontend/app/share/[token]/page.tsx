'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Clock, AlertCircle, ExternalLink, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveBlueprintDashboard } from '@/src/components/features/blueprint/InteractiveBlueprintDashboard';
// import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation'; // Removed Ollama

// Simple replacement
const parseAndValidateBlueprintJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};
import type { BlueprintJSON } from '@/components/blueprint/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

interface BlueprintData {
  id: string;
  title: string | null;
  created_at: string;
  blueprint_json: unknown;
  blueprint_markdown: string | null;
}

// Check if blueprint has comprehensive structure for InteractiveBlueprintDashboard
function isComprehensiveBlueprint(blueprint: unknown): boolean {
  if (!blueprint || typeof blueprint !== 'object') return false;

  const bp = blueprint as Record<string, unknown>;
  const hasDetailedSections =
    bp.learning_objectives ||
    bp.target_audience ||
    bp.content_outline ||
    bp.implementation_timeline;

  return !!hasDetailedSections;
}

// Normalize blueprint data for consistent rendering
function normalizeBlueprint(blueprint: unknown): BlueprintJSON | null {
  if (!blueprint) return null;

  // Handle nested blueprint_json field (legacy format)
  if (typeof blueprint === 'object' && blueprint !== null) {
    const bp = blueprint as Record<string, unknown>;
    if (bp.blueprint_json && typeof bp.blueprint_json === 'object') {
      return bp.blueprint_json as BlueprintJSON;
    }
  }

  return blueprint as BlueprintJSON;
}

export default function SharedBlueprintPage({ params }: PageProps): React.JSX.Element {
  const [_token, setToken] = useState<string>('');
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideHeader, setHideHeader] = useState(false);
  const router = useRouter();

  // Auto-hide header on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < lastScrollY || currentScrollY <= 50) {
            setHideHeader(false);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setHideHeader(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadSharedBlueprint() {
      try {
        const { token: shareToken } = await params;
        setToken(shareToken);

        // Fetch blueprint using share token (public API, no auth required)
        const response = await fetch(`/api/blueprints/share/${shareToken}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This blueprint is not available or sharing has been disabled.');
          } else {
            setError('Failed to load blueprint. Please try again later.');
          }
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (!result.success || !result.blueprint) {
          setError('Invalid blueprint data received.');
          setLoading(false);
          return;
        }

        setData(result.blueprint as BlueprintData);
      } catch (err) {
        console.error('Error loading shared blueprint:', err);
        setError('An unexpected error occurred while loading the blueprint.');
      } finally {
        setLoading(false);
      }
    }

    loadSharedBlueprint();
  }, [params]);

  // Loading State
  if (loading) {
    return (
      <main className="bg-background flex min-h-screen w-full items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
          <div className="bg-primary/5 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card relative z-10 max-w-md p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="border-primary/30 border-t-primary mx-auto mb-6 h-16 w-16 rounded-full border-4"
          />
          <h2 className="text-foreground mb-2 text-xl font-bold">Loading Blueprint</h2>
          <p className="text-text-secondary text-sm">Fetching analytics dashboard...</p>
        </motion.div>
      </main>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <main className="bg-background flex min-h-screen w-full items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card relative z-10 max-w-md p-8 text-center"
        >
          <div className="bg-error/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <AlertCircle className="text-error h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-bold">Blueprint Not Found</h2>
          <p className="text-text-secondary mb-6 text-sm">
            {error || 'The blueprint you are looking for does not exist or is no longer shared.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit SmartSlate</span>
          </button>
        </motion.div>
      </main>
    );
  }

  // Parse and normalize blueprint JSON
  let blueprintData = null;
  if (data?.blueprint_json) {
    try {
      blueprintData =
        typeof data.blueprint_json === 'string'
          ? JSON.parse(data.blueprint_json)
          : data.blueprint_json;

      // Remove internal generation metadata if present
      if (blueprintData && typeof blueprintData === 'object') {
        const bpData = blueprintData as Record<string, unknown>;
        const { _generation_metadata: _genMeta, ...cleanBlueprint } = bpData;
        blueprintData = cleanBlueprint;
      }
    } catch (e) {
      console.error('Failed to parse blueprint JSON:', e);
      try {
        const rawBlueprint =
          typeof data.blueprint_json === 'string'
            ? data.blueprint_json
            : JSON.stringify(data.blueprint_json);
        blueprintData = parseAndValidateBlueprintJSON(rawBlueprint);
      } catch (fallbackError) {
        console.error('Failed to parse blueprint JSON (fallback):', fallbackError);
      }
    }
  }

  const blueprintTitle = data.title ?? 'Learning Blueprint';
  const createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="bg-background relative min-h-screen w-full overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
      </div>

      {/* Floating Glassmorphic Header - SmartSlate Final Design */}
      <motion.header
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{
          opacity: hideHeader ? 0 : 1,
          y: hideHeader ? -20 : 0,
          scale: hideHeader ? 0.95 : 1,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          visibility: hideHeader ? 'hidden' : 'visible',
        }}
        className="fixed top-4 left-1/2 z-50 w-[calc(100vw-32px)] max-w-7xl -translate-x-1/2 sm:top-8 sm:w-[calc(100vw-64px)]"
      >
        {/* Glassmorphic Background with Teal Border */}
        <div className="absolute inset-0 rounded-2xl border border-[#A7DADB] bg-[rgba(9,21,33,0.4)] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] backdrop-blur-[16px] backdrop-saturate-[180%]" />

        {/* Content */}
        <div className="relative flex items-center justify-between px-6 py-2 sm:px-12 sm:py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <div className="relative h-12 w-40 sm:h-12 sm:w-40">
              <Image
                src="/images/logos/logo.png"
                alt="SmartSlate"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Center: Blueprint Title with Starmap */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <h1 className="truncate text-center text-sm font-medium text-white lg:text-base">
              {blueprintTitle} Starmap
            </h1>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-20 sm:h-24" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden p-6 sm:p-8 lg:p-12"
        >
          {/* Blueprint Metadata Section */}
          {blueprintData?.metadata && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="glass-card from-primary/5 to-secondary/5 rounded-2xl border border-white/10 bg-gradient-to-br via-transparent p-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {blueprintData.metadata.organization && (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-primary bg-primary/10 rounded-full p-3">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-text-disabled text-xs font-medium tracking-wider uppercase">
                          Organization
                        </p>
                        <p className="font-semibold text-white">
                          {blueprintData.metadata.organization}
                        </p>
                      </div>
                    </div>
                  )}

                  {blueprintData.metadata.role && (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-secondary bg-secondary/10 rounded-full p-3">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-text-disabled text-xs font-medium tracking-wider uppercase">
                          Role
                        </p>
                        <p className="font-semibold text-white">{blueprintData.metadata.role}</p>
                      </div>
                    </div>
                  )}

                  {blueprintData.metadata.generated_at && (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-success bg-success/10 rounded-full p-3">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-text-disabled text-xs font-medium tracking-wider uppercase">
                          Generated
                        </p>
                        <p className="font-semibold text-white">
                          {new Date(blueprintData.metadata.generated_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {blueprintData.metadata.version && (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-warning bg-warning/10 rounded-full p-3">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-text-disabled text-xs font-medium tracking-wider uppercase">
                          Version
                        </p>
                        <p className="font-semibold text-white">{blueprintData.metadata.version}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Decorative Line */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-px flex-1">
              <div className="bg-primary absolute inset-0 blur-sm" />
              <div className="bg-primary relative h-full" />
            </div>
          </div>

          {/* Analytics Dashboard */}
          {blueprintData ? (
            <InteractiveBlueprintDashboard blueprint={blueprintData} isPublicView={true} />
          ) : (
            <div className="py-16 text-center">
              <AlertCircle className="text-text-secondary mx-auto mb-4 h-12 w-12" />
              <p className="text-text-secondary">No analytics data available for this blueprint.</p>
            </div>
          )}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-text-secondary mb-4 text-sm">
            Want to create your own personalized learning blueprint?
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            <span>Go to Polaris</span>
          </motion.a>
        </motion.div>
      </div>

      {/* Powered by SmartSlate Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center">
        <p className="text-text-secondary text-xs">
          Powered by{' '}
          <Link
            href="/"
            className="font-semibold !text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-colors hover:!text-[#FFF000]"
          >
            Solara
          </Link>{' '}
          - Built by{' '}
          <span className="font-semibold !text-[#a7dadb] drop-shadow-[0_0_10px_rgba(167,218,219,0.3)] transition-colors hover:!text-[#7bc5c7]">
            Smartslate
          </span>
        </p>
      </footer>
    </main>
  );
}
