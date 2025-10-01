'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content goes here */}
        <div className="bg-paper rounded-lg border border-neutral-200 p-6">
          <h3 className="text-foreground mb-2 text-lg font-semibold">Learning Progress</h3>
          <p className="text-text-secondary">Track your learning journey and completed modules.</p>
        </div>

        <div className="bg-paper rounded-lg border border-neutral-200 p-6">
          <h3 className="text-foreground mb-2 text-lg font-semibold">Active Blueprints</h3>
          <p className="text-text-secondary">Manage your current learning blueprints and goals.</p>
        </div>

        <div className="bg-paper rounded-lg border border-neutral-200 p-6">
          <h3 className="text-foreground mb-2 text-lg font-semibold">Recent Activity</h3>
          <p className="text-text-secondary">
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
