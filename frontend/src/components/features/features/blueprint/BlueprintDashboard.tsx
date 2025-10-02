'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
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
  CartesianGrid,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import CountUp from 'react-countup';
import {
  Clock,
  BookOpen,
  Target,
  Layers,
  Users,
  TrendingUp,
  CheckCircle2,
  Activity,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { AnyBlueprint } from '@/lib/ollama/schema';

interface BlueprintDashboardProps {
  blueprint: AnyBlueprint;
  isPublicView?: boolean;
}

export function BlueprintDashboard({
  blueprint,
  isPublicView = false,
}: BlueprintDashboardProps): React.JSX.Element {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'duration' | 'topics' | 'activities'>(
    'duration'
  );

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
  const moduleData = modules.slice(0, 8).map((module, index) => ({
    name: module.title.length > 25 ? `${module.title.substring(0, 25)}...` : module.title,
    duration: typeof module.duration === 'number' ? module.duration : 0,
    topics: Array.isArray(module.topics) ? module.topics.length : 0,
    activities: Array.isArray(module.activities) ? module.activities.length : 0,
    index: index + 1,
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

  const totalResources = resourceData.reduce((sum, d) => sum + d.value, 0);

  // Enhanced color palette
  const COLORS = {
    primary: ['#a7dadb', '#7bc5c7', '#d0edf0', '#5ba0a2'],
    secondary: ['#4F46E5', '#7C69F5', '#9F8FFF', '#C4B5FD'],
    accent: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6'],
    gradient: {
      primary: 'bg-primary/20',
      secondary: 'bg-secondary/20',
      success: 'bg-success/20',
      warning: 'bg-warning/20',
    },
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
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
    trend = null,
    gradient,
    delay = 0,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    trend?: number | null;
    gradient: string;
    delay?: number;
  }) => {
    // Derive icon color from gradient
    const iconColor = gradient.includes('primary')
      ? 'text-primary'
      : gradient.includes('secondary')
        ? 'text-secondary'
        : gradient.includes('success')
          ? 'text-success'
          : gradient.includes('warning')
            ? 'text-warning'
            : 'text-primary';

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group glass-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:shadow-2xl"
      >
        {/* Background gradient effect */}
        <div
          className={`absolute inset-0 ${gradient} opacity-5 transition-opacity group-hover:opacity-10`}
        />

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`rounded-xl p-3 ${gradient} bg-opacity-20 transition-transform group-hover:scale-110`}
            >
              <Icon className={`drop-shadow-glow h-6 w-6 ${iconColor}`} />
            </div>
            {trend !== null && (
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                  trend > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
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
                  className="text-4xl font-bold text-white"
                  separator=","
                />
              ) : (
                <span className="text-4xl font-bold text-white">0</span>
              )}
              {suffix && <span className="text-primary text-xl font-medium">{suffix}</span>}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg border border-white/20 p-3 backdrop-blur-xl">
          <p className="text-sm font-semibold text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-text-secondary text-xs">
              {entry.name}: <span className="text-primary font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Enhanced Header */}
      <motion.div variants={itemVariants} className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="border-primary/30 bg-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 backdrop-blur-xl"
        >
          <Sparkles className="text-primary h-5 w-5 animate-pulse" />
          <span className="text-primary text-sm font-bold tracking-wider uppercase">
            Blueprint Analytics
          </span>
          <Sparkles className="text-secondary h-5 w-5 animate-pulse" />
        </motion.div>
        <h2 className="mb-3 text-4xl font-bold text-white">Learning Journey Overview</h2>
        <p className="text-text-secondary mx-auto max-w-3xl text-lg">
          Comprehensive analysis of your personalized learning blueprint with real-time insights and
          progress tracking
        </p>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={Clock}
          label="Total Duration"
          value={totalDuration}
          suffix="hrs"
          trend={12}
          gradient={COLORS.gradient.primary}
          delay={0}
        />
        <StatCard
          icon={Layers}
          label="Learning Modules"
          value={modules.length}
          gradient={COLORS.gradient.secondary}
          delay={0.1}
        />
        <StatCard
          icon={Target}
          label="Objectives"
          value={learningObjectives.length}
          trend={8}
          gradient={COLORS.gradient.success}
          delay={0.2}
        />
        <StatCard
          icon={BookOpen}
          label="Resources"
          value={resources.length}
          gradient={COLORS.gradient.warning}
          delay={0.3}
        />
      </motion.div>

      {/* Interactive Module Metrics */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-3xl border border-white/10 p-8 backdrop-blur-xl"
      >
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-xl p-3">
                <Activity className="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Module Analytics</h3>
                <p className="text-text-secondary text-sm">Deep dive into module metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['duration', 'topics', 'activities'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedMetric === metric
                      ? 'border-primary/50 bg-primary/30 border text-white'
                      : 'text-text-secondary bg-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={moduleData} margin={{ top: 20, right: 30, left: -10, bottom: 60 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a7dadb" stopOpacity={1} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#b0c5c6"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#b0c5c6" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={selectedMetric}
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Enhanced Resource Distribution */}
        {resourceData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-3xl border border-white/10 p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-success/20 rounded-xl p-3">
                <Users className="text-success h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Resource Distribution</h3>
                <p className="text-text-secondary text-sm">Learning materials by type</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.primary.map((color, index) => (
                    <linearGradient
                      key={index}
                      id={`pieGradient${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const name = (props.name ?? '') as string;
                    const value = typeof props.value === 'number' ? props.value : 0;
                    const pct = totalResources > 0 ? Math.round((value / totalResources) * 100) : 0;
                    return `${name}: ${pct}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={400}
                >
                  {resourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient${index % COLORS.primary.length})`}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-3xl border border-white/10 p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-3">
              <Target className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Learning Objectives</h3>
              <p className="text-text-secondary text-sm">
                {learningObjectives.length} key objectives to master
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {learningObjectives.slice(0, 8).map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
                className="group hover:bg-primary/10 hover:border-primary/30 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="text-primary group-hover:text-primary-light h-5 w-5 transition-colors" />
                </div>
                <p className="text-text-secondary group-hover:text-text-primary text-sm transition-colors">
                  {objective}
                </p>
              </motion.div>
            ))}
          </div>

          {learningObjectives.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-6 text-center"
            >
              <button className="border-primary/30 text-primary hover:bg-primary/30 bg-primary/20 inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-all">
                <span>View all {learningObjectives.length} objectives</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
