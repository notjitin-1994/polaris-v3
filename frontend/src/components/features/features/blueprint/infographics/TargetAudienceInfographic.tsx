/**
 * Target Audience Infographic Component
 * Visualizes demographics and learning preferences
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { TargetAudienceSection } from '../types';

interface TargetAudienceInfographicProps {
  data: TargetAudienceSection;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function TargetAudienceInfographic({
  data,
}: TargetAudienceInfographicProps): React.JSX.Element {
  const { demographics, learning_preferences } = data;

  return (
    <div className="space-y-8">
      {/* Demographics Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Users className="text-primary h-5 w-5" />
          <h3 className="text-heading text-foreground font-semibold">Demographics</h3>
        </div>

        {/* Roles */}
        {demographics.roles && demographics.roles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-text-secondary mb-3 text-sm font-medium">Target Roles</h4>
            <div className="flex flex-wrap gap-2">
              {demographics.roles.map((role, index) => {
                // Handle both string and object formats
                const roleText =
                  typeof role === 'string' ? role : role.role || role.name || String(role);
                const roleKey =
                  typeof role === 'string'
                    ? role
                    : role.role || role.name || `${index}-${roleText}`;

                return (
                  <motion.div
                    key={roleKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-strong text-foreground rounded-lg px-4 py-2 text-sm"
                  >
                    {roleText}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience Levels */}
        {demographics.experience_levels && demographics.experience_levels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-text-secondary mb-3 text-sm font-medium">Experience Levels</h4>
            <div className="flex flex-wrap gap-2">
              {demographics.experience_levels.map((level, index) => {
                // Handle both string and object formats
                const levelText =
                  typeof level === 'string' ? level : level.level || level.name || String(level);
                const levelKey =
                  typeof level === 'string'
                    ? level
                    : level.level || level.name || `${index}-${levelText}`;

                return (
                  <motion.div
                    key={levelKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-secondary/30 bg-secondary/5 text-secondary rounded-lg border px-4 py-2 text-sm"
                  >
                    {levelText}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Department Distribution */}
        {demographics.department_distribution &&
          demographics.department_distribution.length > 0 && (
            <div>
              <h4 className="text-text-secondary mb-3 text-sm font-medium">
                Department Distribution
              </h4>
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographics.department_distribution}
                        dataKey="percentage"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ department, percentage }) => `${department}: ${percentage}%`}
                      >
                        {demographics.department_distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Cards */}
                <div className="space-y-2">
                  {demographics.department_distribution.map((dept, index) => (
                    <motion.div
                      key={dept.department}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="glass-strong flex items-center justify-between rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-foreground text-sm">{dept.department}</span>
                      </div>
                      <span className="text-primary text-sm font-semibold">{dept.percentage}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Learning Preferences */}
      {learning_preferences?.modalities && learning_preferences.modalities.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="text-secondary h-5 w-5" />
            <h3 className="text-heading text-foreground font-semibold">Learning Preferences</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learning_preferences.modalities}>
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {learning_preferences.modalities.map((modality, index) => (
              <motion.div
                key={modality.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 }}
                className="glass-strong rounded-lg p-3 text-center"
              >
                <div className="text-primary mb-1 text-2xl font-bold">{modality.percentage}%</div>
                <div className="text-text-secondary text-xs">{modality.type}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
