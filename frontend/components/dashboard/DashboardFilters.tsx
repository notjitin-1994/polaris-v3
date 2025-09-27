'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardFilters as FilterTypes } from '@/types/dashboard';

interface DashboardFiltersProps {
  className?: string;
}

export function DashboardFilters({ className }: DashboardFiltersProps): JSX.Element {
  const { filters, setFilters, resetFilters, settings, setSettings } = useDashboardStore();

  const updateDateRange = (key: 'start' | 'end', value: string) => {
    setFilters({
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  const toggleFilter = (filterType: keyof FilterTypes, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setFilters({ [filterType]: newValues });
  };

  const clearFilter = (filterType: keyof FilterTypes, value: string) => {
    const currentValues = filters[filterType] as string[];
    setFilters({
      [filterType]: currentValues.filter((v) => v !== value),
    });
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-foreground">
              Dashboard Filters
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="text-slate-600 dark:text-slate-400"
          >
            Reset All
          </Button>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h4 className="font-medium text-foreground">Date Range</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateDateRange('start', e.target.value)}
                className="glass w-full px-3 py-2 rounded-md text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateDateRange('end', e.target.value)}
                className="glass w-full px-3 py-2 rounded-md text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Module Status Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Module Status</h4>
          <div className="flex flex-wrap gap-2">
            {['not_started', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => toggleFilter('status', status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.status.includes(status)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                {filters.status.includes(status) && (
                  <X
                    className="w-3 h-3 ml-1 inline"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter('status', status);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {['Technical', 'Business', 'Design', 'Marketing', 'Operations'].map((category) => (
              <button
                key={category}
                onClick={() => toggleFilter('categories', category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.categories.includes(category)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {category}
                {filters.categories.includes(category) && (
                  <X
                    className="w-3 h-3 ml-1 inline"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter('categories', category);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 className="font-medium text-foreground mb-3">Display Settings</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={(e) => setSettings({ showAnimations: e.target.checked })}
                className="glass h-4 w-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <span className="text-sm text-foreground">Show animations</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.theme === 'dark'}
                onChange={(e) => setSettings({ theme: e.target.checked ? 'dark' : 'light' })}
                className="glass h-4 w-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <span className="text-sm text-foreground">Dark theme</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
