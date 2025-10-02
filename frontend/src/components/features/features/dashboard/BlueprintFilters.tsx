'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlueprintRow } from '@/lib/db/blueprints';

interface BlueprintFiltersProps {
  blueprints: BlueprintRow[];
  onFilteredBlueprintsChange: (filteredBlueprints: BlueprintRow[]) => void;
  className?: string;
  variant?: 'panel' | 'header';
}

interface FilterState {
  search: string;
  sortBy: 'date' | 'title' | 'status' | 'progress';
  sortOrder: 'asc' | 'desc';
  statusFilter: ('draft' | 'generating' | 'completed' | 'error')[];
  progressRange: { min: number; max: number };
  dateRange: { start: string; end: string };
  viewMode: 'grid' | 'list';
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Date Created', icon: Calendar },
  { value: 'title', label: 'Title', icon: Search },
  { value: 'status', label: 'Status', icon: CheckCircle },
  { value: 'progress', label: 'Progress', icon: Clock },
] as const;

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', icon: Clock, color: 'text-warning' },
  { value: 'generating', label: 'Generating', icon: Sparkles, color: 'text-secondary' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-success' },
  { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-error' },
] as const;

export function BlueprintFilters({
  blueprints,
  onFilteredBlueprintsChange,
  className,
  variant = 'panel',
}: BlueprintFiltersProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    statusFilter: [],
    progressRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' },
    viewMode: 'grid',
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.statusFilter.length > 0) count++;
    if (filters.progressRange.min > 0 || filters.progressRange.max < 100) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Apply filters and sorting
  const applyFilters = useCallback((blueprints: BlueprintRow[], currentFilters: FilterState) => {
    let filtered = [...blueprints];

    // Apply search filter
    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter((blueprint) => {
        const title = (blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`).toLowerCase();
        // Could also search in blueprint content if needed
        return title.includes(searchTerm);
      });
    }

    // Apply status filter
    if (currentFilters.statusFilter.length > 0) {
      filtered = filtered.filter((blueprint) =>
        currentFilters.statusFilter.includes(blueprint.status as any)
      );
    }

    // Apply progress range filter
    if (currentFilters.progressRange.min > 0 || currentFilters.progressRange.max < 100) {
      filtered = filtered.filter((blueprint) => {
        const progress = blueprint.status === 'completed'
          ? 100
          : blueprint.status === 'generating'
            ? 65
            : 15; // Default progress for draft
        return progress >= currentFilters.progressRange.min &&
               progress <= currentFilters.progressRange.max;
      });
    }

    // Apply date range filter
    if (currentFilters.dateRange.start || currentFilters.dateRange.end) {
      filtered = filtered.filter((blueprint) => {
        const createdDate = new Date(blueprint.created_at);
        const startDate = currentFilters.dateRange.start
          ? new Date(currentFilters.dateRange.start)
          : new Date(0);
        const endDate = currentFilters.dateRange.end
          ? new Date(currentFilters.dateRange.end)
          : new Date();

        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (currentFilters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          const titleA = (a.title || `Blueprint #${a.id.slice(0, 8)}`).toLowerCase();
          const titleB = (b.title || `Blueprint #${b.id.slice(0, 8)}`).toLowerCase();
          comparison = titleA.localeCompare(titleB);
          break;
        case 'status':
          const statusOrder = { draft: 0, generating: 1, completed: 2, error: 3 };
          comparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'progress':
          const progressA = a.status === 'completed' ? 100 : a.status === 'generating' ? 65 : 15;
          const progressB = b.status === 'completed' ? 100 : b.status === 'generating' ? 65 : 15;
          comparison = progressA - progressB;
          break;
      }

      return currentFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    const filteredBlueprints = applyFilters(blueprints, filters);
    onFilteredBlueprintsChange(filteredBlueprints);
  }, [blueprints, filters, applyFilters, onFilteredBlueprintsChange]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
      statusFilter: [],
      progressRange: { min: 0, max: 100 },
      dateRange: { start: '', end: '' },
      viewMode: 'grid',
    });
  };

  const toggleStatusFilter = (status: 'draft' | 'generating' | 'completed' | 'error') => {
    setFilters(prev => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter(s => s !== status)
        : [...prev.statusFilter, status]
    }));
  };

  // Close dropdown when clicking outside (for header variant)
  useEffect(() => {
    if (variant === 'header' && isExpanded) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.filter-dropdown-container')) {
          setIsExpanded(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [variant, isExpanded]);

  // Header variant - button with dropdown
  if (variant === 'header') {
    return (
      <div className="relative filter-dropdown-container">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'btn-secondary pressable flex items-center gap-2 px-5 py-2.5 rounded-xl min-w-[140px]',
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="h-4 w-4" />
          <span>Search & Filter</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute top-full right-0 mt-2 w-[640px] max-h-[80vh] overflow-hidden z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="glass rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">

                {/* Reorganized Filters Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Line 1: Search */}
                  <div className="p-4 border-b border-white/10 relative">
                    {/* Close button in top-right corner */}
                    <motion.button
                      onClick={() => setIsExpanded(false)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-3 w-3 text-text-secondary" />
                    </motion.button>

                    <div className="relative pr-8">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <input
                        type="text"
                        placeholder="Search blueprints..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 bg-background text-foreground placeholder:text-text-disabled focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Line 2: Sort by and Filter by side by side */}
                  <div className="p-4 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-4 relative">
                      {/* Vertical separator */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-x-1/2"></div>
                      {/* Sort by */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Sort by
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {SORT_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = filters.sortBy === option.value;
                            return (
                              <motion.button
                                key={option.value}
                                onClick={() => updateFilter('sortBy', option.value)}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-surface text-text-secondary hover:bg-surface hover:text-foreground'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="truncate">{option.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-text-secondary">Order:</span>
                          <motion.button
                            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-2 px-2 py-1 rounded-md bg-surface text-text-secondary hover:bg-surface hover:text-foreground transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {filters.sortOrder === 'asc' ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                            <span className="text-xs">
                              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            </span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Filter by status */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          Filter by status
                        </label>
                        <div className="space-y-2">
                          {STATUS_OPTIONS.map((status) => {
                            const Icon = status.icon;
                            const isSelected = filters.statusFilter.includes(status.value as any);
                            return (
                              <motion.button
                                key={status.value}
                                onClick={() => toggleStatusFilter(status.value)}
                                className={cn(
                                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all',
                                  isSelected
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-text-secondary hover:text-foreground hover:bg-surface'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className={cn('h-4 w-4', status.color)} />
                                {status.label}
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto h-2 w-2 rounded-full bg-primary"
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line 3: Progress Range and Date Range side by side */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 relative">
                      {/* Vertical separator */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-x-1/2"></div>
                      {/* Progress Range */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          Progress range
                        </label>
                        <div className="space-y-3">
                          {/* Current range display */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">
                              {filters.progressRange.min}%
                            </span>
                            <span className="text-text-secondary">
                              {filters.progressRange.max}%
                            </span>
                          </div>

                          {/* Range slider */}
                          <div className="relative">
                            <div className="relative h-2 bg-surface rounded-lg overflow-hidden">
                              {/* Background track */}
                              <div
                                className="absolute inset-0 rounded-lg"
                                style={{
                                  background: `linear-gradient(to right, rgb(30, 41, 59) 0%, rgb(30, 41, 59) ${filters.progressRange.min}%, rgb(79, 70, 229) ${filters.progressRange.min}%, rgb(79, 70, 229) ${filters.progressRange.max}%, rgb(30, 41, 59) ${filters.progressRange.max}%, rgb(30, 41, 59) 100%)`
                                }}
                              />

                              {/* Min thumb */}
                              <div
                                className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-primary rounded-full transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                  left: `${filters.progressRange.min}%`,
                                  boxShadow: '0 0 4px rgba(79, 70, 229, 0.5)'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const parentElement = e.currentTarget.parentElement;
                                  if (!parentElement) return;

                                  const handleMouseMove = (moveEvent: MouseEvent) => {
                                    const rect = parentElement.getBoundingClientRect();
                                    if (rect) {
                                      const percentage = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                                      const minValue = Math.max(0, Math.min(filters.progressRange.max, Math.round(percentage)));
                                      updateFilter('progressRange', {
                                        min: minValue,
                                        max: filters.progressRange.max
                                      });
                                    }
                                  };

                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                  };

                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }}
                              />

                              {/* Max thumb */}
                              <div
                                className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-primary rounded-full transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                  left: `${filters.progressRange.max}%`,
                                  boxShadow: '0 0 4px rgba(79, 70, 229, 0.5)'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const parentElement = e.currentTarget.parentElement;
                                  if (!parentElement) return;

                                  const handleMouseMove = (moveEvent: MouseEvent) => {
                                    const rect = parentElement.getBoundingClientRect();
                                    if (rect) {
                                      const percentage = Math.max(filters.progressRange.min, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                                      const maxValue = Math.max(filters.progressRange.min, Math.min(100, Math.round(percentage)));
                                      updateFilter('progressRange', {
                                        min: filters.progressRange.min,
                                        max: maxValue
                                      });
                                    }
                                  };

                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                  };

                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }}
                              />
                            </div>
                          </div>

                          {/* Range labels */}
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          Date range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">From</label>
                            <input
                              type="date"
                              value={filters.dateRange.start}
                              onChange={(e) => updateFilter('dateRange', {
                                ...filters.dateRange,
                                start: e.target.value
                              })}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-background text-foreground text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">To</label>
                            <input
                              type="date"
                              value={filters.dateRange.end}
                              onChange={(e) => updateFilter('dateRange', {
                                ...filters.dateRange,
                                end: e.target.value
                              })}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-background text-foreground text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <motion.button
                        onClick={resetFilters}
                        className="mt-4 w-full text-xs text-text-secondary hover:text-foreground transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Clear all filters
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Panel variant - full panel
  return (
    <motion.div
      className={cn(
        'glass rounded-2xl border border-white/10 overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Filters & Search</h3>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-text-secondary">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <motion.button
                onClick={resetFilters}
                className="text-xs text-text-secondary hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear all
              </motion.button>
            )}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Search */}
            <div className="p-6 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search blueprints..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 bg-background text-foreground placeholder:text-text-disabled focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none transition-all"
                />
                {filters.search && (
                  <motion.button
                    onClick={() => updateFilter('search', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-surface flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-3 w-3 text-text-secondary" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Sort & View Options */}
            <div className="p-6 border-b border-white/10 space-y-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort by
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = filters.sortBy === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => updateFilter('sortBy', option.value)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-surface text-text-secondary hover:bg-surface hover:text-foreground'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sort Order Toggle */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-text-secondary">Order:</span>
                  <motion.button
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 px-2 py-1 rounded-md bg-surface text-text-secondary hover:bg-surface hover:text-foreground transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  View mode
                </label>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => updateFilter('viewMode', 'grid')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      filters.viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface text-text-secondary hover:bg-surface hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Grid className="h-4 w-4" />
                    Grid
                  </motion.button>
                  <motion.button
                    onClick={() => updateFilter('viewMode', 'list')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      filters.viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface text-text-secondary hover:bg-surface hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <List className="h-4 w-4" />
                    List
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="p-6 border-b border-white/10">
              <label className="block text-sm font-medium text-foreground mb-3">
                Filter by status
              </label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((status) => {
                  const Icon = status.icon;
                  const isSelected = filters.statusFilter.includes(status.value as any);
                  return (
                    <motion.button
                      key={status.value}
                      onClick={() => toggleStatusFilter(status.value)}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all',
                        isSelected
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-text-secondary hover:text-foreground hover:bg-surface'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={cn('h-4 w-4', status.color)} />
                      {status.label}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto h-2 w-2 rounded-full bg-primary"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Progress Range Filter */}
            <div className="p-6 border-b border-white/10">
              <label className="block text-sm font-medium text-foreground mb-3">
                Progress range
              </label>
              <div className="space-y-3">
                {/* Current range display */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {filters.progressRange.min}%
                  </span>
                  <span className="text-text-secondary">
                    {filters.progressRange.max}%
                  </span>
                </div>

                {/* Range slider */}
                <div className="relative">
                  <div className="relative h-2 bg-surface rounded-lg overflow-hidden">
                    {/* Background track */}
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `linear-gradient(to right, rgb(30, 41, 59) 0%, rgb(30, 41, 59) ${filters.progressRange.min}%, rgb(79, 70, 229) ${filters.progressRange.min}%, rgb(79, 70, 229) ${filters.progressRange.max}%, rgb(30, 41, 59) ${filters.progressRange.max}%, rgb(30, 41, 59) 100%)`
                      }}
                    />

                    {/* Min thumb */}
                    <div
                      className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-primary rounded-full transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${filters.progressRange.min}%`,
                        boxShadow: '0 0 4px rgba(79, 70, 229, 0.5)'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const parentElement = e.currentTarget.parentElement;
                        if (!parentElement) return;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const rect = parentElement.getBoundingClientRect();
                          if (rect) {
                            const percentage = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                            const minValue = Math.max(0, Math.min(filters.progressRange.max, Math.round(percentage)));
                            updateFilter('progressRange', {
                              min: minValue,
                              max: filters.progressRange.max
                            });
                          }
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />

                    {/* Max thumb */}
                    <div
                      className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-primary rounded-full transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${filters.progressRange.max}%`,
                        boxShadow: '0 0 4px rgba(79, 70, 229, 0.5)'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const parentElement = e.currentTarget.parentElement;
                        if (!parentElement) return;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const rect = parentElement.getBoundingClientRect();
                          if (rect) {
                            const percentage = Math.max(filters.progressRange.min, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                            const maxValue = Math.max(filters.progressRange.min, Math.min(100, Math.round(percentage)));
                            updateFilter('progressRange', {
                              min: filters.progressRange.min,
                              max: maxValue
                            });
                          }
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                </div>

                {/* Range labels */}
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="p-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Date range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-background text-foreground text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-background text-foreground text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
