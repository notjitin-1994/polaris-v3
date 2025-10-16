/**
 * Unified Blueprint Dashboard
 * Intelligently renders blueprints with appropriate visualizations
 * Consolidates BlueprintDashboard + InteractiveBlueprintDashboard
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  Calendar,
  Shield,
  DollarSign,
  BarChart3,
  ChevronLeft,
  FileText,
  Leaf,
  Wand2,
} from 'lucide-react';

// Import specialized infographic components
import type { BlueprintJSON } from './types';
import type { AnyBlueprint } from '@/lib/ollama/schema';
import { useMobileDetect } from '@/lib/hooks/useMobileDetect';
import { renderSectionContent } from './utils/sectionRenderer';
import { ExecutiveSummaryInfographic } from './infographics/ExecutiveSummaryInfographic';

interface UnifiedBlueprintDashboardProps {
  blueprint: BlueprintJSON | AnyBlueprint;
  isPublicView?: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  description: string;
}

// Type guard to check if blueprint is BlueprintJSON format
function isBlueprintJSON(blueprint: any): blueprint is BlueprintJSON {
  return 'metadata' in blueprint && blueprint.metadata?.title !== undefined;
}

export function UnifiedBlueprintDashboard({
  blueprint,
  isPublicView = false,
}: UnifiedBlueprintDashboardProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'duration' | 'topics' | 'activities'>('duration');
  const navigationRef = useRef<HTMLDivElement>(null);
  const { shouldReduceAnimations } = useMobileDetect();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Track animation state once
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  // Scroll navigation to top on interaction
  useEffect(() => {
    if (hasInteracted && navigationRef.current) {
      navigationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [hasInteracted]);

  // Determine blueprint type and extract data
  const isComprehensive = isBlueprintJSON(blueprint);

  // Extract common data
  let modules: any[] = [];
  let objectives: any[] = [];
  let totalDuration = 0;
  let totalActivities = 0;

  if (isComprehensive) {
    modules = blueprint.content_outline?.modules || [];
    objectives = blueprint.learning_objectives?.objectives || [];
    
    // Calculate duration from modules
    totalDuration = modules.reduce((sum, module) => {
      const duration = module.duration || '';
      const weeks = duration.match(/(\d+)\s*(?:week|weeks|wk|w)\b/i);
      const days = duration.match(/(\d+)\s*(?:day|days|d)\b/i);
      const hours = duration.match(/(\d+)\s*(?:hour|hours|hr|h)\b/i);
      const minutes = duration.match(/(\d+)\s*(?:minute|minutes|min|m)\b/i);

      const totalHours =
        (weeks ? parseInt(weeks[1]) * 10 : 0) +
        (days ? parseInt(days[1]) * 2 : 0) +
        (hours ? parseInt(hours[1]) : 0) +
        (minutes ? parseInt(minutes[1]) / 60 : 0);

      return sum + totalHours;
    }, 0);
    
    totalActivities = modules.reduce((sum, m) => sum + (m.learning_activities?.length || 0), 0);
  } else {
    // Simple blueprint format
    modules = 'modules' in blueprint ? blueprint.modules : [];
    objectives = 'learningObjectives' in blueprint ? blueprint.learningObjectives : [];
    totalDuration = modules.reduce((sum, module) => {
      const duration = typeof module.duration === 'number' ? module.duration : 0;
      return sum + duration;
    }, 0);
    totalActivities = modules.reduce((sum, m) => sum + (Array.isArray(m.activities) ? m.activities.length : 0), 0);
  }

  // Build sections for comprehensive blueprints
  const sections: SectionDef[] = [];
  
  if (isComprehensive) {
    if (blueprint.learning_objectives) {
      sections.push({
        id: 'learning_objectives',
        title: 'Learning Objectives',
        icon: Target,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: `${objectives.length} measurable objectives`,
      });
    }

    if (blueprint.target_audience) {
      sections.push({
        id: 'target_audience',
        title: 'Target Audience',
        icon: Users,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: 'Demographics and learning preferences',
      });
    }

    if (blueprint.content_outline) {
      sections.push({
        id: 'content_outline',
        title: 'Content Outline',
        icon: BookOpen,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: `${modules.length} comprehensive learning modules`,
      });
    }

    if (blueprint.resources) {
      sections.push({
        id: 'resources',
        title: 'Resources & Budget',
        icon: DollarSign,
        gradient: 'bg-success/20',
        iconColor: 'text-success',
        description: 'Team, tools, and financial allocation',
      });
    }

    if (blueprint.assessment_strategy) {
      sections.push({
        id: 'assessment_strategy',
        title: 'Assessment Strategy',
        icon: BarChart3,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: 'Evaluation methods and KPIs',
      });
    }

    if (blueprint.implementation_timeline) {
      sections.push({
        id: 'implementation_timeline',
        title: 'Implementation Timeline',
        icon: Calendar,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: `${blueprint.implementation_timeline.phases?.length || 0} phases`,
      });
    }

    if (blueprint.risk_mitigation) {
      sections.push({
        id: 'risk_mitigation',
        title: 'Risk Mitigation',
        icon: Shield,
        gradient: 'bg-warning/20',
        iconColor: 'text-warning',
        description: `${blueprint.risk_mitigation.risks?.length || 0} risks addressed`,
      });
    }

    if (blueprint.success_metrics) {
      sections.push({
        id: 'success_metrics',
        title: 'Success Metrics',
        icon: TrendingUp,
        gradient: 'bg-success/20',
        iconColor: 'text-success',
        description: 'Performance indicators and tracking',
      });
    }

    if (blueprint.instructional_strategy) {
      sections.push({
        id: 'instructional_strategy',
        title: 'Instructional Strategy',
        icon: FileText,
        gradient: 'bg-primary/20',
        iconColor: 'text-primary',
        description: 'Learning approach and methodology',
      });
    }

    if (blueprint.sustainability_plan) {
      sections.push({
        id: 'sustainability_plan',
        title: 'Sustainability Plan',
        icon: Leaf,
        gradient: 'bg-success/20',
        iconColor: 'text-success',
        description: 'Long-term maintenance and scaling',
      });
    }
  }

  // Animation variants - memoized to prevent re-creation
  const containerVariants: Variants = React.useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceAnimations ? 0.02 : 0.08,
        delayChildren: shouldReduceAnimations ? 0 : 0.05,
      },
    },
  }), [shouldReduceAnimations]);

  const itemVariants: Variants = React.useMemo(() => ({
    hidden: {
      opacity: 0,
      y: shouldReduceAnimations ? 0 : 15,
      scale: shouldReduceAnimations ? 1 : 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceAnimations
        ? { duration: 0.2, ease: 'easeOut' }
        : {
            type: 'spring',
            stiffness: 200,
            damping: 20,
            mass: 0.8,
          },
    },
  }), [shouldReduceAnimations]);

  // Stat Card Component - Simplified and reliable
  const StatCard = React.memo(({
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
    const iconColor = gradient.includes('primary')
      ? 'text-primary'
      : gradient.includes('success')
        ? 'text-success'
        : gradient.includes('warning')
          ? 'text-warning'
          : 'text-primary';

    return (
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 min-h-[160px] transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
        {/* Background gradient */}
        <div className={`absolute inset-0 ${gradient} opacity-5 transition-opacity group-hover:opacity-10`} />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon and trend */}
          <div className="mb-4 flex items-start justify-between">
            <div className={`rounded-xl p-3 ${gradient} transition-transform group-hover:scale-110`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            {trend !== null && (
              <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                trend > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          
          {/* Label and value */}
          <div className="space-y-2 mt-auto">
            <p className="text-text-secondary text-sm font-medium uppercase tracking-wide">{label}</p>
            <div className="flex items-baseline gap-2">
              {mounted ? (
                <span className="text-4xl font-bold text-foreground">
                  {suffix === 'hrs' ? value.toFixed(1) : value.toLocaleString()}
                </span>
              ) : (
                <span className="text-4xl font-bold text-foreground">-</span>
              )}
              {suffix && <span className="text-primary text-xl font-medium">{suffix}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Navigation functions for comprehensive view
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      if (!hasInteracted) setHasInteracted(true);
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      if (!hasInteracted) setHasInteracted(true);
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const goToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      if (!hasInteracted) setHasInteracted(true);
      setCurrentSectionIndex(index);
    }
  };

  // Render comprehensive blueprint (BlueprintJSON format)
  if (isComprehensive) {
    const currentSection = sections[currentSectionIndex];

    return (
      <motion.div
        ref={ref}
        initial={shouldReduceAnimations ? false : 'hidden'}
        animate={shouldReduceAnimations ? false : hasAnimated ? 'visible' : 'hidden'}
        variants={containerVariants}
        className="relative space-y-6"
      >
        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Clock}
            label="Total Duration"
            value={totalDuration}
            suffix="hrs"
            gradient="bg-primary/20"
            delay={0}
          />
          <StatCard
            icon={Layers}
            label="Learning Modules"
            value={modules.length}
            gradient="bg-secondary/20"
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label="Learning Objectives"
            value={objectives.length}
            gradient="bg-success/20"
            delay={0.2}
          />
          <StatCard
            icon={BookOpen}
            label="Total Activities"
            value={totalActivities}
            gradient="bg-warning/20"
            delay={0.3}
          />
        </motion.div>

        {/* Executive Summary */}
        {blueprint.executive_summary && (
          <motion.div variants={itemVariants}>
            <ExecutiveSummaryInfographic
              content={blueprint.executive_summary.content}
              metadata={blueprint.metadata}
              isPublicView={isPublicView}
            />
          </motion.div>
        )}

        {/* Section Navigation */}
        <motion.div ref={navigationRef} variants={itemVariants}>
          <div className="relative rounded-lg border border-neutral-200 bg-background">
            {/* Core Sections */}
            <div className="px-4 py-3">
              <div className="text-xs font-medium text-primary mb-3">Core Learning</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {sections.slice(0, 5).map((section, index) => {
                  const isActive = index === currentSectionIndex;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => goToSection(index)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex items-center justify-center rounded-md px-3 py-2 text-center transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-text-secondary/70 hover:text-text-secondary'
                      }`}
                    >
                      <span className={`text-xs leading-tight ${isActive ? 'font-medium' : 'font-normal'}`}>
                        {section.title}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeSectionIndicator"
                          className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Implementation Sections */}
            {sections.length > 5 && (
              <>
                <div className="border-t border-white/5" />
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-primary mb-3">Implementation</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {sections.slice(5).map((section, index) => {
                      const absoluteIndex = 5 + index;
                      const isActive = absoluteIndex === currentSectionIndex;
                      return (
                        <motion.button
                          key={section.id}
                          onClick={() => goToSection(absoluteIndex)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative flex items-center justify-center rounded-md px-3 py-2 text-center transition-all duration-150 ${
                            isActive
                              ? 'bg-primary/15 text-primary'
                              : 'text-text-secondary/70 hover:text-text-secondary'
                          }`}
                        >
                          <span className={`text-xs leading-tight ${isActive ? 'font-medium' : 'font-normal'}`}>
                            {section.title}
                          </span>
                          {isActive && (
                            <motion.div
                              layoutId="activeSectionIndicator"
                              className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Progress */}
            <div className="border-t border-white/5 px-4 py-2.5">
              <div className="flex items-center justify-between text-xs text-text-secondary/80">
                <span>{currentSectionIndex + 1} / {sections.length}</span>
                <span className="font-medium text-primary/80">
                  {Math.round(((currentSectionIndex + 1) / sections.length) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Section */}
        {currentSection && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
                <div className="flex w-full items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${currentSection.gradient}`}>
                      <currentSection.icon className={`h-6 w-6 ${currentSection.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                      <p className="text-text-secondary text-sm">{currentSection.description}</p>
                    </div>
                  </div>

                  {!isPublicView && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-all"
                      title="Enhance with AI"
                      role="button"
                    >
                      <Wand2 className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-white/10 p-6">
                  {renderSectionContent(currentSection.id, blueprint, objectives, modules)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation Controls */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: currentSectionIndex > 0 ? 1.02 : 1 }}
            whileTap={{ scale: currentSectionIndex > 0 ? 0.98 : 1 }}
            onClick={goToPreviousSection}
            disabled={currentSectionIndex === 0}
            className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
              currentSectionIndex === 0
                ? 'cursor-not-allowed bg-white/5 text-white/30'
                : 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary border'
            }`}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${currentSectionIndex > 0 ? 'group-hover:-translate-x-1' : ''}`} />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          <div className="text-text-secondary text-sm">
            Section {currentSectionIndex + 1} of {sections.length}
          </div>

          <motion.button
            whileHover={{ scale: currentSectionIndex < sections.length - 1 ? 1.02 : 1 }}
            whileTap={{ scale: currentSectionIndex < sections.length - 1 ? 0.98 : 1 }}
            onClick={goToNextSection}
            disabled={currentSectionIndex === sections.length - 1}
            className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
              currentSectionIndex === sections.length - 1
                ? 'cursor-not-allowed bg-white/5 text-white/30'
                : 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary border'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className={`h-5 w-5 transition-transform ${currentSectionIndex < sections.length - 1 ? 'group-hover:translate-x-1' : ''}`} />
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Render simple blueprint (legacy format) with charts
  const resources = 'resources' in blueprint && Array.isArray(blueprint.resources) ? blueprint.resources : [];
  
  // Module data for charts
  const moduleData = modules.slice(0, 8).map((module, index) => ({
    name: module.title?.length > 25 ? `${module.title.substring(0, 25)}...` : module.title,
    duration: typeof module.duration === 'number' ? module.duration : 0,
    topics: Array.isArray(module.topics) ? module.topics.length : 0,
    activities: Array.isArray(module.activities) ? module.activities.length : 0,
    index: index + 1,
  }));

  // Resource distribution
  const resourceTypeCount: Record<string, number> = {};
  resources.forEach((resource: any) => {
    const type = resource.type || 'Other';
    resourceTypeCount[type] = (resourceTypeCount[type] || 0) + 1;
  });

  const resourceData = Object.entries(resourceTypeCount).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const totalResources = resourceData.reduce((sum, d) => sum + d.value, 0);

  const COLORS = {
    primary: ['#a7dadb', '#7bc5c7', '#d0edf0', '#5ba0a2'],
  };

  // Custom tooltip
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
      animate={hasAnimated ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="border-primary/30 bg-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 backdrop-blur-xl"
        >
          <Sparkles className="text-primary h-5 w-5 animate-pulse" />
          <span className="text-primary text-sm font-bold tracking-wider uppercase">Blueprint Analytics</span>
          <Sparkles className="text-primary h-5 w-5 animate-pulse" />
        </motion.div>
        <h2 className="mb-3 text-4xl font-bold text-white">Learning Journey Overview</h2>
        <p className="text-text-secondary mx-auto max-w-3xl text-lg">
          Comprehensive analysis of your personalized learning blueprint
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Total Duration"
          value={totalDuration}
          suffix="hrs"
          trend={12}
          gradient="bg-primary/20"
          delay={0}
        />
        <StatCard
          icon={Layers}
          label="Learning Modules"
          value={modules.length}
          gradient="bg-secondary/20"
          delay={0.1}
        />
        <StatCard
          icon={Target}
          label="Objectives"
          value={objectives.length}
          trend={8}
          gradient="bg-success/20"
          delay={0.2}
        />
        <StatCard
          icon={BookOpen}
          label="Resources"
          value={resources.length}
          gradient="bg-warning/20"
          delay={0.3}
        />
      </motion.div>

      {/* Module Analytics */}
      {moduleData.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card rounded-3xl border border-white/10 p-8">
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
              <Bar dataKey={selectedMetric} fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Resource Distribution */}
      {resourceData.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card rounded-3xl border border-white/10 p-8">
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
                  <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
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
                dataKey="value"
                animationDuration={1500}
              >
                {resourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % COLORS.primary.length})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Learning Objectives */}
      {objectives.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card rounded-3xl border border-white/10 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-3">
              <Target className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Learning Objectives</h3>
              <p className="text-text-secondary text-sm">{objectives.length} key objectives to master</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {objectives.slice(0, 8).map((objective: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={hasAnimated ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
                className="group hover:bg-primary/10 hover:border-primary/30 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="text-primary group-hover:text-primary-light h-5 w-5 transition-colors" />
                </div>
                <p className="text-text-secondary group-hover:text-foreground text-sm transition-colors">
                  {typeof objective === 'string' ? objective : objective.title || objective.description}
                </p>
              </motion.div>
            ))}
          </div>

          {objectives.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-6 text-center"
            >
              <button className="border-primary/30 text-primary hover:bg-primary/30 bg-primary/20 inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-all">
                <span>View all {objectives.length} objectives</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}


