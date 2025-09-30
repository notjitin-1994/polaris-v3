import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { SwirlBackground } from '@/components/layout/SwirlBackground';
import { BlueprintRenderer } from '@/components/blueprint/BlueprintRenderer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BlueprintPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#020C1B] p-4 text-[rgb(224,224,224)]">
        <div className="glass-card max-w-md p-8 text-center">
          <p className="mb-4 text-[rgb(176,197,198)]">Please sign in to view the blueprint.</p>
          <Link
            className="inline-flex items-center gap-2 text-[#a7dadb] transition-colors hover:text-[#d0edf0]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to dashboard</span>
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from('blueprint_generator')
    .select('id, user_id, blueprint_markdown, blueprint_json, title, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

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

  if (error || !data) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#020C1B] p-4 text-[rgb(224,224,224)]">
        <div className="glass-card max-w-md p-8 text-center">
          <p className="mb-4 text-[rgb(176,197,198)]">Blueprint not found or access denied.</p>
          <Link
            className="inline-flex items-center gap-2 text-[#a7dadb] transition-colors hover:text-[#d0edf0]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to dashboard</span>
          </Link>
        </div>
      </main>
    );
  }

  const markdown = data.blueprint_markdown ?? '# Blueprint\n\nNo markdown available.';
  const blueprintTitle = data.title ?? 'Generated Blueprint';
  const createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <div className="relative sticky top-0 z-10 overflow-hidden border-b border-white/10 bg-[rgb(2,12,27)]/80 backdrop-blur-xl">
        {/* Header swirls */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <SwirlBackground
            count={10}
            minSize={36}
            maxSize={68}
            opacityMin={0.02}
            opacityMax={0.06}
          />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="pressable inline-flex items-center gap-2 text-[rgb(176,197,198)] transition-colors hover:text-[#a7dadb]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-white/10" aria-hidden="true" />
              <div>
                <h1 className="font-heading max-w-md truncate text-lg font-bold text-white sm:text-xl">
                  {blueprintTitle}
                </h1>
                <p className="text-xs text-white/50">Created {createdDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="pressable inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Share blueprint"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                type="button"
                className="pressable inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3730A3]"
                title="Download blueprint"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="glass-card animate-fade-in-up p-6 sm:p-8 lg:p-12">
          <BlueprintRenderer markdown={markdown} blueprint={blueprintData} />
        </div>
      </div>
    </main>
  );
}
