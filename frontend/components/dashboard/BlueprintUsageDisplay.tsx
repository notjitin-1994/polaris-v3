'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Crown, AlertCircle, RefreshCw } from 'lucide-react';
import { BlueprintUsageService, BlueprintUsageInfo } from '@/lib/services/blueprintUsageService';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface BlueprintUsageDisplayProps {
  className?: string;
}

export function BlueprintUsageDisplay({ className }: BlueprintUsageDisplayProps): React.JSX.Element {
  const { user } = useAuth();
  const [usage, setUsage] = useState<BlueprintUsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh usage data
  const refreshUsage = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const supabase = getSupabaseBrowserClient();
      const usageInfo = await BlueprintUsageService.getBlueprintUsageInfo(supabase, user.id);
      console.log('Blueprint usage info:', usageInfo); // Debug logging
      console.log('User ID:', user.id);
      console.log('Current counts:', {
        creationCount: usageInfo.creationCount,
        savingCount: usageInfo.savingCount,
        creationLimit: usageInfo.creationLimit,
        savingLimit: usageInfo.savingLimit,
        creationRemaining: usageInfo.creationLimit - usageInfo.creationCount,
        savingRemaining: usageInfo.savingLimit - usageInfo.savingCount,
      });
      setUsage(usageInfo);
    } catch (error) {
      console.error('Error loading blueprint usage:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadUsage = async () => {
      await refreshUsage();
      setLoading(false);
    };

    loadUsage();
  }, [user?.id, refreshKey, refreshUsage]);

  // Set up polling to refresh data every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      refreshUsage();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, refreshUsage]);

  // Listen for storage events to refresh when blueprint operations complete
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blueprint_operation_completed') {
        refreshUsage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUsage]);

  // Expose refresh and debug functions globally for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshBlueprintUsage = refreshUsage;

      // Debug function to check blueprint counts
      (window as any).debugBlueprintUsage = async () => {
        if (!user?.id) return;
        const supabase = getSupabaseBrowserClient();
        const usageInfo = await BlueprintUsageService.getBlueprintUsageInfo(supabase, user.id);
        const rawCounts = await BlueprintUsageService.getRawBlueprintCounts(supabase, user.id);

        console.log('=== Blueprint Usage Debug ===');
        console.log('Usage Info:', usageInfo);
        console.log('Raw Counts:', rawCounts);
        console.log('User ID:', user.id);
        console.log('Exempt:', usageInfo.isExempt);
        console.log('Remaining Creation:', usageInfo.creationLimit - usageInfo.creationCount);
        console.log('Remaining Saving:', usageInfo.savingLimit - usageInfo.savingCount);
        console.log('===========================');

        return { usageInfo, rawCounts };
      };
    }
  }, [refreshUsage, user?.id]);

  if (loading || !usage) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded-full bg-white/20"></div>
          <div className="h-4 w-4 animate-pulse rounded-full bg-white/20"></div>
        </div>
      </div>
    );
  }

  const creationRemaining = usage.creationLimit - usage.creationCount;
  const savingRemaining = usage.savingLimit - usage.savingCount;
  const creationPercentage = (usage.creationCount / usage.creationLimit) * 100;
  const savingPercentage = (usage.savingCount / usage.savingLimit) * 100;

  // If user is exempt, show unlimited indicator
  if (usage.isExempt) {
    return (
      <motion.div
        className={`flex items-center gap-3 ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {usage.exemptionReason || 'Unlimited Access'}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Creation Limit */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <FileText className="h-4 w-4 text-white/80" />
          <div
            className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-white/20"
            style={{
              backgroundColor: creationPercentage >= 80 ? '#ef4444' : creationPercentage >= 60 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-white/60">Create</div>
          <div className="text-sm font-medium text-white">
            {creationRemaining > 0 ? `${creationRemaining} left` : 'Limit reached'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/20"></div>

      {/* Saving Limit */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Save className="h-4 w-4 text-white/80" />
          <div
            className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-white/20"
            style={{
              backgroundColor: savingPercentage >= 80 ? '#ef4444' : savingPercentage >= 60 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-white/60">Save</div>
          <div className="text-sm font-medium text-white">
            {savingRemaining > 0 ? `${savingRemaining} left` : 'Limit reached'}
          </div>
        </div>
      </div>

      {/* Manual refresh button */}
      <motion.button
        onClick={refreshUsage}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Refresh usage data"
      >
        <RefreshCw className="h-3 w-3" />
      </motion.button>

      {/* Warning for low limits */}
      {(creationRemaining <= 1 || savingRemaining <= 1) && (
        <motion.div
          className="flex items-center gap-1 rounded-lg bg-warning/10 border border-warning/20 px-2 py-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <AlertCircle className="h-3 w-3 text-warning" />
          <span className="text-xs font-medium text-warning">
            {creationRemaining <= 1 && savingRemaining <= 1
              ? 'Limits low'
              : creationRemaining <= 1
                ? 'Creation limit low'
                : 'Saving limit low'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
