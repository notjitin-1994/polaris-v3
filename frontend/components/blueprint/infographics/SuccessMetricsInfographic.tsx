/**
 * Success Metrics Infographic Component
 * Dashboard-style metric cards with current/target comparison
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import type { Metric } from '../types';

interface SuccessMetricsInfographicProps {
  metrics: Metric[];
  reportingCadence?: string;
}

export function SuccessMetricsInfographic({
  metrics,
  reportingCadence,
}: SuccessMetricsInfographicProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Reporting Cadence Badge */}
      {reportingCadence && (
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>Reporting: {reportingCadence}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.metric}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="glass-strong relative overflow-hidden rounded-xl p-6"
          >
            {/* Background gradient */}
            <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br opacity-50" />

            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between">
                <h4 className="text-foreground pr-2 text-sm font-semibold">{metric.metric}</h4>
                <TrendingUp className="text-success h-4 w-4 flex-shrink-0" />
              </div>

              {/* Baseline/Target Comparison */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-text-secondary mb-1 text-xs">Current</div>
                  <div className="text-foreground text-lg font-medium">
                    {metric.current_baseline}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary mb-1 text-xs">Target</div>
                  <motion.div
                    className="text-primary text-lg font-bold"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.08 + 0.2 }}
                  >
                    {metric.target}
                  </motion.div>
                </div>
              </div>

              {/* Measurement Details */}
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-text-secondary">Method: </span>
                  <span className="text-foreground">{metric.measurement_method}</span>
                </div>
                <div className="text-xs">
                  <span className="text-text-secondary">Timeline: </span>
                  <span className="text-foreground">{metric.timeline}</span>
                </div>
              </div>

              {/* Animated bottom border */}
              <motion.div
                className="from-primary to-secondary absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.08 + 0.4, duration: 0.5 }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
