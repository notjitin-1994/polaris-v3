'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterConfig {
  search: string;
  role: string;
  tier: string;
  status: 'all' | 'active' | 'inactive' | 'deleted';
  dateRange: { start: string; end: string } | null;
  usageRange: { min: number; max: number } | null;
}

interface AdvancedFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
}

const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'developer', label: 'Developer' },
  { value: 'admin', label: 'Admin' },
];

const SUBSCRIPTION_TIERS = [
  { value: 'free', label: 'Free' },
  { value: 'explorer', label: 'Explorer' },
  { value: 'navigator', label: 'Navigator' },
  { value: 'voyager', label: 'Voyager' },
  { value: 'crew_member', label: 'Crew Member' },
  { value: 'fleet_member', label: 'Fleet Member' },
  { value: 'armada_member', label: 'Armada Member' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'active', label: 'Active (last 30 days)' },
  { value: 'inactive', label: 'Inactive (30+ days)' },
  { value: 'deleted', label: 'Deleted' },
];

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const hasActiveFilters = filters.role || filters.tier || filters.status !== 'all';

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search,
      role: '',
      tier: '',
      status: 'all',
      dateRange: null,
      usageRange: null,
    });
  };

  const clearFilter = (filterKey: keyof FilterConfig) => {
    if (filterKey === 'role' || filterKey === 'tier') {
      onFiltersChange({ ...filters, [filterKey]: '' });
    } else if (filterKey === 'status') {
      onFiltersChange({ ...filters, status: 'all' });
    } else {
      onFiltersChange({ ...filters, [filterKey]: null });
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filter Options</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="small"
            onClick={clearAllFilters}
            className="text-xs text-white/60 hover:text-white"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">Active filters:</span>

          {filters.role && (
            <Badge
              variant="secondary"
              className="group flex items-center gap-1 bg-cyan-500/20 text-cyan-400"
            >
              Role: {filters.role}
              <button
                onClick={() => clearFilter('role')}
                className="ml-1 rounded-full opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tier && (
            <Badge
              variant="secondary"
              className="group flex items-center gap-1 bg-purple-500/20 text-purple-400"
            >
              Tier: {filters.tier}
              <button
                onClick={() => clearFilter('tier')}
                className="ml-1 rounded-full opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge
              variant="secondary"
              className="group flex items-center gap-1 bg-green-500/20 text-green-400"
            >
              Status: {filters.status}
              <button
                onClick={() => clearFilter('status')}
                className="ml-1 rounded-full opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Role Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">User Role</label>
          <select
            value={filters.role}
            onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
          >
            <option value="">All Roles</option>
            {USER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Subscription Tier</label>
          <select
            value={filters.tier}
            onChange={(e) => onFiltersChange({ ...filters, tier: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
          >
            <option value="">All Tiers</option>
            {SUBSCRIPTION_TIERS.map((tier) => (
              <option key={tier.value} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">User Status</label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as 'all' | 'active' | 'inactive' | 'deleted',
              })
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Filters (Date Range, Usage Range) - Placeholder */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-xs text-white/40">Advanced date range and usage filters coming soon</p>
      </div>
    </div>
  );
}
