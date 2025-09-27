'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DashboardData } from '@/types/dashboard';

interface DashboardLayoutProps {
  data: DashboardData;
  children: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function DashboardLayout({ data, children, className }: DashboardLayoutProps): JSX.Element {
  return (
    <motion.div
      className={cn(
        'min-h-screen bg-slate-50 dark:bg-slate-900',
        className,
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <motion.header className="mb-6 sm:mb-8" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                {data.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Last updated: {new Date(data.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  data.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : data.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                )}
              >
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Grid Layout */}
        <motion.main className="space-y-6" variants={containerVariants}>
          {/* Top Row - KPIs */}
          <motion.section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={itemVariants}
          >
            {children}
          </motion.section>

          {/* Middle Row - Main Charts */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            variants={itemVariants}
          >
            {/* Timeline Chart */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              variants={itemVariants}
            >
              <div id="timeline-chart" className="h-80">
                {/* Timeline chart will be rendered here */}
              </div>
            </motion.div>

            {/* Module Breakdown Chart */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              variants={itemVariants}
            >
              <div id="module-breakdown-chart" className="h-80">
                {/* Module breakdown chart will be rendered here */}
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Row - Secondary Charts */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            variants={itemVariants}
          >
            {/* Activity Distribution Chart */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              variants={itemVariants}
            >
              <div id="activity-chart" className="h-72">
                {/* Activity distribution chart will be rendered here */}
              </div>
            </motion.div>

            {/* Resources Overview */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              variants={itemVariants}
            >
              <div id="resources-overview" className="h-72">
                {/* Resources overview will be rendered here */}
              </div>
            </motion.div>
          </motion.div>

          {/* Mobile-specific adjustments */}
          <div className="block lg:hidden">
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4"
              variants={itemVariants}
            >
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                For the best experience, view this dashboard on a larger screen.
              </p>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </motion.div>
  );
}
