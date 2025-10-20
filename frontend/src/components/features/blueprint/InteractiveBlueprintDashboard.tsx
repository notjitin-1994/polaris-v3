'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Target,
  Layers,
  Maximize2,
  Minimize2,
  FileText,
  Leaf,
  Wand2,
  ChevronDown,
  Users,
} from 'lucide-react';
import { ObjectivesInfographic } from './infographics/ObjectivesInfographic';
import { TargetAudienceInfographic } from './infographics/TargetAudienceInfographic';
import { AssessmentStrategyInfographic } from './infographics/AssessmentStrategyInfographic';
import { SuccessMetricsInfographic } from './infographics/SuccessMetricsInfographic';
import { TimelineInfographic } from './infographics/TimelineInfographic';
import { RiskMitigationInfographic } from './infographics/RiskMitigationInfographic';
import { BudgetResourcesInfographic } from './infographics/BudgetResourcesInfographic';
import { ExecutiveSummaryInfographic } from './infographics/ExecutiveSummaryInfographic';
import { ContentOutlineInfographic } from './infographics/ContentOutlineInfographic';
import { InstructionalStrategyInfographic } from './infographics/InstructionalStrategyInfographic';
import { SustainabilityPlanInfographic } from './infographics/SustainabilityPlanInfographic';
import type { BlueprintJSON } from './types';
import CountUp from 'react-countup';
import { useMobileDetect } from '@/lib/hooks/useMobileDetect';

interface InteractiveBlueprintDashboardProps {
  blueprint: BlueprintJSON;
  isPublicView?: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  description: string;
  defaultExpanded?: boolean;
}

