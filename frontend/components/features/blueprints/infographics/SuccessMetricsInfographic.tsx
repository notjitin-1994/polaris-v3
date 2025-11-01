/**
 * Success Metrics Infographic Component
 * Modern, legible design with light neutral background and high contrast text
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Activity, BarChart3 } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Enhanced Header with Reporting Cadence - Brand Styled */}
      {reportingCadence && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center"
        >
          <div className="glass-strong inline-flex items-center gap-3 rounded-full border border-white/10 px-6 py-3">
            <div className="bg-primary/20 rounded-full p-1.5">
              <Calendar className="text-primary h-4 w-4" />
            </div>
            <span className="text-foreground font-semibold">Reporting: {reportingCadence}</span>
          </div>
        </motion.div>
      )}

      {/* Modern Metrics Grid - Brand Glass Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group"
          >
            <div className="glass-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:shadow-xl">
              {/* Ambient gradient overlay */}
              <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Content Container */}
              <div className="relative z-10 p-8">
                {/* Header Section */}
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="border-primary/30 bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                      <BarChart3 className="h-3 w-3" />
                      KPI METRIC
                    </div>
                    <h3 className="text-foreground text-xl leading-tight font-bold">
                      {metric.metric}
                    </h3>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="bg-success/20 hover:bg-success/30 text-success rounded-full p-2 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </motion.div>
                </div>

                {/* Current vs Target - Modern Comparison Design */}
                <div className="mb-8">
                  {/* Metric Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-text-secondary text-xs font-medium tracking-wider uppercase">
                      Performance Comparison
                    </div>
                    <div className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs font-semibold">
                      KPI TRACKING
                    </div>
                  </div>

                  {/* Integrated Current/Target Display */}
                  <motion.div
                    className="glass-strong rounded-2xl border border-white/10 p-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <div className="relative flex">
                      {/* Current Value Section */}
                      <div className="bg-surface/50 relative flex-1 rounded-l-xl border-r border-white/20 p-6">
                        <div className="text-text-secondary mb-2 text-xs font-medium tracking-wider uppercase">
                          Current
                        </div>
                        <motion.div
                          className="text-foreground text-2xl font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                        >
                          {metric.current_baseline}
                        </motion.div>
                        <div className="text-text-secondary mt-1 text-xs">Baseline performance</div>
                      </div>

                      {/* Comparison Indicator */}
                      <div className="border-primary/30 bg-primary/10 flex w-16 items-center justify-center border-r border-l">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.35, duration: 0.5, ease: 'backOut' }}
                          className="bg-primary rounded-full p-2 text-white"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </motion.div>
                      </div>

                      {/* Target Value Section */}
                      <div className="border-primary/30 bg-primary/10 relative flex-1 rounded-r-xl border-l p-6">
                        <div className="text-primary mb-2 text-xs font-medium tracking-wider uppercase">
                          Target
                        </div>
                        <motion.div
                          className="text-primary text-2xl font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          {metric.target}
                        </motion.div>
                        <div className="text-primary/80 mt-1 text-xs">Goal achievement</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    className="bg-surface/50 relative mt-4 h-2 overflow-hidden rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.6, duration: 0.8, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="from-primary/60 to-primary h-full rounded-full bg-gradient-to-r"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ delay: index * 0.1 + 0.7, duration: 1.2, ease: 'easeOut' }}
                    />
                  </motion.div>
                </div>

                {/* Measurement Details - Brand Styled */}
                <div className="bg-surface/30 space-y-4 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary rounded-lg p-1.5">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-text-secondary text-xs font-medium">
                        Measurement Method
                      </div>
                      <div className="text-foreground text-sm font-medium">
                        {metric.measurement_method}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary rounded-lg p-1.5">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-text-secondary text-xs font-medium">
                        Evaluation Timeline
                      </div>
                      <div className="text-foreground text-sm font-medium">{metric.timeline}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand accent line */}
              <motion.div
                className="from-primary to-primary/60 absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
