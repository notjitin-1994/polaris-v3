'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import CountUp from 'react-countup';
import {
  Clock,
  BookOpen,
  Target,
  Layers,
  Users,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import type { AnyBlueprint } from '@/lib/ollama/schema';

interface BlueprintDashboardProps {
  blueprint: AnyBlueprint;
}

export function BlueprintDashboard({ blueprint }: BlueprintDashboardProps): React.JSX.Element {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract data from blueprint
  const modules = 'modules' in blueprint ? blueprint.modules : [];
  const learningObjectives = 'learningObjectives' in blueprint ? blueprint.learningObjectives : [];
  const resources =
    'resources' in blueprint && Array.isArray(blueprint.resources) ? blueprint.resources : [];

  // Calculate total duration
  const totalDuration = modules.reduce((sum, module) => {
    const duration = typeof module.duration === 'number' ? module.duration : 0;
    return sum + duration;
  }, 0);

  // Module data for charts
  const moduleData = modules.slice(0, 6).map((module, index) => ({
    name: module.title.length > 20 ? `${module.title.substring(0, 20)}...` : module.title,
    duration: typeof module.duration === 'number' ? module.duration : 0,
    topics: Array.isArray(module.topics) ? module.topics.length : 0,
  }));

  // Resource type distribution
  const resourceTypeCount: Record<string, number> = {};
  resources.forEach((resource) => {
    const type = resource.type || 'Other';
    resourceTypeCount[type] = (resourceTypeCount[type] || 0) + 1;
  });

  const resourceData = Object.entries(resourceTypeCount).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Brand teal color palette
  const COLORS = ['#a7dadb', '#7bc5c7', '#d0edf0', '#5ba0a2', '#4F46E5', '#7C69F5'];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix = '',
    delay = 0,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    delay?: number;
  }) => (
    <motion.div
      variants={itemVariants}
      className="glass-card border-primary-500/20 hover:border-primary-500/40 hover:shadow-primary-500/10 group rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="bg-primary-500/10 group-hover:bg-primary-500/20 rounded-xl p-3 transition-colors duration-300">
          <Icon className="text-primary-400 group-hover:text-primary-300 h-6 w-6 transition-colors duration-300" />
        </div>
        <div className="text-success bg-success/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <TrendingUp className="h-3 w-3" />
          <span>Active</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-text-secondary text-sm font-medium">{label}</p>
        <div className="flex items-baseline gap-1">
          {mounted && isInView ? (
            <CountUp
              start={0}
              end={value}
              duration={2}
              delay={delay}
              className="font-heading text-4xl font-bold text-white"
              separator=","
            />
          ) : (
            <span className="font-heading text-4xl font-bold text-white">0</span>
          )}
          {suffix && <span className="text-primary-400 text-xl font-medium">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="mb-12 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-3 text-center">
        <div className="bg-primary-500/10 border-primary-500/20 inline-flex items-center gap-2 rounded-full border px-4 py-2">
          <Zap className="text-primary-400 h-4 w-4" />
          <span className="text-primary-300 text-sm font-semibold">Blueprint Analytics</span>
        </div>
        <h2 className="font-heading text-3xl font-bold text-white">Learning Journey Overview</h2>
        <p className="text-text-secondary mx-auto max-w-2xl">
          Comprehensive analysis of your personalized learning blueprint with key metrics and
          insights
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={Clock}
          label="Total Duration"
          value={totalDuration}
          suffix="hrs"
          delay={0}
        />
        <StatCard icon={Layers} label="Learning Modules" value={modules.length} delay={0.1} />
        <StatCard
          icon={Target}
          label="Learning Objectives"
          value={learningObjectives.length}
          delay={0.2}
        />
        <StatCard icon={BookOpen} label="Resources" value={resources.length} delay={0.3} />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Module Duration Chart */}
        {moduleData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl border border-white/10 p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary-500/10 rounded-lg p-2">
                <BarChart className="text-primary-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">
                  Module Duration Distribution
                </h3>
                <p className="text-text-secondary text-sm">Time allocation across modules</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={moduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#b0c5c6"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#b0c5c6" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1b2a',
                    border: '1px solid rgba(167, 218, 219, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e0e0e0',
                  }}
                  labelStyle={{ color: '#a7dadb' }}
                />
                <Bar
                  dataKey="duration"
                  fill="#a7dadb"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationBegin={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Resource Distribution */}
        {resourceData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl border border-white/10 p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary-500/10 rounded-lg p-2">
                <Users className="text-primary-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">Resource Types</h3>
                <p className="text-text-secondary text-sm">Distribution by category</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={400}
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1b2a',
                    border: '1px solid rgba(167, 218, 219, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#e0e0e0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Learning Objectives Section */}
      {learningObjectives.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl border border-white/10 p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary-500/10 rounded-lg p-2">
              <Award className="text-primary-400 h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-white">Learning Objectives</h3>
              <p className="text-text-secondary text-sm">
                {learningObjectives.length} key objectives to master
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {learningObjectives.slice(0, 6).map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                className="group flex items-start gap-3 rounded-lg bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="text-primary-400 group-hover:text-primary-300 h-5 w-5 transition-colors duration-300" />
                </div>
                <p className="text-text-secondary group-hover:text-text-primary text-sm transition-colors duration-300">
                  {objective}
                </p>
              </motion.div>
            ))}
          </div>
          {learningObjectives.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-4 text-center"
            >
              <span className="text-primary-400 text-sm font-medium">
                +{learningObjectives.length - 6} more objectives
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Modules Overview */}
      {modules.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl border border-white/10 p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary-500/10 rounded-lg p-2">
              <Layers className="text-primary-400 h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-white">Module Breakdown</h3>
              <p className="text-text-secondary text-sm">Detailed view of each learning module</p>
            </div>
          </div>
          <div className="space-y-4">
            {modules.slice(0, 5).map((module, index) => {
              const duration = typeof module.duration === 'number' ? module.duration : 0;
              const topicCount = Array.isArray(module.topics) ? module.topics.length : 0;
              const activityCount = Array.isArray(module.activities) ? module.activities.length : 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  className="hover:border-primary-500/30 group rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="group-hover:text-primary-300 mb-1 text-base font-semibold text-white transition-colors duration-300">
                        {module.title}
                      </h4>
                      <div className="text-text-secondary flex flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {duration}h
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {topicCount} topics
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {activityCount} activities
                        </span>
                      </div>
                    </div>
                    <div className="bg-primary-500/10 text-primary-400 flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
                      Module {index + 1}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '100%' } : { width: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="from-primary-500 to-primary-400 h-full rounded-full bg-gradient-to-r"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          {modules.length > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-4 text-center"
            >
              <button className="text-primary-400 hover:text-primary-300 group mx-auto flex items-center gap-2 text-sm font-medium transition-colors duration-300">
                <span>View all {modules.length} modules</span>
                <TrendingUp className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
