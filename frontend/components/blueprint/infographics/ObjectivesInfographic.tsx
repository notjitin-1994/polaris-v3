/**
 * Objectives Infographic Component
 * Animated cards showing learning objectives with baseline/target progress
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Info } from 'lucide-react';
import { calculateProgress, formatDate } from '../utils';
import type { Objective, ChartConfig } from '../types';

interface ObjectivesInfographicProps {
  objectives: Objective[];
  chartConfig?: ChartConfig;
}

// Helper function to extract numerical value from baseline/target strings
const extractNumericalValue = (value: string): string => {
  // Extract percentage or numerical value from strings like "60% accuracy in service boundary definition"
  const match = value.match(/(\d+(?:\.\d+)?)%?/);
  return match ? match[1] + (value.includes('%') ? '%' : '') : value;
};

// Helper function to extract full description for tooltip
const extractFullDescription = (value: string): string => {
  // Return the full description for tooltip, or just the value if no number found
  const match = value.match(/(\d+(?:\.\d+)?)%?\s*(.+)/);
  return match ? match[2] : value;
};

export function ObjectivesInfographic({
  objectives,
}: ObjectivesInfographicProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objectives.map((obj, index) => {
        const baselineValue = extractNumericalValue(String(obj.baseline));
        const targetValue = extractNumericalValue(String(obj.target));
        const baselineDescription = extractFullDescription(String(obj.baseline));
        const targetDescription = extractFullDescription(String(obj.target));

        return (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-strong rounded-xl p-5 transition-all hover:shadow-lg relative group flex flex-col h-full"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Target className="text-primary h-4 w-4" />
                </div>
                <div className="text-primary text-xl font-bold">#{index + 1}</div>
              </div>
              <div className="text-text-secondary bg-surface rounded-md px-2 py-1 text-xs">
                {formatDate(obj.due_date)}
              </div>
            </div>

            {/* Content Area - Flexible Height */}
            <div className="flex-grow mb-4">
              <h3 className="text-heading text-foreground mb-2 font-semibold line-clamp-2 min-h-[3rem]">{obj.title}</h3>

              <p className="text-body text-text-secondary mb-4 line-clamp-2 text-sm min-h-[2.5rem]">{obj.description}</p>

              {/* Metric Badge */}
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{obj.metric}</span>
              </div>

              {/* Compact Baseline/Target Display */}
              <div className="grid grid-cols-2 gap-3">
                {/* Baseline */}
                <div className="relative group/baseline">
                  <div className="text-xs text-text-secondary mb-1">Baseline</div>
                  <div className="text-lg font-semibold text-foreground">{baselineValue}</div>
                  {baselineDescription !== baselineValue && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/baseline:block z-10">
                      <div className="bg-foreground text-background text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {baselineDescription}
                        <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target */}
                <div className="relative group/target">
                  <div className="text-xs text-text-secondary mb-1">Target</div>
                  <div className="text-lg font-bold text-primary">{targetValue}</div>
                  {targetDescription !== targetValue && (
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover/target:block z-10">
                      <div className="bg-foreground text-background text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {targetDescription}
                        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar - Always at Bottom */}
            <div className="mt-auto">
              <div className="text-text-secondary mb-2 flex justify-between text-xs">
                <span>Progress to Target</span>
                <span className="font-medium">{calculateProgress(obj.baseline, obj.target).toFixed(0)}%</span>
              </div>
              <div className="bg-surface h-2 overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(obj.baseline, obj.target)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
