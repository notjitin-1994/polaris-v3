'use client';

import React, { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenameDialog } from '@/components/ui/RenameDialog';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import { BlueprintRow } from '@/lib/db/blueprints';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { Footer } from '@/components/layout/Footer';
import { BlueprintCard } from '@/components/dashboard/BlueprintCard';
import { BlueprintFilters } from '@/components/dashboard/BlueprintFilters';
import { BlueprintUsageDisplay } from '@/components/dashboard/BlueprintUsageDisplay';
import { BlueprintUsageService } from '@/lib/services/blueprintUsageService';
import { useBlueprintLimits } from '@/lib/hooks/useBlueprintLimits';
import { UpgradePromptModal } from '@/components/modals/UpgradePromptModal';
import { cn } from '@/lib/utils';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const { user, signOut: _signOut } = useAuth();
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [filteredBlueprints, setFilteredBlueprints] = useState<BlueprintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionnaireCompletion, setQuestionnaireCompletion] = useState<Record<string, boolean>>(
    {}
  );
  const [creating, setCreating] = useState(false);
  const [renamingBlueprint, setRenamingBlueprint] = useState<BlueprintRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBlueprints, setSelectedBlueprints] = useState<Set<string>>(new Set());
  const [deletionDialog, setDeletionDialog] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    blueprintId?: string;
    blueprintName?: string;
  }>({ isOpen: false, type: 'single' });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { canCreate, isAtCreationLimit } = useBlueprintLimits();

  const BLUEPRINTS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredBlueprints.length / BLUEPRINTS_PER_PAGE);
  const startIndex = (currentPage - 1) * BLUEPRINTS_PER_PAGE;
  const endIndex = startIndex + BLUEPRINTS_PER_PAGE;
  const paginatedBlueprints = filteredBlueprints.slice(startIndex, endIndex);

  const checkQuestionnaireCompletion = useCallback(async (blueprintId: string) => {
    try {
      const isComplete =
        await createBrowserBlueprintService().isStaticQuestionnaireComplete(blueprintId);
      setQuestionnaireCompletion((prev) => ({
        ...prev,
        [blueprintId]: isComplete,
      }));
    } catch (error) {
      console.error('Error checking questionnaire completion:', error);
    }
  }, []);

  const loadBlueprints = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await createBrowserBlueprintService().getBlueprintsByUser(user.id);
      setBlueprints(data);

      // Check questionnaire completion for each draft blueprint
      const draftBlueprints = data.filter((bp) => bp.status === 'draft');
      for (const blueprint of draftBlueprints) {
        await checkQuestionnaireCompletion(blueprint.id);
      }
    } catch (error) {
      console.error('Error loading blueprints:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, checkQuestionnaireCompletion]);

  useEffect(() => {
    if (user?.id) {
      loadBlueprints();
    }
  }, [user?.id, loadBlueprints]);

  // Reset to page 1 when blueprints change
  useEffect(() => {
    setCurrentPage(1);
    setFilteredBlueprints(blueprints);
  }, [blueprints]);

  const handleCreateBlueprint = useCallback(async () => {
    if (!user?.id || creating) return;

    // Check if at limit - show upgrade modal immediately
    if (isAtCreationLimit) {
      setShowUpgradePrompt(true);
      return;
    }

    setCreating(true);
    const supabase = getSupabaseBrowserClient();

    // Double-check authentication status
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser?.id) {
      console.error('User not authenticated when creating blueprint');
      alert('You must be logged in to create a blueprint. Please refresh the page and try again.');
      setCreating(false);
      return;
    }

    console.log('Authenticated user ID:', currentUser.id);

    // Check blueprint creation limits
    try {
      const supabase = getSupabaseBrowserClient();
      const canCreate = await BlueprintUsageService.canCreateBlueprint(supabase, currentUser.id);
      console.log('Creation check result:', canCreate);

      if (!canCreate.canCreate) {
        alert(canCreate.reason || 'You cannot create more blueprints at this time.');
        setCreating(false);
        return;
      }
    } catch (error) {
      console.error('Error checking blueprint creation limits:', error);
      // Continue with creation if we can't check limits (fallback behavior)
    }

    try {
      // Compute a default index for naming based on user's existing blueprints count
      const { count, error: countError } = await supabase
        .from('blueprint_generator')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }

      const nextIndex = (count ?? 0) + 1;

      // Always create a fresh draft with V2 schema
      const blueprintData = {
        user_id: currentUser.id,
        status: 'draft' as const,
        static_answers: {}, // Empty object - form will populate with defaultValues
        questionnaire_version: 2, // V2 schema
        completed_steps: [], // No steps completed yet
        title: `New Blueprint (${nextIndex})`,
      };

      console.log('[Dashboard] Creating new blueprint:', blueprintData);

      const { data, error } = await supabase
        .from('blueprint_generator')
        .insert(blueprintData)
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        alert(`Failed to create blueprint: ${error.message || 'Unknown error'}. Please try again.`);
        setCreating(false);
        return;
      }

      const draftId = data.id as string;
      console.log('[Dashboard] Blueprint created successfully with ID:', draftId);
      console.log('[Dashboard] New blueprint data:', {
        id: data.id,
        status: data.status,
        questionnaire_version: data.questionnaire_version,
        has_static_answers: !!data.static_answers,
      });

      // Increment blueprint creation count
      try {
        const incrementResult = await BlueprintUsageService.incrementCreationCount(
          supabase,
          currentUser.id
        );
        console.log('Blueprint creation count increment result:', incrementResult);
        console.log('Current user ID for increment:', currentUser.id);

        // Trigger refresh of usage display
        if (typeof window !== 'undefined') {
          localStorage.setItem('blueprint_operation_completed', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
          console.log('Triggered storage event for usage display refresh');
        }
      } catch (error) {
        console.error('Error incrementing blueprint creation count:', error);
        // Don't fail the creation if counting fails
      }

      // Navigate to the static wizard with this blueprint ID
      // Form will load with empty fields and start saving to this blueprint
      router.push(`/static-wizard?bid=${draftId}`);
    } catch (err) {
      console.error('Error creating blueprint:', err);
      alert('Failed to create blueprint. Please check your connection and try again.');
      // Fall back to navigating; autosave will attempt creation
      router.push('/static-wizard');
    } finally {
      setCreating(false);
    }
  }, [user?.id, creating, router, isAtCreationLimit]);

  const handleRenameBlueprint = useCallback(
    async (newTitle: string) => {
      if (!user?.id || !renamingBlueprint) {
        console.error('Authentication check failed:', {
          userId: user?.id,
          hasBlueprint: !!renamingBlueprint,
        });
        throw new Error('User not authenticated or no blueprint selected');
      }

      console.log('Starting blueprint rename:', {
        blueprintId: renamingBlueprint.id,
        currentTitle: renamingBlueprint.title,
        newTitle,
        userId: user.id,
      });

      try {
        const updatedBlueprint = await createBrowserBlueprintService().updateBlueprintTitle(
          renamingBlueprint.id,
          newTitle,
          user.id
        );

        // Update local state to reflect the change immediately
        setBlueprints((prev) =>
          prev.map((bp) =>
            bp.id === renamingBlueprint.id
              ? { ...bp, title: updatedBlueprint.title || newTitle.trim() }
              : bp
          )
        );

        console.log('Blueprint renamed successfully:', { id: renamingBlueprint.id, newTitle });
      } catch (error) {
        console.error('Error renaming blueprint:', error);
        // Update local state anyway to provide better UX
        setBlueprints((prev) =>
          prev.map((bp) =>
            bp.id === renamingBlueprint.id ? { ...bp, title: newTitle.trim() } : bp
          )
        );

        // Don't re-throw the error since we're handling it gracefully
        console.warn('Blueprint rename failed, but local state updated for better UX');
      }
    },
    [user?.id, renamingBlueprint]
  );

  const handleDeleteBlueprint = useCallback(
    async (blueprintId: string) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      const blueprint = blueprints.find((bp) => bp.id === blueprintId);
      if (!blueprint) {
        console.error('Blueprint not found');
        return;
      }

      // Open confirmation dialog
      setDeletionDialog({
        isOpen: true,
        type: 'single',
        blueprintId,
        blueprintName: blueprint.title || `Blueprint #${blueprintId.slice(0, 8)}`,
      });
    },
    [user?.id, blueprints]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    const { type, blueprintId } = deletionDialog;
    let blueprintIdsToDelete: string[] = [];

    if (type === 'single' && blueprintId) {
      blueprintIdsToDelete = [blueprintId];
    } else if (type === 'bulk') {
      blueprintIdsToDelete = Array.from(selectedBlueprints);
    }

    if (blueprintIdsToDelete.length === 0) {
      return;
    }

    try {
      console.log('[handleConfirmDelete] Starting deletion for blueprints:', blueprintIdsToDelete);

      // Soft delete blueprints using the API endpoint
      const deletePromises = blueprintIdsToDelete.map(async (id) => {
        console.log(`[handleConfirmDelete] Deleting blueprint ${id}`);

        const response = await fetch(`/api/blueprints/${id}`, {
          method: 'DELETE',
        });

        console.log(`[handleConfirmDelete] Response for ${id}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          const data = await response.json();
          console.error(`[handleConfirmDelete] Error response for ${id}:`, data);
          throw new Error(data.error || 'Failed to delete blueprint');
        }

        const result = await response.json();
        console.log(`[handleConfirmDelete] Success response for ${id}:`, result);
        return result;
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      console.log('[handleConfirmDelete] All deletions completed successfully');

      // Remove from local state (soft-deleted blueprints won't show in future queries)
      setBlueprints((prev) => prev.filter((bp) => !blueprintIdsToDelete.includes(bp.id)));

      // Clear selection if in bulk mode
      if (type === 'bulk') {
        setSelectedBlueprints(new Set());
        setIsSelectionMode(false);
      }

      console.log('Blueprint(s) soft-deleted successfully:', blueprintIdsToDelete);
    } catch (err) {
      console.error('[handleConfirmDelete] Error deleting blueprint(s):', err);
      console.error('[handleConfirmDelete] Error stack:', (err as Error).stack);
      alert(`Failed to delete blueprint(s): ${(err as Error).message}. Please try again.`);
    }
  }, [user?.id, deletionDialog, selectedBlueprints]);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedBlueprints(new Set());
  }, []);

  const handleSelectBlueprint = useCallback((blueprintId: string) => {
    setSelectedBlueprints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blueprintId)) {
        newSet.delete(blueprintId);
      } else {
        newSet.add(blueprintId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBlueprints.size === filteredBlueprints.length) {
      setSelectedBlueprints(new Set());
    } else {
      setSelectedBlueprints(new Set(filteredBlueprints.map((bp) => bp.id)));
    }
  }, [filteredBlueprints, selectedBlueprints.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!user?.id || selectedBlueprints.size === 0) {
      return;
    }

    // Open confirmation dialog for bulk deletion
    setDeletionDialog({
      isOpen: true,
      type: 'bulk',
    });
  }, [user?.id, selectedBlueprints]);

  const [resumingBlueprintId, setResumingBlueprintId] = useState<string | null>(null);

  const handleResumeBlueprint = useCallback(
    async (blueprintId: string) => {
      if (resumingBlueprintId) {
        // Prevent multiple simultaneous resume actions
        return;
      }

      try {
        setResumingBlueprintId(blueprintId);
        console.log('[Dashboard] Resuming blueprint:', blueprintId);

        const svc = createBrowserBlueprintService();
        const path = await svc.getNextRouteForBlueprint(blueprintId);

        console.log('[Dashboard] Determined next route:', path);

        // Add slight delay for better UX (shows loading state)
        await new Promise((resolve) => setTimeout(resolve, 300));

        router.push(path);
      } catch (error) {
        console.error('[Dashboard] Error determining next route:', error);
        setResumingBlueprintId(null);

        // Show user-friendly error
        alert(
          'Unable to resume blueprint. Starting from the beginning. ' +
            'Your previous progress has been saved.'
        );

        // Fallback to static wizard as safest option
        router.push(`/static-wizard?bid=${blueprintId}`);
      }
    },
    [router, resumingBlueprintId]
  );

  const getFirstName = () => {
    const rawName =
      (user?.user_metadata?.first_name as string) ||
      (user?.user_metadata?.name as string) ||
      (user?.user_metadata?.full_name as string) ||
      (user?.email as string) ||
      '';
    return rawName.toString().trim().split(' ')[0];
  };

  const handleUpgradeClick = () => {
    router.push('/pricing');
  };

  const handleUpgradeCancel = () => {
    setShowUpgradePrompt(false);
  };

  const dashboardTitle = 'My Starmaps';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <StandardHeader
        title={dashboardTitle}
        showDecorativeLine={false}
        sticky={false}
        showDarkModeToggle={false}
        showUserAvatar={false}
        size="compact"
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="max-w-6xl text-left">
              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-8"
              >
                <h1 className="font-heading lg:text-10xl text-7xl font-bold tracking-tight text-white sm:text-8xl md:text-9xl">
                  <span>Welcome back, </span>
                  <span className="text-primary">{getFirstName()}</span>
                  <span className="text-white/80">.</span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-12"
              >
                <p className="text-xl leading-relaxed text-white/70 sm:text-2xl lg:text-3xl">
                  Your mission control — <span className="text-primary font-medium">chart</span>{' '}
                  learning starmaps, <span className="text-primary font-medium">orchestrate</span>{' '}
                  your constellations,
                  <br />
                  and <span className="text-primary font-medium">discover</span> insights that
                  illuminate your training universe.
                </p>
              </motion.div>

              {/* Decorative Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-16 h-px w-24"
                style={{
                  background: 'linear-gradient(to right, transparent, #a7dadb, transparent)',
                }}
              />
            </div>
          </div>
        </section>

        <div className="page-enter animate-fade-in-up animate-delay-75 relative z-10 mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 lg:px-8">
          {/* Blueprint List */}
          <section id="blueprints" className="mb-16 space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Left side - Blueprint list */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <h2 className="font-heading text-xl font-bold text-white">Your Blueprints</h2>
                    <BlueprintUsageDisplay />
                  </div>
                  <div className="flex items-center gap-3">
                    <BlueprintFilters
                      blueprints={blueprints}
                      onFilteredBlueprintsChange={setFilteredBlueprints}
                      variant="header"
                    />

                    {/* Selection mode buttons */}
                    {isSelectionMode ? (
                      <>
                        <motion.button
                          onClick={handleSelectAll}
                          className="btn-secondary pressable flex min-w-[140px] items-center gap-2 rounded-xl px-5 py-2.5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckSquare className="h-4 w-4" />
                          <span>
                            {selectedBlueprints.size === filteredBlueprints.length
                              ? 'Deselect All'
                              : 'Select All'}
                          </span>
                        </motion.button>

                        {selectedBlueprints.size > 0 && (
                          <motion.button
                            onClick={handleBulkDelete}
                            className="btn-secondary pressable bg-error/10 text-error hover:bg-error/20 border-error/30 flex items-center gap-2 rounded-xl px-5 py-2.5"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete ({selectedBlueprints.size})</span>
                          </motion.button>
                        )}

                        <motion.button
                          onClick={handleToggleSelectionMode}
                          className="btn-secondary pressable flex min-w-[140px] items-center gap-2 rounded-xl px-5 py-2.5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>Cancel</span>
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={handleToggleSelectionMode}
                        className="btn-secondary pressable flex min-w-[140px] items-center gap-2 rounded-xl px-5 py-2.5"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span>Select & Delete</span>
                      </motion.button>
                    )}

                    <Button
                      onClick={handleCreateBlueprint}
                      disabled={creating || isAtCreationLimit}
                      className={cn(
                        'btn-primary pressable',
                        isAtCreationLimit && 'cursor-not-allowed opacity-50'
                      )}
                      title={
                        isAtCreationLimit
                          ? "You've reached your limit. Click to upgrade."
                          : undefined
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {creating
                          ? 'Creating…'
                          : isAtCreationLimit
                            ? 'Limit Reached'
                            : 'New Blueprint'}
                      </span>
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="glass-card animate-fade-in-up p-6"
                        style={{ animationDelay: `${i * 75}ms` }}
                      >
                        <div className="space-y-3">
                          <div className="skeleton-brand h-5 w-1/3 rounded"></div>
                          <div className="skeleton-brand h-4 w-1/2 rounded"></div>
                          <div className="skeleton-brand h-4 w-2/3 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : blueprints.length === 0 ? (
                  <div className="glass-card animate-fade-in-up p-12 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <FileText className="h-8 w-8 text-white/60" />
                    </div>
                    <h3 className="font-heading mb-3 text-lg font-bold text-white">
                      No blueprints yet
                    </h3>
                    <p className="mx-auto mb-8 max-w-md text-sm text-[rgb(176,197,198)]">
                      Get started by creating your first personalized learning blueprint with our
                      intelligent wizard.
                    </p>
                    <Button
                      onClick={handleCreateBlueprint}
                      disabled={creating || isAtCreationLimit}
                      className={cn(
                        'btn-primary pressable',
                        isAtCreationLimit && 'cursor-not-allowed opacity-50'
                      )}
                      title={
                        isAtCreationLimit
                          ? "You've reached your limit. Click to upgrade."
                          : undefined
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {creating
                          ? 'Creating…'
                          : isAtCreationLimit
                            ? 'Limit Reached - Upgrade'
                            : 'Create Your First Blueprint'}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {paginatedBlueprints.map((blueprint, idx) => (
                        <BlueprintCard
                          key={blueprint.id}
                          blueprint={blueprint}
                          index={idx}
                          onRename={(bp) => {
                            console.log('Rename button clicked for blueprint:', bp.id);
                            setRenamingBlueprint(bp);
                          }}
                          onResume={handleResumeBlueprint}
                          onDelete={handleDeleteBlueprint}
                          questionnaireComplete={!!questionnaireCompletion[blueprint.id]}
                          isResuming={resumingBlueprintId === blueprint.id}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedBlueprints.has(blueprint.id)}
                          onSelect={handleSelectBlueprint}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-6">
                        {/* Previous Button */}
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="pressable flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page Numbers (max 3 visible) */}
                        <div className="flex items-center gap-1">
                          {(() => {
                            const maxVisible = 3;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            const endPage = Math.min(totalPages, startPage + maxVisible - 1);

                            if (endPage - startPage + 1 < maxVisible) {
                              startPage = Math.max(1, endPage - maxVisible + 1);
                            }

                            return Array.from(
                              { length: endPage - startPage + 1 },
                              (_, i) => startPage + i
                            ).map((pageNum) => (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`pressable h-10 w-10 rounded-lg text-sm font-medium transition ${
                                  currentPage === pageNum
                                    ? 'bg-secondary text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                              >
                                {pageNum}
                              </button>
                            ));
                          })()}
                        </div>

                        {/* Page Input */}
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const targetPage = parseInt(pageInput, 10);
                              if (!isNaN(targetPage)) {
                                if (targetPage >= 1 && targetPage <= totalPages) {
                                  setCurrentPage(targetPage);
                                } else {
                                  setCurrentPage(totalPages);
                                }
                                setPageInput('');
                              }
                            }
                          }}
                          onBlur={() => {
                            const targetPage = parseInt(pageInput, 10);
                            if (!isNaN(targetPage)) {
                              if (targetPage >= 1 && targetPage <= totalPages) {
                                setCurrentPage(targetPage);
                              } else if (targetPage > totalPages) {
                                setCurrentPage(totalPages);
                              }
                              setPageInput('');
                            } else if (pageInput) {
                              setPageInput('');
                            }
                          }}
                          placeholder={`${currentPage}`}
                          className="focus:border-primary focus:ring-primary/50 h-10 w-16 rounded-lg border border-white/10 bg-white/5 px-3 text-center text-sm font-medium text-white placeholder:text-white/40 focus:ring-2 focus:outline-none"
                          aria-label="Go to page number"
                        />

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="pressable flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Rename Dialog */}
          <RenameDialog
            isOpen={!!renamingBlueprint}
            onClose={() => setRenamingBlueprint(null)}
            onConfirm={handleRenameBlueprint}
            currentName={
              renamingBlueprint?.title || `Blueprint #${renamingBlueprint?.id.slice(0, 8)}`
            }
            title="Rename Blueprint"
            description="Enter a new name for your blueprint"
            placeholder="Starmap for Professional Development and Career Growth Path"
            maxLength={80}
          />

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={deletionDialog.isOpen}
            onClose={() => setDeletionDialog({ isOpen: false, type: 'single' })}
            onConfirm={handleConfirmDelete}
            title="Confirm Deletion"
            description="This action cannot be undone."
            variant="destructive"
            itemName="blueprint"
            itemCount={deletionDialog.type === 'bulk' ? selectedBlueprints.size : 1}
          />

          {/* Upgrade Prompt Modal */}
          <UpgradePromptModal
            isOpen={showUpgradePrompt}
            onClose={handleUpgradeCancel}
            onUpgrade={handleUpgradeClick}
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
}

// Workspace Action Card Component - Commented out as unused
/*
interface WorkspaceActionCardProps {
  onClick?: () => void;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

function WorkspaceActionCard({
  onClick,
  label,
  description,
  icon: Icon,
  disabled = false,
}: WorkspaceActionCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--x', `${x}px`);
    target.style.setProperty('--y', `${y}px`);
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      className="group pressable elevate animate-fade-in-up focus-visible:ring-primary relative block h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
    >
      <div className="interactive-spotlight" aria-hidden="true" />
      <div className="relative grid h-full grid-cols-[auto,1fr,auto] items-center gap-4 p-5 sm:p-6">
        <span className="group-hover:text-primary inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition-colors">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="font-heading text-base font-bold text-white/95">{label}</div>
          {description && (
            <p className="mt-0.5 line-clamp-3 text-xs text-white/60">{description}</p>
          )}
        </div>
        <span className="group-hover:text-primary translate-x-1 text-white/70 opacity-0 transition will-change-transform group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Component>
  );
}
*/

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
      <Footer />
    </ProtectedRoute>
  );
}
