import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSummaries,
  deleteSummary,
  getUserSummaryCount,
  getUserCreatedCount,
  CREATION_LIMIT,
  SAVED_LIMIT,
  type PolarisSummary,
} from '@/services/polarisSummaryService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AllSummaries() {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<PolarisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [summaryCount, setSummaryCount] = useState<number>(0);
  const [createdCount, setCreatedCount] = useState<number>(0);

  useDocumentTitle('Smartslate | Starmaps');

  useEffect(() => {
    loadSummaries();
  }, []);

  async function loadSummaries() {
    try {
      setLoading(true);
      setError(null);
      const [summariesResult, countResult, createdResult] = await Promise.all([
        getAllSummaries(),
        getUserSummaryCount(),
        getUserCreatedCount(),
      ]);

      if (summariesResult.error) {
        setError('Failed to load summaries');
        console.error('Error loading summaries:', summariesResult.error);
      } else {
        setSummaries(summariesResult.data || []);
      }

      if (!countResult.error && countResult.count !== null) setSummaryCount(countResult.count);
      if (!createdResult.error && createdResult.count !== null)
        setCreatedCount(createdResult.count);
    } catch (err) {
      setError('Failed to load summaries');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this summary?')) return;

    try {
      setDeletingId(id);
      const { error } = await deleteSummary(id);

      if (error) {
        alert('Failed to delete summary');
        console.error('Error deleting summary:', error);
      } else {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        setSummaryCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      alert('Failed to delete summary');
      console.error('Error:', err);
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function extractHighlights(markdown: string) {
    const lines = markdown.split('\n').slice(0, 5);
    return lines.join(' ').slice(0, 200) + '...';
  }

  return (
    <div className="page-enter px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Polaris Starmaps</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <svg
                    className="text-primary-300 h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                <span className="text-xs text-white/70">Created</span>
                <span className="text-xs font-semibold text-white/90">
                  {createdCount}/{CREATION_LIMIT}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <svg
                    className="text-secondary-300 h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 7h18" />
                    <path d="M6 7v10a2 2 0 002 2h8a2 2 0 002-2V7" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </span>
                <span className="text-xs text-white/70">Saved</span>
                <span className="text-xs font-semibold text-white/90">
                  {summaryCount}/{SAVED_LIMIT}
                </span>
              </div>
              {(summaryCount >= SAVED_LIMIT || createdCount >= CREATION_LIMIT) && (
                <button
                  type="button"
                  onClick={() => window.open('https://smartslate.io/upgrade', '_blank')}
                  className="text-xs text-amber-400 underline hover:text-amber-300"
                >
                  Upgrade for more
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-primary flex h-10 w-10 items-center justify-center p-0"
            disabled={summaryCount >= SAVED_LIMIT || createdCount >= CREATION_LIMIT}
            title={
              summaryCount >= SAVED_LIMIT
                ? 'Saved limit reached'
                : createdCount >= CREATION_LIMIT
                  ? 'Creation limit reached'
                  : 'Start a new discovery'
            }
            aria-label="New Discovery"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-white/60">
          View and manage all your Polaris discovery starmaps
        </p>
        {/* Dual-layer progress bar: creation underlay, saved overlay */}
        <div className="mt-3">
          <div
            className="relative h-2 overflow-hidden rounded-full bg-white/10"
            aria-label="Starmap usage"
          >
            {/* Creation progress underlay */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20"
              style={{
                width: `${Math.min(100, Math.round(((createdCount || 0) / Math.max(1, CREATION_LIMIT)) * 100))}%`,
              }}
              aria-hidden="true"
            />
            {/* Saved progress overlay */}
            <div
              className="from-primary-400 to-secondary-400 relative h-full rounded-full bg-gradient-to-r transition-all"
              style={{
                width: `${Math.min(100, Math.round((summaryCount / Math.max(1, SAVED_LIMIT)) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-1 flex items-center gap-3 text-[10px] text-white/50">
            <span className="inline-flex items-center gap-1">
              <span className="from-primary-400 to-secondary-400 inline-block h-1.5 w-3 rounded-full bg-gradient-to-r" />{' '}
              Saved
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-full bg-white/30" /> Created
            </span>
            <span className="ml-auto">
              Created {createdCount}/{CREATION_LIMIT}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading starmaps...</div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-400/80 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      ) : summaries.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-white/60">No starmaps yet</div>
          <p className="mt-2 text-sm text-white/40">
            Complete a Polaris discovery to see your starmaps here
          </p>
          <button type="button" onClick={() => navigate('/')} className="btn-primary mt-4">
            Start Discovery
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-[rgb(var(--bg))] p-4">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Your Starmaps</h2>
          <div className="space-y-3">
            {summaries.map((summary) => (
              <div key={summary.id} className="glass-card p-4 transition-all hover:bg-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white/90">
                      {summary.report_title || summary.company_name || 'Untitled Discovery'}
                    </h3>
                    <p className="mt-1 text-xs text-white/60">{formatDate(summary.created_at)}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-white/50">
                      {extractHighlights(summary.summary_content)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(summary.id)}
                    disabled={deletingId === summary.id}
                    className="p-1 text-white/40 transition-colors hover:text-red-400"
                    title="Delete starmap"
                  >
                    {deletingId === summary.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating create button for intuitive access */}
      <button
        type="button"
        aria-label="New Discovery"
        onClick={() => navigate('/')}
        disabled={summaryCount >= SAVED_LIMIT || createdCount >= CREATION_LIMIT}
        className={`from-primary-400 to-secondary-500 float-button fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r text-slate-900 shadow-xl hover:opacity-95 active:opacity-90 ${summaryCount >= SAVED_LIMIT || createdCount >= CREATION_LIMIT ? 'cursor-not-allowed opacity-60' : ''}`}
        title={
          summaryCount >= SAVED_LIMIT
            ? 'Saved limit reached'
            : createdCount >= CREATION_LIMIT
              ? 'Creation limit reached'
              : 'Start a new discovery'
        }
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
