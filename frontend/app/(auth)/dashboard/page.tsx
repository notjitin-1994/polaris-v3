'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content goes here */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Learning Progress
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Track your learning journey and completed modules.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Active Blueprints
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your current learning blueprints and goals.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            View your latest learning activities and achievements.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
