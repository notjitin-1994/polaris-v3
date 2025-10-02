import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserJobs,
  deleteJob,
  getJobStats,
  type PolarisJob,
  type PolarisJobStatus,
} from '@/services/polarisJobsService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: PolarisJob;
  onDelete: (jobId: string) => void;
  onResume: (jobId: string) => void;
  onView: (jobId: string) => void;
}

function JobCard({ job, onDelete, onResume, onView }: JobCardProps) {
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      greeting: 'Initial Information',
      organization: 'Organization Details',
      requirements: 'Project Requirements',
      preliminary: 'Preliminary Report',
      dynamic_questions: 'Dynamic Questionnaire',
      final_report: 'Final Report',
      completed: 'Completed',
    };
    return labels[stage] || stage;
  };

  const getStatusColor = (status: PolarisJobStatus) => {
    const colors: Record<PolarisJobStatus, string> = {
      draft: 'text-white/70',
      processing: 'text-primary-500',
      paused: 'text-yellow-400',
      completed: 'text-green-400',
      failed: 'text-red-400',
      cancelled: 'text-white/50',
    };
    return colors[status] || 'text-white/70';
  };

  const getProgressPercentage = () => {
    const stages = [
      'greeting',
      'organization',
      'requirements',
      'preliminary',
      'dynamic_questions',
      'final_report',
    ];
    const currentIndex = stages.indexOf(job.current_stage);
    if (currentIndex === -1) return 100;
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  };

  return (
    <div className="glass-card p-6 transition-transform hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {job.title || job.company_name || 'Untitled Starmap'}
          </h3>
          <p className="mt-1 text-sm text-white/60">
            Created {formatDistanceToNow(new Date(job.created_at))} ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium capitalize ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
          {job.edits_remaining > 0 && (
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/85">
              {job.edits_remaining} edits left
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-white/70">
          <span>{getStageLabel(job.current_stage)}</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="from-primary-500 to-secondary-500 bar-smooth h-2 rounded-full bg-gradient-to-r transition-all"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Stages completed */}
      <div className="mb-4">
        <p className="text-sm text-white/70">Completed stages: {job.stages_completed.length} / 6</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {job.stages_completed.map((stage) => (
            <span
              key={stage}
              className="rounded border border-green-500/30 bg-green-500/15 px-2 py-1 text-xs text-green-100"
            >
              {getStageLabel(stage)}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {job.status === 'paused' && (
          <button
            onClick={() => onResume(job.id)}
            className="bg-secondary-500 hover:bg-secondary-400 flex-1 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            Resume
          </button>
        )}
        {job.status === 'completed' ? (
          <button onClick={() => onView(job.id)} className="btn-primary flex-1 text-sm">
            View Reports
          </button>
        ) : job.status === 'draft' || job.status === 'processing' ? (
          <button onClick={() => onView(job.id)} className="btn-primary flex-1 text-sm">
            Review and continue
          </button>
        ) : null}
        <button
          onClick={() => {
            if (
              confirm('Are you sure you want to delete this starmap? This action cannot be undone.')
            ) {
              onDelete(job.id);
            }
          }}
          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function PolarisJobsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PolarisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    inProgress: number;
    paused: number;
    averageEditsUsed: number;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<PolarisJobStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [filterStatus]);

  async function loadJobs() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await getUserJobs(
        50,
        filterStatus === 'all' ? undefined : filterStatus
      );

      if (error) {
        setError('Failed to load your starmaps');
        console.error('Error loading jobs:', error);
        return;
      }

      setJobs(data);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data } = await getJobStats();
      if (data) setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  async function handleDelete(jobId: string) {
    try {
      const { error } = await deleteJob(jobId);
      if (error) {
        alert('Failed to delete starmap');
        return;
      }

      // Reload jobs
      await loadJobs();
      await loadStats();
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete starmap');
    }
  }

  function handleResume(jobId: string) {
    navigate(`/polaris/job/${jobId}/resume`);
  }

  function handleView(jobId: string) {
    navigate(`/polaris/job/${jobId}`);
  }

  function handleCreateNew() {
    navigate('/polaris/new');
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-accent text-3xl font-bold text-white">Your Polaris Starmaps</h1>
          <p className="mt-2 text-white/70">Manage your L&D starmap generation jobs</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="glass-card p-4">
              <p className="text-sm text-white/70">Total Starmaps</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-white/70">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-white/70">In Progress</p>
              <p className="text-primary-500 text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-white/70">Paused</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.paused}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-white/70">Avg Edits Used</p>
              <p className="text-secondary-500 text-2xl font-bold">
                {stats.averageEditsUsed.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-secondary-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-secondary-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilterStatus('paused')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filterStatus === 'paused'
                  ? 'bg-secondary-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-secondary-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Completed
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center gap-2 rounded-lg px-6 py-2 font-medium"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Starmap
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/15 p-4 text-red-100">
            {error}
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-primary-400 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-white">
              {filterStatus === 'all' ? 'No starmaps yet' : `No ${filterStatus} starmaps`}
            </h3>
            <p className="mb-6 text-white/70">Create your first Polaris starmap to get started</p>
            <button onClick={handleCreateNew} className="btn-primary px-6 py-3 font-medium">
              Create Your First Starmap
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={handleDelete}
                onResume={handleResume}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
