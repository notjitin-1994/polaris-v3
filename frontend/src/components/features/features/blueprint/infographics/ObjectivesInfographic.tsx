/**
 * Objectives Infographic Component
 * Animated cards showing learning objectives with baseline/target progress
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { calculateProgress, formatDate } from '../utils';
import type { Objective, ChartConfig } from '../types';

interface ObjectivesInfographicProps {
  objectives: Objective[];
  chartConfig?: ChartConfig;
}

export function ObjectivesInfographic({
  objectives,
}: ObjectivesInfographicProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {objectives.map((obj, index) => (
        <motion.div
          key={obj.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="glass-strong rounded-xl p-6 transition-all hover:shadow-lg"
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Target className="text-primary h-5 w-5" />
              </div>
              <div className="text-primary text-2xl font-bold">#{index + 1}</div>
            </div>
            <div className="text-text-secondary bg-surface rounded-md px-2 py-1 text-xs">
              {formatDate(obj.due_date)}
            </div>
          </div>

          {/* Content */}
          <h3 className="text-heading text-foreground mb-2 font-semibold">{obj.title}</h3>

          <p className="text-body text-text-secondary mb-4 line-clamp-3">{obj.description}</p>

          {/* Metric Badge */}
          <div className="bg-secondary/10 text-secondary mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span>{obj.metric}</span>
          </div>

          {/* Baseline/Target */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Baseline:</span>
              <span className="text-foreground font-medium">{obj.baseline}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Target:</span>
              <span className="text-primary font-semibold">{obj.target}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="text-text-secondary mb-1 flex justify-between text-xs">
              <span>Progress to Target</span>
              <span>{calculateProgress(obj.baseline, obj.target).toFixed(0)}%</span>
            </div>
            <div className="bg-surface h-2 overflow-hidden rounded-full">
              <motion.div
                className="bg-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress(obj.baseline, obj.target)}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
