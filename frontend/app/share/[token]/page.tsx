'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import SharedBlueprintView from './SharedBlueprintView';
import type { BlueprintJSON } from '@/components/features/blueprints/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

interface BlueprintData {
  id: string;
  title: string;
  created_at: string;
  blueprint_json: BlueprintJSON;
  blueprint_markdown?: string;
}

export default function SharedBlueprintPage({ params }: PageProps): React.JSX.Element {
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedBlueprint() {
      try {
        const { token: shareToken } = await params;

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

  // Update document metadata when data is loaded
  useEffect(() => {
    if (data) {
      const executiveSummary = typeof data.blueprint_json?.executive_summary === 'string'
        ? data.blueprint_json.executive_summary
        : data.blueprint_json?.executive_summary?.content || 'AI-generated learning blueprint by Smartslate Polaris';

      // Get first line of executive summary
      const description = executiveSummary.split('\n')[0].slice(0, 160);

      // Update document title
      document.title = `${data.title || 'Learning Blueprint'} | Smartslate Polaris`;

      // Update meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updateMetaName = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Open Graph tags
      updateMetaTag('og:title', data.title || 'Learning Blueprint');
      updateMetaTag('og:description', description);
      updateMetaTag('og:type', 'article');
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:site_name', 'Smartslate Polaris');

      // Twitter Card tags
      updateMetaName('twitter:card', 'summary_large_image');
      updateMetaName('twitter:title', data.title || 'Learning Blueprint');
      updateMetaName('twitter:description', description);

      // Standard meta description
      updateMetaName('description', description);
    }
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="border-t-primary mx-auto mb-6 h-16 w-16 rounded-full border-4 border-r-transparent border-b-transparent border-l-transparent"
          />
          <h2 className="mb-2 text-2xl font-bold text-white">Loading Blueprint</h2>
          <p className="text-text-secondary">Preparing your learning experience...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Blueprint Not Found</h2>
          <p className="text-text-secondary mb-8">
            {error || 'The blueprint you are looking for does not exist or is no longer shared.'}
          </p>
          <a
            href="https://polaris.smartslate.io"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-primary/90"
          >
            Create Your Own Blueprint
          </a>
        </motion.div>
      </div>
    );
  }

  return <SharedBlueprintView blueprint={data} />;
}
