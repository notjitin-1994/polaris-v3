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
  Plus,
  Rocket,
  Presentation,
  Wand2,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RenameDialog } from '@/components/ui/RenameDialog';
import { InteractiveBlueprintDashboard } from '@/components/features/blueprints/InteractiveBlueprintDashboard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import { useRouter } from 'next/navigation';
// Removed Ollama imports - using Claude-based validation
// import { parseAndValidateBlueprintJSON } from '@/lib/ollama/blueprintValidation';
// import { AnyBlueprint, isFullBlueprint } from '@/lib/ollama/schema';

// Simple replacements for removed Ollama functions
type AnyBlueprint = any;
const isFullBlueprint = (data: any): boolean => {
  return data && typeof data === 'object' && Object.keys(data).length > 0;
};
const parseAndValidateBlueprintJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

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
  const router = useRouter();
  const [blueprintId, setBlueprintId] = useState<string>('');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [renamingBlueprint, setRenamingBlueprint] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isSolaraButtonHovered, setIsSolaraButtonHovered] = useState(false);
  const [isShareButtonHovered, setIsShareButtonHovered] = useState(false);
  const [isDownloadButtonHovered, setIsDownloadButtonHovered] = useState(false);
  const [isPresentButtonHovered, setIsPresentButtonHovered] = useState(false);

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

      showToast('Blueprint updated successfully');
    } catch (err) {
      console.error('Error saving markdown:', err);
      throw err;
    }
  };

  const handleShareBlueprint = async () => {
    if (!data?.id || isGeneratingShare) return;

    setIsGeneratingShare(true);

    try {
      const response = await fetch('/api/blueprints/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId: data.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate share link');
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
      showToast(error instanceof Error ? error.message : 'Failed to generate share link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const _handleExportPDF = async () => {
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

  const handleExportWord = async () => {
    if (!data) return;

    setIsExporting(true);
    showToast('Preparing plain markdown Word document export...');

    try {
      const { generatePlainMarkdownWordDocument } = await import('@/lib/export/wordGenerator');

      // Use the blueprint_markdown field directly for a plain export
      const markdownContent = data.blueprint_markdown || 'No content available';

      const result = await generatePlainMarkdownWordDocument(markdownContent, blueprintTitle);

      if (result.success && result.data) {
        // Create download link
        const url = URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${blueprintTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Plain markdown Word document downloaded successfully');
      } else {
        throw new Error(result.error || 'Word export failed');
      }
    } catch (error) {
      console.error('Word export error:', error);
      showToast('Word export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Parse and normalize blueprint JSON for dashboard (BEFORE conditional returns)
  let blueprintData: AnyBlueprint | null = null;
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
        blueprintData = cleanBlueprint as AnyBlueprint;
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

  const markdown = data?.blueprint_markdown ?? '# Blueprint\n\nNo markdown available.';
  const blueprintTitle =
    data?.title ?? 'Starmap for Professional Development and Career Growth Path';

  // Helper function to normalize blueprint for InteractiveBlueprintDashboard
  const normalizedBlueprint = React.useMemo(() => {
    if (!blueprintData || !isFullBlueprint(blueprintData)) {
      console.log('Blueprint validation failed:', {
        blueprintData,
        isValid: isFullBlueprint(blueprintData),
      });
      return null;
    }

    // Ensure the blueprint has all required sections with proper structure
    const normalized = {
      ...blueprintData,
      metadata: blueprintData.metadata || {
        title: blueprintTitle,
        organization: 'Organization',
        role: 'Professional',
        generated_at: data?.created_at || new Date().toISOString(),
        version: '1.0',
        model: 'claude',
      },
    };

    console.log('Normalized blueprint:', normalized);
    return normalized;
  }, [blueprintData, blueprintTitle, data?.created_at]);

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

  const _createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Extract executive summary for hero section
  const executiveSummary =
    normalizedBlueprint?.executive_summary?.content ||
    normalizedBlueprint?.executive_summary ||
    'No executive summary available.';

  return (
    <>
      {/* Main Content */}
      <div className="bg-background relative w-full overflow-x-hidden">
        {/* Animated Background Pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
          <div className="bg-primary/5 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
        </div>

        {/* Hero Section - Minimalistic Design */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Title Section - Clean Typography */}
            <div className="space-y-6">
              {/* Platform Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center justify-between gap-4"
              >
                <div className="border-primary/40 inline-flex items-center gap-2.5 rounded-full border bg-white/5 py-1.5 pr-4 pl-2 text-sm shadow-[0_0_20px_rgba(167,218,219,0.3)]">
                  <motion.div
                    className="relative h-7 w-7 flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Image
                      src="/logo-swirl.png"
                      alt="Smartslate Polaris Logo"
                      fill
                      className="relative object-contain p-0.5"
                    />
                  </motion.div>
                  <span className="text-text-secondary font-medium">
                    Built by <span className="text-primary font-semibold">Smartslate Polaris</span>{' '}
                    | Powered by{' '}
                    <span className="font-semibold text-yellow-400">Solara Learning Engine</span>
                  </span>
                </div>

                {/* Action Buttons Container */}
                <div className="flex items-center gap-3">
                  {/* Animated Explore Solara Button */}
                  <motion.button
                    onClick={() => window.open('https://solara.smartslate.io', '_blank')}
                    onHoverStart={() => setIsSolaraButtonHovered(true)}
                    onHoverEnd={() => setIsSolaraButtonHovered(false)}
                    className="bg-primary hover:bg-primary/90 relative flex items-center overflow-hidden rounded-full shadow-lg transition-colors"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isSolaraButtonHovered ? '250px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute top-0 left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        rotate: isSolaraButtonHovered ? -15 : 0,
                        y: isSolaraButtonHovered ? -2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Rocket className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isSolaraButtonHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pr-4 pl-10 text-sm font-semibold whitespace-nowrap text-black"
                        >
                          Explore Solara Learning Engine
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Share Button */}
                  <motion.button
                    onClick={handleShareBlueprint}
                    onHoverStart={() => setIsShareButtonHovered(true)}
                    onHoverEnd={() => setIsShareButtonHovered(false)}
                    disabled={isGeneratingShare || !data}
                    className="bg-primary hover:bg-primary/90 relative flex items-center overflow-hidden rounded-full shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isShareButtonHovered ? '160px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute top-0 left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        scale: isShareButtonHovered ? 1.1 : 1,
                        rotate: isShareButtonHovered ? 12 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {isGeneratingShare ? (
                        <Loader2 className="h-5 w-5 animate-spin text-black" strokeWidth={2.5} />
                      ) : (
                        <Share2 className="h-5 w-5 text-black" strokeWidth={2.5} />
                      )}
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isShareButtonHovered && !isGeneratingShare && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pr-4 pl-10 text-sm font-semibold whitespace-nowrap text-black"
                        >
                          Share Blueprint
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Present Button - Placeholder */}
                  <motion.button
                    onClick={() => showToast('Presentation mode coming soon!')}
                    onHoverStart={() => setIsPresentButtonHovered(true)}
                    onHoverEnd={() => setIsPresentButtonHovered(false)}
                    className="bg-primary hover:bg-primary/90 relative flex items-center overflow-hidden rounded-full shadow-lg transition-colors"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isPresentButtonHovered ? '140px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute top-0 left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        scale: isPresentButtonHovered ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Presentation className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isPresentButtonHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pr-4 pl-10 text-sm font-semibold whitespace-nowrap text-black"
                        >
                          Present
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Download Button */}
                  <motion.button
                    onClick={handleExportWord}
                    onHoverStart={() => setIsDownloadButtonHovered(true)}
                    onHoverEnd={() => setIsDownloadButtonHovered(false)}
                    disabled={isExporting || !normalizedBlueprint}
                    className="bg-primary hover:bg-primary/90 relative flex items-center overflow-hidden rounded-full shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isDownloadButtonHovered ? '190px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute top-0 left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        y: isDownloadButtonHovered ? 2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {isExporting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-black" strokeWidth={2.5} />
                      ) : (
                        <Download className="h-5 w-5 text-black" strokeWidth={2.5} />
                      )}
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isDownloadButtonHovered && !isExporting && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pr-4 pl-10 text-sm font-semibold whitespace-nowrap text-black"
                        >
                          Download Blueprint
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Create New Blueprint Button */}
                  <motion.button
                    onClick={() => window.open('https://polaris.smartslate.io', '_blank')}
                    onHoverStart={() => setIsButtonHovered(true)}
                    onHoverEnd={() => setIsButtonHovered(false)}
                    className="bg-primary hover:bg-primary/90 relative flex items-center overflow-hidden rounded-full shadow-lg transition-colors"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isButtonHovered ? '210px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute top-0 left-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        rotate: isButtonHovered ? 90 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isButtonHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pr-4 pl-10 text-sm font-semibold whitespace-nowrap text-black"
                        >
                          Create New Blueprint
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>

              {/* Main Title - Focus on Typography */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="font-heading text-foreground text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                {blueprintTitle}
              </motion.h1>

              {/* Executive Summary - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative"
              >
                {/* Edit Section and Modify with AI Buttons */}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-text-primary text-xl font-semibold">Executive Summary</h2>
                  <div className="flex items-center gap-2">
                    {/* Edit Section Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showToast('Edit section coming soon!')}
                      className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-9 min-h-[44px] w-9 min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_15px_rgba(167,218,219,0.6)] active:scale-95"
                      title="Edit Section"
                      aria-label="Edit executive summary section"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>

                    {/* Modify with AI Button */}
                    <motion.button
                      animate={{
                        boxShadow: [
                          '0 0 15px rgba(167,218,219,0.5)',
                          '0 0 20px rgba(167,218,219,0.7)',
                          '0 0 15px rgba(167,218,219,0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => console.log('Modify Executive Summary')}
                      className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-9 min-h-[44px] w-9 min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_25px_rgba(167,218,219,0.8)] active:scale-95"
                      title="Modify with AI"
                      aria-label="Modify executive summary with AI"
                    >
                      <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
                    </motion.button>
                  </div>
                </div>

                {/* Executive Summary Paragraphs */}
                <div className="space-y-4">
                  {executiveSummary
                    .split(/\.\s+/)
                    .filter(Boolean)
                    .map((sentence, index) => (
                      <p
                        key={index}
                        className="text-text-secondary text-lg leading-relaxed sm:text-xl"
                      >
                        {sentence.trim()}
                        {sentence.trim().endsWith('.') ? '' : '.'}
                      </p>
                    ))}
                </div>
              </motion.div>
            </div>

            {/* Metadata - Banner Format */}
            {normalizedBlueprint?.metadata && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="flex flex-wrap items-center gap-3"
              >
                {normalizedBlueprint.metadata.organization && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                    <span className="text-text-disabled">Organization:</span>
                    <span className="text-text-secondary font-medium">
                      {normalizedBlueprint.metadata.organization}
                    </span>
                  </div>
                )}

                {normalizedBlueprint.metadata.role && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                    <span className="text-text-disabled">Role:</span>
                    <span className="text-text-secondary font-medium">
                      {normalizedBlueprint.metadata.role}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Content with View Mode Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
        >
          {/* Interactive Blueprint Dashboard */}
          {normalizedBlueprint ? (
            <InteractiveBlueprintDashboard
              blueprint={normalizedBlueprint as any}
              isPublicView={false}
            />
          ) : (
            <div className="glass-card p-8 text-center">
              <ExternalLink className="text-text-disabled mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Blueprint Data Not Available
              </h3>
              <p className="text-text-secondary text-sm">
                The blueprint content could not be loaded. Please try refreshing the page.
              </p>
            </div>
          )}
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
      </div>
    </>
  );
}
