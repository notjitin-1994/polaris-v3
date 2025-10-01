'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Clock, AlertCircle, ExternalLink, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveBlueprintDashboard } from '@/components/blueprint/InteractiveBlueprintDashboard';
import { BlueprintDashboard } from '@/components/blueprint/BlueprintDashboard';
import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';

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
function normalizeBlueprint(blueprint: unknown): unknown {
  if (!blueprint) return null;

  // Handle nested blueprint_json field (legacy format)
  if (typeof blueprint === 'object' && blueprint !== null) {
    const bp = blueprint as Record<string, unknown>;
    if (bp.blueprint_json && typeof bp.blueprint_json === 'object') {
      return bp.blueprint_json;
    }
  }

  return blueprint;
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all hover:shadow-lg"
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

          {/* CTA Button */}
          <motion.a
            href="https://polaris.smartslate.io"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-secondary hover:bg-secondary/90 rounded px-4 py-2 text-sm font-semibold text-white/90 shadow-lg transition-all hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] sm:px-6 sm:py-2.5 sm:text-base"
          >
            <span className="hidden sm:inline">Create New Starmap</span>
            <span className="sm:hidden">Create</span>
          </motion.a>
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
          {/* Decorative Line */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-px flex-1">
              <div className="bg-primary absolute inset-0 blur-sm" />
              <div className="bg-primary relative h-full" />
            </div>
          </div>

          {/* Analytics Dashboard */}
          {blueprintData ? (
            <>
              {isComprehensiveBlueprint(blueprintData) ? (
                <InteractiveBlueprintDashboard
                  blueprint={normalizeBlueprint(blueprintData)}
                  isPublicView={true}
                />
              ) : (
                <BlueprintDashboard blueprint={blueprintData} isPublicView={true} />
              )}
            </>
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium shadow-lg transition-all hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            <span>Get Started with SmartSlate</span>
          </motion.a>
        </motion.div>
      </div>

      {/* Powered by SmartSlate Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center">
        <p className="text-text-secondary text-xs">
          Powered by{' '}
          <Link
            href="/"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            SmartSlate
          </Link>{' '}
          - AI-Powered Learning Blueprint Generator
        </p>
      </footer>
    </main>
  );
}
