'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  ArrowLeft,
  Edit3,
  ExternalLink,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { BlueprintRenderer } from '@/components/blueprint/BlueprintRenderer';
import { RenameDialog } from '@/components/ui/RenameDialog';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';

interface PageProps {
  params: Promise<{ id: string }>;
}

type BlueprintData = {
  id: string;
  user_id: string;
  blueprint_markdown: string | null;
  blueprint_json: unknown;
  title: string | null;
  created_at: string;
};

export default function BlueprintPage({ params }: PageProps): React.JSX.Element {
  const [blueprintId, setBlueprintId] = useState<string>('');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [renamingBlueprint, setRenamingBlueprint] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const viewMode = 'presentation' as const; // Always use presentation mode
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Unwrap params and fetch data
  useEffect(() => {
    async function loadData() {
      try {
        const { id } = await params;
        setBlueprintId(id);

        const supabase = getSupabaseBrowserClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          setError(true);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const { data: blueprintData, error: fetchError } = await supabase
          .from('blueprint_generator')
          .select('id, user_id, blueprint_markdown, blueprint_json, title, created_at')
          .eq('id', id)
          .eq('user_id', currentUser.id)
          .single();

        if (fetchError || !blueprintData) {
          setError(true);
        } else {
          setData(blueprintData as BlueprintData);
        }
      } catch (err) {
        console.error('Error loading blueprint:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  const handleRenameBlueprint = async (newTitle: string): Promise<void> => {
    if (!user?.id || !data) {
      throw new Error('User not authenticated or no blueprint data');
    }

    try {
      const updatedBlueprint = await createBrowserBlueprintService().updateBlueprintTitle(
        data.id,
        newTitle,
        user.id
      );

      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, title: updatedBlueprint.title || newTitle.trim() };
      });

      showToast('Blueprint renamed successfully');
    } catch (err) {
      console.error('Error renaming blueprint:', err);
      throw err;
    }
  };

  const handleSaveMarkdown = async (newMarkdown: string): Promise<void> => {
    if (!user?.id || !data) {
      throw new Error('User not authenticated or no blueprint data');
    }

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: updateError } = await supabase
        .from('blueprint_generator')
        .update({ blueprint_markdown: newMarkdown })
        .eq('id', data.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, blueprint_markdown: newMarkdown };
      });

      // Exit edit mode
      setIsEditingMarkdown(false);
      showToast('Blueprint updated successfully');
    } catch (err) {
      console.error('Error saving markdown:', err);
      throw err;
    }
  };

  const handleShareBlueprint = async () => {
    if (!blueprintId || isGeneratingShare) return;

    setIsGeneratingShare(true);

    try {
      const response = await fetch('/api/blueprints/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const result = await response.json();

      if (result.success && result.shareUrl) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.shareUrl);
        showToast('Share link copied to clipboard');
      } else {
        showToast('Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showToast('Failed to generate share link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleExportPDF = async () => {
    if (!data) return;

    setIsExporting(true);
    showToast('Preparing PDF export...');

    try {
      const { exportBlueprintToPDF } = await import('@/lib/export/blueprintPDFExport');
      await exportBlueprintToPDF({
        id: data.id,
        title: data.title,
        created_at: data.created_at,
        blueprint_markdown: data.blueprint_markdown,
        blueprint_json: data.blueprint_json,
      });
      showToast('PDF exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-background flex min-h-screen w-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md p-8 text-center"
        >
          <div className="border-primary/30 border-t-primary mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4" />
          <div className="skeleton-brand mx-auto mb-4 h-8 w-48 rounded-xl" />
          <div className="skeleton-brand mx-auto h-4 w-32 rounded-lg" />
        </motion.div>
      </main>
    );
  }

  if (error || !user || !data) {
    return (
      <main className="bg-background flex min-h-screen w-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md p-8 text-center"
        >
          <div className="bg-error/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <ExternalLink className="text-error h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-bold">
            {!user ? 'Authentication Required' : 'Blueprint Not Found'}
          </h2>
          <p className="text-text-secondary mb-6">
            {!user
              ? 'Please sign in to view this blueprint.'
              : 'The blueprint you are looking for does not exist or you do not have access to it.'}
          </p>
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all hover:shadow-lg"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{!user ? 'Go to Dashboard' : 'Back to Dashboard'}</span>
          </Link>
        </motion.div>
      </main>
    );
  }

  // Parse and normalize blueprint JSON for dashboard
  let blueprintData = null;
  if (data?.blueprint_json) {
    try {
      // Parse the blueprint JSON (already validated during generation)
      blueprintData =
        typeof data.blueprint_json === 'string'
          ? JSON.parse(data.blueprint_json)
          : data.blueprint_json;

      // Remove internal generation metadata if present
      if (blueprintData && typeof blueprintData === 'object') {
        const { _generation_metadata, ...cleanBlueprint } = blueprintData as Record<
          string,
          unknown
        >;
        blueprintData = cleanBlueprint;
      }
    } catch (e) {
      console.error('Failed to parse blueprint JSON:', e);
      // Attempt Ollama normalization as fallback for legacy blueprints
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

  const markdown = data.blueprint_markdown ?? '# Blueprint\n\nNo markdown available.';
  const blueprintTitle =
    data.title ?? 'Starmap for Professional Development and Career Growth Path';
  const _createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Compact title content with inline metadata
  const titleContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <h1 className="font-heading line-clamp-1 text-sm font-bold text-white sm:text-base">
        {blueprintTitle}
      </h1>
    </div>
  );

  // Compact action buttons
  const rightActions = (
    <div className="flex items-center gap-1.5">
      {/* Rename/Edit */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
        onClick={() => setRenamingBlueprint(true)}
        title="Rename blueprint"
        aria-label="Rename blueprint"
      >
        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.button>

      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleShareBlueprint}
        disabled={isGeneratingShare}
        title="Copy share link to clipboard"
        aria-label="Copy share link to clipboard"
      >
        {isGeneratingShare ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </motion.button>

      {/* Export Button - Direct PDF Export */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="pressable bg-secondary hover:bg-secondary/90 text-secondary-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleExportPDF}
        disabled={isExporting}
        title="Export blueprint as PDF"
        aria-label="Export blueprint as PDF"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.button>
    </div>
  );

  return (
    <main className="bg-background relative min-h-screen w-full overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
      </div>

      {/* Header */}
      <StandardHeader
        title={titleContent}
        subtitle=""
        backHref="/"
        backLabel="Dashboard"
        rightActions={rightActions}
        size="compact"
        showDarkModeToggle={false}
        showUserAvatar={false}
      />

      {/* Content with View Mode Support */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`relative z-10 ${
          (viewMode === 'presentation' ? 'mx-auto max-w-7xl' : 'mx-auto max-w-6xl') as const
        } px-8 py-12`}
      >
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`glass-card overflow-hidden ${
            viewMode === 'presentation' ? 'p-16' : 'p-12'
          }`}
        >
          {/* Decorative Line with Teal Glow */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-px flex-1">
              <div className="bg-primary absolute inset-0 blur-sm" />
              <div className="bg-primary relative h-full" />
            </div>
          </div>

          {/* Blueprint Renderer */}
          <BlueprintRenderer
            markdown={markdown}
            blueprint={blueprintData}
            isEditMode={isEditingMarkdown}
            onSaveMarkdown={handleSaveMarkdown}
            onCancelEdit={() => setIsEditingMarkdown(false)}
          />
        </motion.div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed right-6 bottom-6 z-50"
          >
            <div className="bg-success/20 border-success/30 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl">
              <CheckCircle className="text-success h-5 w-5" />
              <span className="text-sm font-medium text-white">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renamingBlueprint}
        onClose={() => setRenamingBlueprint(false)}
        onConfirm={handleRenameBlueprint}
        currentName={blueprintTitle}
        title="Rename Blueprint"
        description="Give your blueprint a meaningful name"
        placeholder="Enter blueprint name..."
        maxLength={100}
      />
    </main>
  );
}