export function InteractiveBlueprintDashboard({
  blueprint,
  isPublicView = false,
}: InteractiveBlueprintDashboardProps): React.JSX.Element {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set() // All sections collapsed by default
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { shouldReduceAnimations } = useMobileDetect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track animation state once to prevent flickering
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  // Extract data from blueprint
  const modules = blueprint.content_outline?.modules || [];
  const objectives = blueprint.learning_objectives?.objectives || [];
  const totalDuration = modules.reduce((sum, module) => {
    const duration = module.duration || '';
    const weeks = duration.match(/(\d+)\s*(?:week|weeks|wk|w)\b/i);
    const days = duration.match(/(\d+)\s*(?:day|days|d)\b/i);
    const hours = duration.match(/(\d+)\s*(?:hour|hours|hr|h)\b/i);
    const minutes = duration.match(/(\d+)\s*(?:minute|minutes|min|m)\b/i);

    // Convert to learning hours (not calendar hours):
    // 1 week = 10 study hours, 1 day = 2 study hours
    const totalHours =
      (weeks ? parseInt(weeks[1]) * 10 : 0) +
      (days ? parseInt(days[1]) * 2 : 0) +
      (hours ? parseInt(hours[1]) : 0) +
      (minutes ? parseInt(minutes[1]) / 60 : 0);

    return sum + totalHours;
  }, 0);

  // Build sections array dynamically based on available data
  // Note: Executive Summary is now shown at top (non-collapsible), so excluded from sections
  const sections: SectionDef[] = [];

  if (blueprint.learning_objectives) {
    sections.push({
      id: 'learning_objectives',
      title: 'Learning Objectives',
      icon: Target,
      gradient: 'bg-success/20',
      iconColor: 'text-success',
      description: `${objectives.length} objectives to achieve • Target completion rates and KPIs defined`,
      defaultExpanded: true,
    });
  }

  if (blueprint.target_audience) {
    const demographics = blueprint.target_audience.demographics;
    const rolesCount = demographics?.roles?.length || 0;
    const learningPrefs = blueprint.target_audience.learning_preferences;
    const modalitiesCount = learningPrefs?.modalities?.length || 0;

    sections.push({
      id: 'target_audience',
      title: 'Target Audience',
      icon: Users,
      gradient: 'bg-secondary/20',
      iconColor: 'text-secondary',
      description: `${rolesCount} target roles • ${modalitiesCount} learning modalities • Demographics and preferences analyzed`,
    });
  }

  if (blueprint.content_outline) {
    const totalActivities = modules.reduce(
      (sum, m) => sum + (m.learning_activities?.length || 0),
      0
    );
    const totalTopics = modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);

    sections.push({
      id: 'content_outline',
      title: 'Content Outline',
      icon: BookOpen,
      gradient: 'bg-primary/20',
      iconColor: 'text-primary',
      description: `${modules.length} comprehensive learning modules • ${totalActivities} activities • ${totalTopics} topics covered`,
    });
  }

  if (blueprint.resources) {
    const budget = blueprint.resources.budget;
    const budgetTotal = budget?.total || 0;
    const humanResources = blueprint.resources.human_resources || [];
    const tools = blueprint.resources.tools_and_platforms || [];

    sections.push({
      id: 'resources',
      title: 'Resources & Budget',
      icon: DollarSign,
      gradient: 'bg-success/20',
      iconColor: 'text-success',
      description: `${budgetTotal > 0 ? `${budget?.currency || 'USD'} ${budgetTotal.toLocaleString()} budget` : 'Budget analysis'} • ${humanResources.length} team roles • ${tools.length} platforms`,
    });
  }

  if (blueprint.assessment_strategy) {
    const kpis = blueprint.assessment_strategy.kpis || [];
    const evalMethods = blueprint.assessment_strategy.evaluation_methods || [];

    sections.push({
      id: 'assessment_strategy',
      title: 'Assessment Strategy',
      icon: BarChart3,
      gradient: 'bg-primary/20',
      iconColor: 'text-primary',
      description: `${kpis.length} KPIs defined • ${evalMethods.length} evaluation methods • Comprehensive measurement framework`,
    });
  }

  if (blueprint.implementation_timeline) {
    const phases = blueprint.implementation_timeline.phases || [];
    const totalMilestones = phases.reduce((sum, p) => sum + (p.milestones?.length || 0), 0);
    const criticalPath = blueprint.implementation_timeline.critical_path || [];

    sections.push({
      id: 'implementation_timeline',
      title: 'Implementation Timeline',
      icon: Calendar,
      gradient: 'bg-secondary/20',
      iconColor: 'text-secondary',
      description: `${phases.length} phases from start to finish • ${totalMilestones} milestones • ${criticalPath.length} critical path items`,
    });
  }

  if (blueprint.risk_mitigation) {
    const risks = blueprint.risk_mitigation.risks || [];
    const contingencyPlans = blueprint.risk_mitigation.contingency_plans || [];
    const highImpactRisks = risks.filter((r) => r.impact?.toLowerCase() === 'high').length;

    sections.push({
      id: 'risk_mitigation',
      title: 'Risk Mitigation',
      icon: Shield,
      gradient: 'bg-warning/20',
      iconColor: 'text-warning',
      description: `${risks.length} risks identified and addressed • ${highImpactRisks} high-impact • ${contingencyPlans.length} contingency plans`,
    });
  }

  if (blueprint.success_metrics) {
    const metrics = blueprint.success_metrics.metrics || [];
    const reportingCadence = blueprint.success_metrics.reporting_cadence || 'Not specified';

    sections.push({
      id: 'success_metrics',
      title: 'Success Metrics',
      icon: TrendingUp,
      gradient: 'bg-success/20',
      iconColor: 'text-success',
      description: `${metrics.length} success metrics tracked • ${reportingCadence} reporting • Performance dashboard requirements`,
    });
  }

  if (blueprint.instructional_strategy) {
    const modalities = blueprint.instructional_strategy.modalities || [];
    const accessibilityCount =
      blueprint.instructional_strategy.accessibility_considerations?.length || 0;

    sections.push({
      id: 'instructional_strategy',
      title: 'Instructional Strategy',
      icon: FileText,
      gradient: 'bg-primary/20',
      iconColor: 'text-primary',
      description: `${modalities.length} delivery modalities • ${accessibilityCount} accessibility considerations • Cohort model defined`,
    });
  }

  if (blueprint.sustainability_plan) {
    const maintenanceSchedule = blueprint.sustainability_plan.maintenance_schedule;
    const scalingConsiderations = blueprint.sustainability_plan.scaling_considerations || [];

    sections.push({
      id: 'sustainability_plan',
      title: 'Sustainability Plan',
      icon: Leaf,
      gradient: 'bg-success/20',
      iconColor: 'text-success',
      description: `${maintenanceSchedule?.review_frequency || 'Regular'} reviews • ${scalingConsiderations.length} scaling strategies • Long-term viability ensured`,
    });
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!expandedSections.has(sectionId)) {
      toggleSection(sectionId);
    }
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Animation variants - optimized for mobile performance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceAnimations ? 0.01 : 0.05,
        delayChildren: shouldReduceAnimations ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceAnimations ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceAnimations
        ? { duration: 0.15 }
        : {
            type: 'spring',
            stiffness: 100,
            damping: 12,
          },
    },
  };

  const MetricCard = React.memo(
    ({
      icon: Icon,
      label,
      value,
      suffix = '',
      gradient,
      delay = 0,
    }: {
      icon: React.ElementType;
      label: string;
      value: number;
      suffix?: string;
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
          initial={{ opacity: 0, y: 20 }}
          animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay }}
          whileHover={shouldReduceAnimations ? undefined : { scale: 1.02, y: -5 }}
          className="group glass-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:shadow-2xl"
        >
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
            </div>
            <div className="space-y-2">
              <p className="text-text-secondary text-sm font-medium">{label}</p>
              <div className="flex items-baseline gap-1">
                {mounted && hasAnimated ? (
                  shouldReduceAnimations ? (
                    <span className="text-4xl font-bold text-white">
                      {suffix === 'hrs' ? value.toFixed(1) : value.toLocaleString()}
                    </span>
                  ) : (
                    <CountUp
                      start={0}
                      end={value}
                      duration={2}
                      delay={delay}
                      decimals={suffix === 'hrs' ? 1 : 0}
                      className="text-4xl font-bold text-white"
                      separator=","
                    />
                  )
                ) : (
                  <span className="text-4xl font-bold text-white">0</span>
                )}
                {suffix && <span className="text-primary text-xl font-medium">{suffix}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
  );

  MetricCard.displayName = 'MetricCard';

  const StatCard = (_children: { children: React.ReactNode }) => {
    return (
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          icon={Clock}
          label="Total Duration"
          value={totalDuration}
          suffix="hrs"
          gradient="bg-primary/20"
          delay={0.1}
        />
        <MetricCard
          icon={BookOpen}
          label="Modules"
          value={totalModules}
          gradient="bg-secondary/20"
          delay={0.2}
        />
        <MetricCard
          icon={Target}
          label="Learning Objectives"
          value={totalObjectives}
          gradient="bg-success/20"
          delay={0.3}
        />
        <MetricCard
          icon={Layers}
          label="Activities"
          value={totalActivities}
          gradient="bg-warning/20"
          delay={0.4}
        />
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceAnimations ? false : 'hidden'}
      animate={shouldReduceAnimations ? false : hasAnimated ? 'visible' : 'hidden'}
      variants={shouldReduceAnimations ? undefined : containerVariants}
      className="relative space-y-8"
    >
      {/* Executive Summary - Non-Collapsible */}
      {blueprint.executive_summary && (
        <motion.div variants={itemVariants} className="space-y-4">
          <ExecutiveSummaryInfographic
            content={blueprint.executive_summary.content}
            metadata={blueprint.metadata}
            isPublicView={isPublicView}
          />
        </motion.div>
      )}

      <StatCard />

      {/* Section Navigator */}
      <motion.div variants={itemVariants}>
        <div className="bg-background relative rounded-lg border border-neutral-200">
          {/* All Sections Grid */}
          <div className="px-4 py-3">
            <div className="text-primary mb-3 text-xs font-medium">Quick Navigation</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center justify-center rounded-md px-3 py-2 text-center transition-all duration-150 ${
                      isExpanded
                        ? 'bg-primary/15 text-primary border-primary/20 border'
                        : 'text-text-secondary/70 hover:text-text-secondary hover:bg-foreground/5'
                    }`}
                  >
                    <span
                      className={`text-xs leading-tight ${isExpanded ? 'font-medium' : 'font-normal'}`}
                    >
                      {section.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="border-t border-white/5 px-4 py-2.5">
            <div className="text-text-secondary/80 flex items-center justify-between text-xs">
              <span>{expandedSections.size} sections expanded</span>
              <span className="text-primary/80 font-medium">
                {sections.length > 0
                  ? Math.round((expandedSections.size / sections.length) * 100)
                  : 0}
                % explored
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    sections.length > 0
                      ? `${(expandedSections.size / sections.length) * 100}%`
                      : '0%',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Bar */}
      <motion.div variants={itemVariants} className="mt-8 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="border-primary-500/30 bg-primary-500/10 hover:bg-primary-500/20 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-white transition-all"
          >
            <Maximize2 className="h-4 w-4" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Minimize2 className="h-4 w-4" />
            Collapse All
          </button>
        </div>
        <div className="text-text-secondary text-sm">
          {expandedSections.size} of {sections.length} sections expanded
        </div>
      </motion.div>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Learning Objectives */}
        {blueprint.learning_objectives && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'learning_objectives')!}
            isExpanded={expandedSections.has('learning_objectives')}
            onToggle={() => toggleSection('learning_objectives')}
            ref={(el) => {
              sectionRefs.current['objectives'] = el;
            }}
            isPublicView={isPublicView}
          >
            <ObjectivesInfographic
              objectives={objectives}
              chartConfig={blueprint.learning_objectives.chartConfig}
            />
          </ExpandableSection>
        )}

        {/* Target Audience */}
        {blueprint.target_audience && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'target_audience')!}
            isExpanded={expandedSections.has('target_audience')}
            onToggle={() => toggleSection('target_audience')}
            ref={(el) => {
              sectionRefs.current['target_audience'] = el;
            }}
            isPublicView={isPublicView}
          >
            <TargetAudienceInfographic data={blueprint.target_audience} />
          </ExpandableSection>
        )}

        {/* Content Outline */}
        {blueprint.content_outline && modules.length > 0 && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'content_outline')!}
            isExpanded={expandedSections.has('content_outline')}
            onToggle={() => toggleSection('content_outline')}
            ref={(el) => {
              sectionRefs.current['content_outline'] = el;
            }}
            isPublicView={isPublicView}
          >
            <ContentOutlineInfographic modules={modules} />
          </ExpandableSection>
        )}

        {/* Resources & Budget */}
        {blueprint.resources && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'resources')!}
            isExpanded={expandedSections.has('resources')}
            onToggle={() => toggleSection('resources')}
            ref={(el) => {
              sectionRefs.current['resources'] = el;
            }}
            isPublicView={isPublicView}
          >
            <BudgetResourcesInfographic
              budget={blueprint.resources.budget}
              human_resources={blueprint.resources.human_resources}
              tools_and_platforms={blueprint.resources.tools_and_platforms}
            />
          </ExpandableSection>
        )}

        {/* Assessment Strategy */}
        {blueprint.assessment_strategy && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'assessment_strategy')!}
            isExpanded={expandedSections.has('assessment_strategy')}
            onToggle={() => toggleSection('assessment_strategy')}
            ref={(el) => {
              sectionRefs.current['assessment'] = el;
            }}
            isPublicView={isPublicView}
          >
            <AssessmentStrategyInfographic
              kpis={blueprint.assessment_strategy.kpis}
              overview={blueprint.assessment_strategy.overview}
              evaluationMethods={blueprint.assessment_strategy.evaluation_methods}
              chartConfig={blueprint.assessment_strategy.chartConfig}
            />
          </ExpandableSection>
        )}

        {/* Implementation Timeline */}
        {blueprint.implementation_timeline && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'implementation_timeline')!}
            isExpanded={expandedSections.has('implementation_timeline')}
            onToggle={() => toggleSection('implementation_timeline')}
            ref={(el) => {
              sectionRefs.current['timeline'] = el;
            }}
            isPublicView={isPublicView}
          >
            <TimelineInfographic
              phases={blueprint.implementation_timeline.phases}
              critical_path={blueprint.implementation_timeline.critical_path}
            />
          </ExpandableSection>
        )}

        {/* Risk Mitigation */}
        {blueprint.risk_mitigation && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'risk_mitigation')!}
            isExpanded={expandedSections.has('risk_mitigation')}
            onToggle={() => toggleSection('risk_mitigation')}
            ref={(el) => {
              sectionRefs.current['risks'] = el;
            }}
            isPublicView={isPublicView}
          >
            <RiskMitigationInfographic
              risks={blueprint.risk_mitigation.risks}
              contingency_plans={blueprint.risk_mitigation.contingency_plans}
            />
          </ExpandableSection>
        )}

        {/* Success Metrics */}
        {blueprint.success_metrics && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'success_metrics')!}
            isExpanded={expandedSections.has('success_metrics')}
            onToggle={() => toggleSection('success_metrics')}
            ref={(el) => {
              sectionRefs.current['metrics'] = el;
            }}
            isPublicView={isPublicView}
          >
            <SuccessMetricsInfographic
              metrics={blueprint.success_metrics.metrics}
              reportingCadence={blueprint.success_metrics.reporting_cadence}
            />
          </ExpandableSection>
        )}

        {/* Instructional Strategy */}
        {blueprint.instructional_strategy && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'instructional_strategy')!}
            isExpanded={expandedSections.has('instructional_strategy')}
            onToggle={() => toggleSection('instructional_strategy')}
            ref={(el) => {
              sectionRefs.current['strategy'] = el;
            }}
            isPublicView={isPublicView}
          >
            <InstructionalStrategyInfographic
              overview={blueprint.instructional_strategy.overview}
              modalities={blueprint.instructional_strategy.modalities}
              cohort_model={blueprint.instructional_strategy.cohort_model}
              accessibility_considerations={
                blueprint.instructional_strategy.accessibility_considerations
              }
            />
          </ExpandableSection>
        )}

        {/* Sustainability Plan */}
        {blueprint.sustainability_plan && (
          <ExpandableSection
            section={sections.find((s) => s.id === 'sustainability_plan')!}
            isExpanded={expandedSections.has('sustainability_plan')}
            onToggle={() => toggleSection('sustainability_plan')}
            ref={(el) => {
              sectionRefs.current['sustainability'] = el;
            }}
            isPublicView={isPublicView}
          >
            <SustainabilityPlanInfographic
              content={blueprint.sustainability_plan.content}
              maintenance_schedule={blueprint.sustainability_plan.maintenance_schedule}
              scaling_considerations={blueprint.sustainability_plan.scaling_considerations}
            />
          </ExpandableSection>
        )}
      </div>
    </motion.div>
  );
}

// Expandable Section Component
const ExpandableSection = React.forwardRef<
  HTMLDivElement,
  {
    section: SectionDef;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isPublicView?: boolean;
  }
>(({ section, isExpanded, onToggle, children, isPublicView = false }, ref) => {
  const Icon = section.icon;

  const handleModify = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Modify ${section.title}`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden rounded-2xl border border-white/10 transition-all"
    >
      {/* Section Header - Always Visible, Clickable */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-white/5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className={`rounded-xl p-3 ${section.gradient}`}>
            <Icon className={`h-6 w-6 ${section.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{section.title}</h3>
            <p className="text-text-secondary text-sm">{section.description}</p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="ml-4 flex shrink-0 items-center gap-2">
          {/* AI Modify Button with Vibrant Glow & Pulse - Hidden in public view */}
          {isExpanded && !isPublicView && (
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 15px rgba(167,218,219,0.5)',
                  '0 0 20px rgba(167,218,219,0.7)',
                  '0 0 15px rgba(167,218,219,0.5)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleModify(e);
              }}
              className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_25px_rgba(167,218,219,0.8)]"
              title="Modify with AI"
              aria-label="Modify section with AI"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleModify(e as React.KeyboardEvent);
                }
              }}
            >
              <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
            </motion.div>
          )}

          {/* Collapse/Expand Button */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-white/5 p-2"
          >
            <ChevronDown className="text-text-secondary h-5 w-5" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ExpandableSection.displayName = 'ExpandableSection';
