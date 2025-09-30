import { useState } from 'react';
import { getSupabase } from '@/services/supabase';
import {
  createGreetingReport,
  createOrgReport,
  createRequirementReport,
  startGreetingResearchAsync,
  startOrgResearchAsync,
  startRequirementResearchAsync,
  getCompleteReport,
  getReportWebhookStatus,
} from '@/services/polarisReportsService';
import type { ReportType } from '@/services/polarisReportsService';
import WebhookMonitor from '@/components/WebhookMonitor';

const supabase = getSupabase();

export default function ReportsDebug() {
  const [reportType, setReportType] = useState<ReportType>('greeting');
  const [summaryId, setSummaryId] = useState<string>('');
  const [reportId, setReportId] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [status, setStatus] = useState<string>('idle');
  const [output, setOutput] = useState<string>('');
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'debug' | 'monitor'>('debug');

  async function createReport() {
    setStatus('creating');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus('error:not-authenticated');
      return;
    }
    const userData =
      reportType === 'greeting'
        ? { name: 'Ada Lovelace', role: 'Engineer', department: 'R&D', email: 'ada@example.com' }
        : reportType === 'org'
          ? {
              orgName: 'Acme Corp',
              industry: 'Manufacturing',
              size: '200-500',
              headquarters: 'NYC',
            }
          : {
              objectives: 'Onboard new hires',
              constraints: 'Low budget',
              audience: 'Remote staff',
              timeline: 'Q4',
              budget: '$10k',
            };
    const createFn =
      reportType === 'greeting'
        ? createGreetingReport
        : reportType === 'org'
          ? createOrgReport
          : createRequirementReport;
    const { data, error } = await createFn(userData as any, null, {
      summaryId: summaryId || undefined,
    });
    if (error || !data) {
      setStatus('error:create');
      return;
    }
    setReportId(data.id);
    setStatus('created');
  }

  async function startResearch() {
    if (!reportId) return;
    setStatus('starting');
    let res;
    if (reportType === 'greeting') {
      res = await startGreetingResearchAsync(
        reportId,
        { name: 'Ada Lovelace', role: 'Engineer', department: 'R&D', email: 'ada@example.com' },
        summaryId || undefined
      );
    } else if (reportType === 'org') {
      res = await startOrgResearchAsync(
        reportId,
        { orgName: 'Acme Corp', industry: 'Manufacturing', size: '200-500', headquarters: 'NYC' },
        summaryId || undefined
      );
    } else {
      res = await startRequirementResearchAsync(
        reportId,
        {
          objectives: 'Onboard new hires',
          constraints: 'Low budget',
          audience: 'Remote staff',
          timeline: 'Q4',
          budget: '$10k',
        },
        summaryId || undefined
      );
    }
    if (res.error || !res.data) {
      setStatus('error:start');
      return;
    }
    setJobId(res.data.job_id);
    setStatus('queued');
  }

  async function checkLatest() {
    if (!summaryId) return;
    setStatus('checking');
    const { data } = await getCompleteReport(reportType, summaryId);
    if (data?.research_report) setOutput(data.research_report);
    setStatus(data?.research_status || 'unknown');
  }

  async function checkWebhookStatus() {
    if (!reportId) return;
    setStatus('checking-webhook');
    const { data, error } = await getReportWebhookStatus(reportType, reportId);
    if (error) {
      setStatus('webhook-error');
      setWebhookStatus({ error: error.message });
    } else {
      setWebhookStatus(data);
      setStatus('webhook-checked');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="mb-6 text-2xl">Reports & Webhook Management</h1>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'debug' as const, label: 'Debug Reports' },
            { id: 'monitor' as const, label: 'Webhook Monitor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'debug' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl">Reports Debug</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-20">Type</label>
                <select
                  className="rounded px-2 py-1 text-black"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                >
                  <option value="greeting">greeting</option>
                  <option value="org">org</option>
                  <option value="requirement">requirement</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20">summaryId</label>
                <input
                  className="flex-1 rounded px-2 py-1 text-black"
                  value={summaryId}
                  onChange={(e) => setSummaryId(e.target.value)}
                  placeholder="optional"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded bg-blue-600 px-3 py-2 hover:bg-blue-700"
                  onClick={createReport}
                >
                  Create report
                </button>
                <span className="text-sm">
                  reportId: <code className="rounded bg-gray-700 px-1">{reportId || '-'}</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded bg-amber-600 px-3 py-2 hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  onClick={startResearch}
                  disabled={!reportId}
                >
                  Start research
                </button>
                <span className="text-sm">
                  jobId: <code className="rounded bg-gray-700 px-1">{jobId || '-'}</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded bg-green-600 px-3 py-2 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  onClick={checkLatest}
                  disabled={!summaryId}
                >
                  Check latest
                </button>
                <button
                  className="rounded bg-purple-600 px-3 py-2 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  onClick={checkWebhookStatus}
                  disabled={!reportId}
                >
                  Check webhook
                </button>
                <span className="text-sm">
                  status: <code className="rounded bg-gray-700 px-1">{status}</code>
                </span>
              </div>
            </div>
          </div>

          {/* Webhook Status Display */}
          {webhookStatus && (
            <div className="rounded-lg bg-gray-800 p-6">
              <h3 className="mb-3 text-lg font-semibold">Webhook Status</h3>
              {webhookStatus.error ? (
                <div className="text-red-400">Error: {webhookStatus.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={`ml-2 rounded px-2 py-1 text-xs ${
                          webhookStatus.webhook_status === 'success'
                            ? 'bg-green-600'
                            : webhookStatus.webhook_status === 'failed'
                              ? 'bg-red-600'
                              : webhookStatus.webhook_status === 'retrying'
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                        }`}
                      >
                        {webhookStatus.webhook_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Attempts:</span>
                      <span className="ml-2">{webhookStatus.webhook_attempts || 0}</span>
                    </div>
                  </div>
                  {webhookStatus.webhook_last_attempt && (
                    <div>
                      <span className="text-gray-400">Last Attempt:</span>
                      <span className="ml-2">
                        {new Date(webhookStatus.webhook_last_attempt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {webhookStatus.webhook_response &&
                    Object.keys(webhookStatus.webhook_response).length > 0 && (
                      <div>
                        <span className="text-gray-400">Response:</span>
                        <pre className="mt-1 overflow-auto rounded bg-gray-700 p-2 text-xs">
                          {JSON.stringify(webhookStatus.webhook_response, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Research Report Output */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="mb-3 text-lg font-semibold">Latest research_report</h3>
            <pre className="max-h-96 overflow-auto rounded bg-gray-700 p-4 text-sm whitespace-pre-wrap">
              {output || '— No content —'}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'monitor' && (
        <div className="rounded-lg bg-gray-800">
          <WebhookMonitor />
        </div>
      )}
    </div>
  );
}
