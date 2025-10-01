'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Share2,
  ArrowLeft,
  Edit3,
  Copy,
  ExternalLink,
  FileText,
  Sparkles,
  Eye,
  Palette,
  Maximize2,
  Clock,
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
import type { Database } from '@/types/supabase';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'focused' | 'presentation'>('default');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

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

  const handleStartEditing = () => {
    setIsEditingMarkdown(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/blueprint/${blueprintId}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard');
    setShowShareMenu(false);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleExportPDF = async () => {
    if (!data) return;

    setIsExporting(true);
    setShowExportMenu(false);
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

  const handleExportMarkdown = () => {
    if (!data) return;

    const markdown = data.blueprint_markdown ?? '# Blueprint\n\nNo content available.';
    const blueprintTitle = data.title ?? 'Learning Blueprint';
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprintTitle.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    showToast('Markdown exported successfully');
  };

  const handleExportJSON = () => {
    if (!data) return;

    const blueprintTitle = data.title ?? 'Learning Blueprint';
    const exportData = {
      title: data.title,
      created_at: data.created_at,
      blueprint_json: data.blueprint_json,
      blueprint_markdown: data.blueprint_markdown,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprintTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    showToast('JSON exported successfully');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary-950/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md p-8 text-center"
        >
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary-400/30 border-t-primary-400" />
          <div className="skeleton-brand mx-auto mb-4 h-8 w-48 rounded-xl" />
          <div className="skeleton-brand mx-auto h-4 w-32 rounded-lg" />
        </motion.div>
      </main>
    );
  }

  if (error || !user || !data) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-error/10 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md p-8 text-center"
        >
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <ExternalLink className="h-8 w-8 text-error" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            {!user ? 'Authentication Required' : 'Blueprint Not Found'}
          </h2>
          <p className="mb-6 text-text-secondary">
            {!user
              ? 'Please sign in to view this blueprint.'
              : 'The blueprint you are looking for does not exist or you do not have access to it.'}
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{!user ? 'Go to Dashboard' : 'Back to Dashboard'}</span>
          </Link>
        </motion.div>
      </main>
    );
  }

  // Parse blueprint JSON for dashboard
  let blueprintData = null;
  if (data?.blueprint_json) {
    try {
      blueprintData =
        typeof data.blueprint_json === 'string'
          ? JSON.parse(data.blueprint_json)
          : data.blueprint_json;
    } catch (e) {
      console.error('Failed to parse blueprint JSON:', e);
    }
  }

  const markdown = data.blueprint_markdown ?? '# Blueprint\n\nNo markdown available.';
  const blueprintTitle =
    data.title ?? 'Starmap for Professional Development and Career Growth Path';
  const createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Title content with enhanced styling
  const titleContent = (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="hidden sm:block"
      >
        <Sparkles className="h-5 w-5 text-primary-400" />
      </motion.div>
      <div className="flex flex-col">
        <h1 className="font-heading line-clamp-1 text-sm font-bold text-white sm:text-base md:text-lg">
          {blueprintTitle}
        </h1>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {createdDate}
          </span>
          {blueprintData && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Active Blueprint
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Enhanced right side action buttons
  const rightActions = (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <div className="hidden lg:flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-medium transition-all rounded ${
            viewMode === 'default'
              ? 'bg-primary/20 text-primary-300'
              : 'text-white/70 hover:text-white'
          }`}
          onClick={() => setViewMode('default')}
        >
          Default
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-medium transition-all rounded ${
            viewMode === 'focused'
              ? 'bg-primary/20 text-primary-300'
              : 'text-white/70 hover:text-white'
          }`}
          onClick={() => setViewMode('focused')}
        >
          Focused
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-medium transition-all rounded ${
            viewMode === 'presentation'
              ? 'bg-primary/20 text-primary-300'
              : 'text-white/70 hover:text-white'
          }`}
          onClick={() => setViewMode('presentation')}
        >
          Present
        </button>
      </div>

      {/* Edit */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="pressable inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
        onClick={handleStartEditing}
        title="Edit blueprint"
        aria-label="Edit blueprint"
      >
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </motion.button>

      {/* Share Menu */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="pressable inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
          onClick={() => setShowShareMenu(!showShareMenu)}
          title="Share blueprint"
          aria-label="Share blueprint"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </motion.button>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 w-48 glass-card"
            >
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => {
                  setShowShareMenu(false);
                  showToast('Opening email client...');
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Share via Email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Menu */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="pressable inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-xl"
          onClick={() => setShowExportMenu(!showExportMenu)}
          title="Export blueprint"
          aria-label="Export blueprint"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </motion.button>

        <AnimatePresence>
          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 glass-card"
            >
              <div className="p-2">
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all hover:bg-error/10 hover:text-error"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Export as PDF</div>
                    <div className="text-xs opacity-70">Dashboard + Content</div>
                  </div>
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all hover:bg-primary/10 hover:text-primary-300"
                  onClick={handleExportMarkdown}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Export as Markdown</div>
                    <div className="text-xs opacity-70">Editable format</div>
                  </div>
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all hover:bg-success/10 hover:text-success"
                  onClick={handleExportJSON}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-xs opacity-70">Structured data</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary-950/10">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary-400/5 blur-3xl animate-pulse delay-500" />
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
          viewMode === 'focused'
            ? 'mx-auto max-w-4xl'
            : viewMode === 'presentation'
            ? 'mx-auto max-w-7xl'
            : 'mx-auto max-w-6xl'
        } px-4 py-8 sm:px-6 sm:py-12 lg:px-8`}
      >
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`glass-card overflow-hidden ${
            viewMode === 'presentation' ? 'p-8 lg:p-16' : 'p-6 sm:p-8 lg:p-12'
          }`}
        >
          {/* Content Header */}
          <div className="mb-8 pb-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-300 text-xs font-semibold">
                    AI Generated
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-text-secondary text-xs">
                    Version 1.0
                  </span>
                </div>
                <button
                  onClick={() => setRenamingBlueprint(true)}
                  className="group flex items-center gap-2 hover:text-primary-300 transition-colors"
                >
                  <h2 className="text-2xl font-bold text-white">{blueprintTitle}</h2>
                  <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
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

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Preview Mode</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                <Palette className="h-4 w-4" />
                <span className="text-sm">Customize Theme</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                <Maximize2 className="h-4 w-4" />
                <span className="text-sm">Fullscreen</span>
              </button>
            </div>
            <div className="text-xs text-text-disabled">
              Last updated: Just now
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex items-center gap-3 rounded-xl bg-success/20 border border-success/30 backdrop-blur-xl px-4 py-3 shadow-2xl">
              <CheckCircle className="h-5 w-5 text-success" />
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