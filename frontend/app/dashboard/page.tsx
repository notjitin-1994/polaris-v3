'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DashboardLayout,
  KPICards,
  TimelineChart,
  ModuleBreakdownChart,
  ActivityDistributionChart,
  DrillDownProvider,
  DrillDownView,
  DashboardFilters,
  ExportButton,
  useDashboardStore,
} from '@/components/dashboard';
import { DashboardData } from '@/types/dashboard';

// Mock data for demonstration - in a real app, this would come from an API
const mockDashboardData: DashboardData = {
  blueprintId: '1',
  title: 'Advanced React Development Blueprint',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  status: 'in_progress',
  kpis: {
    totalLearningHours: 120,
    totalModules: 24,
    completedModules: 8,
    totalAssessments: 12,
    completedAssessments: 3,
    totalResources: 48,
    estimatedCompletionDate: '2024-03-15',
  },
  timeline: [
    { date: '2024-01-15', learningHours: 4, progressPercentage: 5, milestones: [] },
    {
      date: '2024-01-16',
      learningHours: 6,
      progressPercentage: 12,
      milestones: ['React Fundamentals Completed'],
    },
    { date: '2024-01-17', learningHours: 5, progressPercentage: 18, milestones: [] },
    {
      date: '2024-01-18',
      learningHours: 7,
      progressPercentage: 25,
      milestones: ['State Management Module'],
    },
    { date: '2024-01-19', learningHours: 4, progressPercentage: 30, milestones: [] },
    { date: '2024-01-20', learningHours: 6, progressPercentage: 38, milestones: [] },
  ],
  modules: [
    {
      id: '1',
      title: 'React Fundamentals',
      status: 'completed',
      progressPercentage: 100,
      estimatedHours: 8,
      actualHours: 7,
      dueDate: '2024-01-16',
      category: 'Technical',
    },
    {
      id: '2',
      title: 'State Management',
      status: 'completed',
      progressPercentage: 100,
      estimatedHours: 6,
      actualHours: 5,
      dueDate: '2024-01-18',
      category: 'Technical',
    },
    {
      id: '3',
      title: 'Hooks Deep Dive',
      status: 'in_progress',
      progressPercentage: 60,
      estimatedHours: 10,
      actualHours: 6,
      dueDate: '2024-01-25',
      category: 'Technical',
    },
    {
      id: '4',
      title: 'Performance Optimization',
      status: 'not_started',
      progressPercentage: 0,
      estimatedHours: 12,
      dueDate: '2024-02-01',
      category: 'Technical',
    },
    {
      id: '5',
      title: 'Testing Strategies',
      status: 'not_started',
      progressPercentage: 0,
      estimatedHours: 8,
      dueDate: '2024-02-05',
      category: 'Technical',
    },
    {
      id: '6',
      title: 'TypeScript Integration',
      status: 'not_started',
      progressPercentage: 0,
      estimatedHours: 6,
      dueDate: '2024-02-08',
      category: 'Technical',
    },
  ],
  activities: [
    { category: 'Technical Learning', hours: 45, percentage: 37.5, color: 'var(--info)' },
    { category: 'Practice Exercises', hours: 30, percentage: 25, color: 'var(--success)' },
    { category: 'Code Review', hours: 18, percentage: 15, color: 'var(--warning)' },
    { category: 'Documentation', hours: 15, percentage: 12.5, color: 'var(--secondary-accent)' },
    { category: 'Team Collaboration', hours: 12, percentage: 10, color: 'var(--error)' },
  ],
  resources: [
    {
      id: '1',
      title: 'React Official Docs',
      type: 'documentation',
      status: 'completed',
      estimatedTime: 2,
      url: 'https://react.dev',
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      type: 'course',
      status: 'in_progress',
      estimatedTime: 8,
      url: 'https://example.com',
    },
    {
      id: '3',
      title: 'Performance Best Practices',
      type: 'article',
      status: 'pending',
      estimatedTime: 1,
      url: 'https://example.com',
    },
  ],
};

function DashboardContent(): JSX.Element {
  const {} = useDashboardStore();
  const [data] = useState<DashboardData>(mockDashboardData);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <DrillDownProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Export */}
          <motion.header
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Learning Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Interactive data visualization for your learning blueprint
              </p>
            </div>
            <ExportButton data={data} elementId="dashboard-content" />
          </motion.header>

          {/* Filters Sidebar */}
          <motion.aside
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <DashboardFilters />
          </motion.aside>

          {/* Main Dashboard */}
          <main id="dashboard-content">
            <DashboardLayout data={data}>
              <KPICards kpis={data.kpis} />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <TimelineChart data={data.timeline} />
                <ModuleBreakdownChart data={data.modules} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <ActivityDistributionChart data={data.activities} />
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Resources Overview
                  </h3>
                  <div className="space-y-4">
                    {data.resources.slice(0, 5).map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {resource.title}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {resource.type} • {resource.estimatedTime}h
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            resource.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : resource.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {resource.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardLayout>
          </main>

          {/* Drill Down Modal */}
          <DrillDownView />
        </div>
      </div>
    </DrillDownProvider>
  );
}

export default function DashboardPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
