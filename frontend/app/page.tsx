'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { blueprintService } from '@/lib/db/blueprints';
import { BlueprintRow } from '@/lib/db/blueprints';
import { DarkModeToggle } from '@/components/theme';

function DashboardContent() {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionnaireCompletion, setQuestionnaireCompletion] = useState<Record<string, boolean>>({});

  const checkQuestionnaireCompletion = useCallback(async (blueprintId: string) => {
    try {
      const isComplete = await blueprintService.isStaticQuestionnaireComplete(blueprintId);
      setQuestionnaireCompletion(prev => ({
        ...prev,
        [blueprintId]: isComplete
      }));
    } catch (error) {
      console.error('Error checking questionnaire completion:', error);
    }
  }, []);

  const loadBlueprints = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await blueprintService.getBlueprintsByUser(user.id);
      setBlueprints(data);
      
      // Check questionnaire completion for each draft blueprint
      const draftBlueprints = data.filter(bp => bp.status === 'draft');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
      case 'generating':
        return <AlertCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'generating':
        return 'Generating';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Learning Blueprint Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create and manage your learning blueprints
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <Link
                href="/static-wizard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Create New Blueprint
              </Link>
            </div>
          </div>
        </div>

        {/* Blueprint List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Your Blueprints
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blueprints.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No blueprints yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Get started by creating your first learning blueprint
              </p>
              <Link
                href="/static-wizard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Blueprint
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {blueprints.map((blueprint) => (
                <div
                  key={blueprint.id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(blueprint.status)}
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {getStatusText(blueprint.status)}
                        </span>
                        <span className="text-xs text-slate-400">v{blueprint.version}</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Blueprint #{blueprint.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Created {formatDate(blueprint.created_at)}
                      </p>
                      {blueprint.blueprint_markdown && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                          Generated blueprint available
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {blueprint.status === 'draft' && (
                        <>
                          {questionnaireCompletion[blueprint.id] ? (
                            <Link
                              href={`/loading/${blueprint.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Continue to Dynamic Questions →
                            </Link>
                          ) : (
                            <Link
                              href="/static-wizard"
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                            >
                              Complete Static Questions →
                            </Link>
                          )}
                        </>
                      )}
                      {blueprint.status === 'completed' && blueprint.blueprint_markdown && (
                        <Link
                          href={`/blueprint/${blueprint.id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Blueprint →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
