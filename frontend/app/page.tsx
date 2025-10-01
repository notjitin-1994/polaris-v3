'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  ArrowRight,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenameDialog } from '@/components/ui/RenameDialog';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import { BlueprintRow } from '@/lib/db/blueprints';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { BlueprintCard } from '@/components/dashboard/BlueprintCard';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionnaireCompletion, setQuestionnaireCompletion] = useState<Record<string, boolean>>(
    {}
  );
  const [creating, setCreating] = useState(false);
  const [renamingBlueprint, setRenamingBlueprint] = useState<BlueprintRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const router = useRouter();

  const BLUEPRINTS_PER_PAGE = 4;
  const totalPages = Math.ceil(blueprints.length / BLUEPRINTS_PER_PAGE);
  const startIndex = (currentPage - 1) * BLUEPRINTS_PER_PAGE;
  const endIndex = startIndex + BLUEPRINTS_PER_PAGE;
  const paginatedBlueprints = blueprints.slice(startIndex, endIndex);

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
  }, [blueprints.length]);

  const handleCreateBlueprint = useCallback(async () => {
    if (!user?.id || creating) return;
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
  }, [user?.id, creating, router]);

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

      // Confirm deletion
      if (
        !confirm('Are you sure you want to delete this blueprint? This action cannot be undone.')
      ) {
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase
          .from('blueprint_generator')
          .delete()
          .eq('id', blueprintId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Delete error:', error);
          alert('Failed to delete blueprint. Please try again.');
          return;
        }

        // Remove from local state
        setBlueprints((prev) => prev.filter((bp) => bp.id !== blueprintId));
        console.log('Blueprint deleted successfully:', blueprintId);
      } catch (err) {
        console.error('Error deleting blueprint:', err);
        alert('Failed to delete blueprint. Please try again.');
      }
    },
    [user?.id]
  );

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
        await new Promise(resolve => setTimeout(resolve, 300));
        
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

  const dashboardTitle = (() => {
    const firstName = getFirstName();
    return user && firstName ? (
      <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        <span>Welcome, </span>
        <span className="text-primary">{firstName}</span>
        <span>.</span>
      </h1>
    ) : (
      <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        Welcome to SmartSlate.
      </h1>
    );
  })();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <StandardHeader
        title={dashboardTitle}
        subtitle="Your learning blueprint workspace — create, manage, and explore personalized learning paths."
        showDecorativeLine={true}
        sticky={false}
        user={user}
      />

      <div className="page-enter animate-fade-in-up animate-delay-75 relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <div className="animate-fade-in-up h-40 sm:h-44 md:h-48">
              <WorkspaceActionCard
                onClick={handleCreateBlueprint}
                label="Create Blueprint"
                description="Start a new personalized learning blueprint with our intelligent wizard."
                icon={Plus}
                disabled={creating}
              />
            </div>
            <div className="animate-fade-in-up animate-delay-75 h-40 sm:h-44 md:h-48">
              <Link href="#blueprints" className="h-full">
                <WorkspaceActionCard
                  label="My Blueprints"
                  description="View and manage all your learning blueprints in one place."
                  icon={BookOpen}
                />
              </Link>
            </div>
            <div className="animate-fade-in-up animate-delay-150 h-40 sm:h-44 md:h-48">
              <WorkspaceActionCard
                label="Analytics"
                description="Track your progress and gain insights from your learning journey."
                icon={BarChart3}
              />
            </div>
          </div>
        </section>

        {/* Blueprint List */}
        <section id="blueprints" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-white">Your Blueprints</h2>
            <Button
              onClick={handleCreateBlueprint}
              disabled={creating}
              className="btn-primary pressable"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{creating ? 'Creating…' : 'New Blueprint'}</span>
            </Button>
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
              <h3 className="font-heading mb-3 text-lg font-bold text-white">No blueprints yet</h3>
              <p className="mx-auto mb-8 max-w-md text-sm text-[rgb(176,197,198)]">
                Get started by creating your first personalized learning blueprint with our
                intelligent wizard.
              </p>
              <button
                onClick={handleCreateBlueprint}
                disabled={creating}
                className="btn-primary pressable elevate inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>{creating ? 'Creating…' : 'Create Your First Blueprint'}</span>
              </button>
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
      </div>
    </div>
  );
}

// Workspace Action Card Component
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
      className="group pressable elevate animate-fade-in-up relative block h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
    >
      <div className="interactive-spotlight" aria-hidden="true" />
      <div className="relative grid h-full grid-cols-[auto,1fr,auto] items-center gap-4 p-5 sm:p-6">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition-colors group-hover:text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="font-heading text-base font-bold text-white/95">{label}</div>
          {description && (
            <p className="mt-0.5 line-clamp-3 text-xs text-white/60">{description}</p>
          )}
        </div>
        <span className="translate-x-1 text-white/70 opacity-0 transition will-change-transform group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Component>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
