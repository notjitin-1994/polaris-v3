import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getStarmapJob, type StarmapJob } from '@/services/starmapJobsService';
import EnhancedReportDisplay from '@/components/EnhancedReportDisplay';
import { updateStarmapJobTitle } from '@/services/starmapJobsService';

export default function StarmapJobViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<StarmapJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await getStarmapJob(id);
        if (error) throw error;
        if (mounted) setJob(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load starmap');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg))]">
        <div className="text-center">
          <div className="border-primary-400 mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-white/80">Loading starmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-red-500/30 bg-red-500/15 p-4 text-red-100">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-white/60">Starmap not found.</div>
      </div>
    );
  }

  const markdown = job.final_report || job.preliminary_report || '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {markdown ? (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="p-4 md:p-8">
            <EnhancedReportDisplay
              reportMarkdown={markdown}
              reportTitle={job.title || 'Needs Analysis Report'}
              showGeneratedDate={false}
              editableTitle
              onSaveTitle={async (newTitle: string) => {
                const trimmed = newTitle.trim();
                if (!trimmed || !job) return;
                const { error } = await updateStarmapJobTitle(job.id, trimmed);
                if (!error) setJob({ ...job, title: trimmed });
              }}
              prelimReport={job.preliminary_report || undefined}
              summaryId={job.legacy_summary_id}
              starmapJobId={job.id}
            />
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-white/60">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No report data available for this starmap yet.</p>
        </div>
      )}
    </div>
  );
}
