'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Share2, Pencil, ArrowLeft, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { BlueprintRenderer } from '@/components/blueprint/BlueprintRenderer';
import { RenameDialog } from '@/components/ui/RenameDialog';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createBrowserBlueprintService } from '@/lib/db/blueprints.client';
import SwirlBackground from '@/components/SwirlBackground';
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
  const router = useRouter();
  const [blueprintId, setBlueprintId] = useState<string>('');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [renamingBlueprint, setRenamingBlueprint] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

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
    } catch (err) {
      console.error('Error saving markdown:', err);
      throw err;
    }
  };

  const handleStartEditing = () => {
    // Switch to markdown tab and enable edit mode
    setIsEditingMarkdown(true);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#020C1B] p-4 text-[rgb(224,224,224)]">
        <div className="glass-card max-w-md p-8 text-center">
          <div className="skeleton-brand mx-auto mb-4 h-8 w-48 rounded" />
          <div className="skeleton-brand mx-auto h-4 w-32 rounded" />
        </div>
      </main>
    );
  }

  if (error || !user || !data) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#020C1B] p-4 text-[rgb(224,224,224)]">
        <div className="glass-card max-w-md p-8 text-center">
          <p className="mb-4 text-[rgb(176,197,198)]">
            {!user
              ? 'Please sign in to view the blueprint.'
              : 'Blueprint not found or access denied.'}
          </p>
          <Link
            className="inline-flex items-center gap-2 text-[#a7dadb] transition-colors hover:text-[#d0edf0]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{!user ? 'Go to dashboard' : 'Back to dashboard'}</span>
          </Link>
        </div>
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

  // Title content
  const titleContent = (
    <h1 className="font-heading line-clamp-1 text-xs font-bold text-white sm:text-sm">
      {blueprintTitle}
    </h1>
  );

  // Right side action buttons (edit, share, download)
  const rightActions = (
    <>
      <button
        type="button"
        className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        onClick={handleStartEditing}
        title="Edit blueprint markdown"
        aria-label="Edit blueprint markdown"
      >
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        title="Share blueprint"
        aria-label="Share blueprint"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-white transition hover:bg-[#3730A3]"
        title="Download blueprint"
        aria-label="Download blueprint"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <StandardHeader
        title={titleContent}
        subtitle={`Created ${createdDate}`}
        backHref="/"
        backLabel="Back to dashboard"
        rightActions={rightActions}
        size="compact"
        showDarkModeToggle={false}
        showUserAvatar={false}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="glass-card animate-fade-in-up p-6 sm:p-8 lg:p-12">
          <BlueprintRenderer
            markdown={markdown}
            blueprint={blueprintData}
            isEditMode={isEditingMarkdown}
            onSaveMarkdown={handleSaveMarkdown}
            onCancelEdit={() => setIsEditingMarkdown(false)}
          />
        </div>
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renamingBlueprint}
        onClose={() => setRenamingBlueprint(false)}
        onConfirm={handleRenameBlueprint}
        currentName={blueprintTitle}
        title="Rename Blueprint"
        description="Enter a new name for your blueprint"
        placeholder="Starmap for Professional Development and Career Growth Path"
        maxLength={80}
      />
    </main>
  );
}
