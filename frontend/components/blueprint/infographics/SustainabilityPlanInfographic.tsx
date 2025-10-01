/**
 * Sustainability Plan Infographic
 * Visual representation of long-term maintenance and scaling strategy
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, RefreshCw, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface MaintenanceSchedule {
  review_frequency?: string;
  update_triggers?: string[];
}

interface SustainabilityPlanInfographicProps {
  content: string;
  maintenance_schedule?: MaintenanceSchedule;
  scaling_considerations?: string[];
}

export function SustainabilityPlanInfographic({
  content,
  maintenance_schedule,
  scaling_considerations,
}: SustainabilityPlanInfographicProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-success/10 p-6"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-success blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-xl bg-success/20 p-3"
            >
              <Leaf className="h-6 w-6 text-success" />
            </motion.div>
            <h3 className="text-lg font-bold text-white">Long-Term Sustainability</h3>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{content}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Maintenance Schedule */}
        {maintenance_schedule && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass space-y-4 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/20 p-3">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-white">Maintenance Schedule</h3>
            </div>

            {/* Review Frequency */}
            {maintenance_schedule.review_frequency && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 rounded-lg bg-primary/10 p-4"
              >
                <Calendar className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Review Frequency
                  </p>
                  <p className="text-sm font-medium text-white">
                    {maintenance_schedule.review_frequency}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Update Triggers */}
            {maintenance_schedule.update_triggers && maintenance_schedule.update_triggers.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <p className="text-sm font-semibold text-white">Update Triggers</p>
                </div>
                <div className="space-y-2">
                  {maintenance_schedule.update_triggers.map((trigger, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
                    >
                      <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-text-secondary">{trigger}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Scaling Considerations */}
        {scaling_considerations && scaling_considerations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass space-y-4 rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-secondary/20 p-3">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-base font-bold text-white">Scaling Considerations</h3>
            </div>

            <div className="space-y-3">
              {scaling_considerations.map((consideration, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="group flex items-start gap-3 rounded-lg bg-white/5 p-4 transition-all hover:bg-secondary/10"
                >
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-bold text-secondary">
                    {index + 1}
                  </div>
                  <span className="text-sm leading-relaxed text-text-secondary group-hover:text-white">
                    {consideration}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Key Metrics Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-semibold uppercase tracking-wider text-success">
              Longevity
            </span>
          </div>
          <p className="text-sm text-text-secondary">Designed for long-term impact and evolution</p>
        </div>

        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Adaptability
            </span>
          </div>
          <p className="text-sm text-text-secondary">Regular reviews ensure continued relevance</p>
        </div>

        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Scalability
            </span>
          </div>
          <p className="text-sm text-text-secondary">Built to grow with organizational needs</p>
        </div>
      </motion.div>
    </div>
  );
}

