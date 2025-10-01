'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Target,
  Layers,
  Sparkles,
  Calendar,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  List,
  X,
  Leaf,
  Wand2,
} from 'lucide-react';
import { ObjectivesInfographic } from './infographics/ObjectivesInfographic';
import { TargetAudienceInfographic } from './infographics/TargetAudienceInfographic';
import { AssessmentStrategyInfographic } from './infographics/AssessmentStrategyInfographic';
import { SuccessMetricsInfographic } from './infographics/SuccessMetricsInfographic';
import { TimelineInfographic } from './infographics/TimelineInfographic';
import { RiskMitigationInfographic } from './infographics/RiskMitigationInfographic';
import { BudgetResourcesInfographic } from './infographics/BudgetResourcesInfographic';
import type { BlueprintJSON } from './types';
import CountUp from 'react-countup';
import { useMobileDetect } from '@/lib/hooks/useMobileDetect';

interface ComprehensiveBlueprintDashboardProps {
  blueprint: BlueprintJSON;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  gradient: string;
  component: React.ReactNode;
  description: string;
}

export function ComprehensiveBlueprintDashboard({
  blueprint,
}: ComprehensiveBlueprintDashboardProps): React.JSX.Element {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set() // All sections collapsed by default
  );
  const [showNav, setShowNav] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { shouldReduceAnimations } = useMobileDetect();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setShowNav(false);
    // Auto-expand when navigating
    if (!expandedSections.has(sectionId)) {
      toggleSection(sectionId);
    }
  };

  const expandAll = () => {
    const allIds = sections.map((s) => s.id);
    setExpandedSections(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Extract data from blueprint
  const modules = blueprint.content_outline?.modules || [];
  const objectives = blueprint.learning_objectives?.objectives || [];
  const totalDuration = modules.reduce((sum, module) => {
    // Parse duration string like "35 minutes" or "2 hours"
    const duration = module.duration || '';
    const hours = duration.match(/(\d+)\s*(?:hour|hours|h)/i);
    const minutes = duration.match(/(\d+)\s*(?:minute|minutes|min|m)/i);
    return sum + (hours ? parseInt(hours[1]) : 0) + (minutes ? parseInt(minutes[1]) / 60 : 0);
  }, 0);

  // Animation variants - optimized for mobile performance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceAnimations ? 0.01 : 0.1,
        delayChildren: shouldReduceAnimations ? 0 : 0.2,
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

  const StatCard = ({
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
    const iconColor = gradient.includes('primary') ? 'text-primary' :
                     gradient.includes('secondary') ? 'text-secondary' :
                     gradient.includes('success') ? 'text-success' :
                     gradient.includes('warning') ? 'text-warning' : 'text-primary';
    
    return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group glass-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:shadow-2xl"
    >
      <div className={`absolute inset-0 ${gradient} opacity-5 transition-opacity group-hover:opacity-10`} />
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <div className={`rounded-xl p-3 ${gradient} bg-opacity-20 transition-transform group-hover:scale-110`}>
            <Icon className={`drop-shadow-glow h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          <div className="flex items-baseline gap-1">
            {mounted && isInView ? (
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
  };

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceAnimations ? false : "hidden"}
      animate={shouldReduceAnimations ? false : (isInView ? 'visible' : 'hidden')}
      variants={shouldReduceAnimations ? undefined : containerVariants}
      className="space-y-8"
    >
      {/* Enhanced Header */}
      <motion.div variants={shouldReduceAnimations ? undefined : itemVariants} className="text-center">
        <motion.div
          initial={shouldReduceAnimations ? false : { scale: 0, rotate: -180 }}
          animate={shouldReduceAnimations ? false : { scale: 1, rotate: 0 }}
          transition={shouldReduceAnimations ? undefined : { delay: 0.3, type: 'spring' }}
          className="border-primary/30 mb-6 inline-flex items-center gap-2 rounded-full border bg-primary/20 px-5 py-2.5 backdrop-blur-xl"
        >
          <Sparkles className="text-primary h-5 w-5 animate-pulse" />
          <span className="text-primary text-sm font-bold tracking-wider uppercase">
            Comprehensive Blueprint Analytics
          </span>
          <Sparkles className="text-secondary h-5 w-5 animate-pulse" />
        </motion.div>
        <h2 className="mb-3 text-4xl font-bold text-white">
          {blueprint.metadata.title}
        </h2>
        <p className="text-text-secondary mx-auto max-w-3xl text-lg">
          {blueprint.executive_summary?.content?.substring(0, 200)}...
        </p>
      </motion.div>

      {/* Enhanced Stats Grid */}
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
          value={modules.reduce((sum, m) => sum + (m.learning_activities?.length || 0), 0)}
          gradient="bg-warning/20"
          delay={0.3}
        />
      </motion.div>

      {/* Executive Summary */}
      {blueprint.executive_summary && (
        <SectionCard
          icon={Sparkles}
          title="Executive Summary"
          description="Overview and key highlights"
          gradient="bg-primary/20"
          iconColor="text-primary"
          onModify={() => console.log('Modify Executive Summary')}
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary leading-relaxed">{blueprint.executive_summary.content}</p>
          </div>
        </SectionCard>
      )}

      {/* Learning Objectives */}
      {blueprint.learning_objectives && (
        <SectionCard
          icon={Target}
          title="Learning Objectives"
          description={`${objectives.length} objectives to achieve`}
          gradient="bg-success/20"
          iconColor="text-success"
          onModify={() => console.log('Modify Learning Objectives')}
        >
          <ObjectivesInfographic objectives={objectives} chartConfig={blueprint.learning_objectives.chartConfig} />
        </SectionCard>
      )}

      {/* Target Audience */}
      {blueprint.target_audience && (
        <SectionCard
          icon={Users}
          title="Target Audience"
          description="Demographics and learning preferences"
          gradient="bg-secondary/20"
          iconColor="text-secondary"
          onModify={() => console.log('Modify Target Audience')}
        >
          <TargetAudienceInfographic data={blueprint.target_audience} />
        </SectionCard>
      )}

      {/* Content Outline / Modules */}
      {blueprint.content_outline && modules.length > 0 && (
        <SectionCard
          icon={BookOpen}
          title="Content Outline"
          description={`${modules.length} comprehensive learning modules`}
          gradient="bg-primary/20"
          iconColor="text-primary"
          onModify={() => console.log('Modify Content Outline')}
        >
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={index} className="glass-strong rounded-xl border border-white/10 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="mb-2 text-xl font-bold text-white">
                      {index + 1}. {module.title}
                    </h4>
                    <p className="text-text-secondary text-sm">{module.description}</p>
                  </div>
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-slate-900">
                    {module.duration}
                  </span>
                </div>

                {module.topics && module.topics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-text-secondary mb-2 text-sm font-semibold">Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic, tIndex) => (
                        <span
                          key={tIndex}
                          className="rounded-lg bg-primary/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {module.learning_activities && module.learning_activities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-text-secondary mb-2 text-sm font-semibold">Learning Activities:</p>
                    <div className="space-y-2">
                      {module.learning_activities.map((activity, aIndex) => (
                        <div key={aIndex} className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3">
                          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-slate-900">{activity.type}:</span>
                          <span className="flex-1 text-sm text-foreground">{activity.activity}</span>
                          <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-slate-900">{activity.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {module.assessment && (
                  <div className="rounded-lg border border-success/30 bg-success/20 p-4">
                    <p className="mb-1 text-sm font-bold text-slate-900">
                      <span className="rounded bg-success px-2 py-1 text-xs font-bold text-slate-900">Assessment</span>
                      <span className="ml-2">{module.assessment.type}</span>
                    </p>
                    <p className="text-sm text-foreground">{module.assessment.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Resources & Budget */}
      {blueprint.resources && (
        <SectionCard
          icon={DollarSign}
          title="Resources & Budget"
          description="Team, tools, and financial allocation"
          gradient="bg-success/20"
          iconColor="text-success"
          onModify={() => console.log('Modify Resources & Budget')}
        >
          <BudgetResourcesInfographic
            budget={blueprint.resources.budget}
            human_resources={blueprint.resources.human_resources}
            tools_and_platforms={blueprint.resources.tools_and_platforms}
          />
        </SectionCard>
      )}

      {/* Assessment Strategy */}
      {blueprint.assessment_strategy && (
        <SectionCard
          icon={BarChart3}
          title="Assessment Strategy"
          description="Evaluation methods and KPIs"
          gradient="bg-primary/20"
          iconColor="text-primary"
          onModify={() => console.log('Modify Assessment Strategy')}
        >
          <AssessmentStrategyInfographic
            kpis={blueprint.assessment_strategy.kpis}
            overview={blueprint.assessment_strategy.overview}
            evaluationMethods={blueprint.assessment_strategy.evaluation_methods}
            chartConfig={blueprint.assessment_strategy.chartConfig}
          />
        </SectionCard>
      )}

      {/* Implementation Timeline */}
      {blueprint.implementation_timeline && (
        <SectionCard
          icon={Calendar}
          title="Implementation Timeline"
          description={`${blueprint.implementation_timeline.phases.length} phases from start to finish`}
          gradient="bg-secondary/20"
          iconColor="text-secondary"
          onModify={() => console.log('Modify Implementation Timeline')}
        >
          <TimelineInfographic
            phases={blueprint.implementation_timeline.phases}
            critical_path={blueprint.implementation_timeline.critical_path}
          />
        </SectionCard>
      )}

      {/* Risk Mitigation */}
      {blueprint.risk_mitigation && (
        <SectionCard
          icon={Shield}
          title="Risk Mitigation"
          description={`${blueprint.risk_mitigation.risks.length} risks identified and addressed`}
          gradient="bg-warning/20"
          iconColor="text-warning"
          onModify={() => console.log('Modify Risk Mitigation')}
        >
          <RiskMitigationInfographic
            risks={blueprint.risk_mitigation.risks}
            contingency_plans={blueprint.risk_mitigation.contingency_plans}
          />
        </SectionCard>
      )}

      {/* Success Metrics */}
      {blueprint.success_metrics && (
        <SectionCard
          icon={TrendingUp}
          title="Success Metrics"
          description="Key performance indicators and measurement"
          gradient="bg-success/20"
          iconColor="text-success"
          onModify={() => console.log('Modify Success Metrics')}
        >
          <SuccessMetricsInfographic
            metrics={blueprint.success_metrics.metrics}
            reportingCadence={blueprint.success_metrics.reporting_cadence}
          />
        </SectionCard>
      )}

      {/* Instructional Strategy & Sustainability Plan as markdown sections */}
      {blueprint.instructional_strategy && (
        <SectionCard
          icon={BookOpen}
          title="Instructional Strategy"
          description="Learning approach and methodology"
          gradient="bg-primary/20"
          iconColor="text-primary"
          onModify={() => console.log('Modify Instructional Strategy')}
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-6 leading-relaxed">{blueprint.instructional_strategy.overview}</p>

            <h4 className="mb-4 text-lg font-semibold text-white">Learning Modalities</h4>
            <div className="space-y-4">
              {blueprint.instructional_strategy.modalities.map((modality, index) => (
                <div key={index} className="glass rounded-xl border border-white/10 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="font-semibold text-white">{modality.type}</h5>
                    <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-slate-900">{modality.allocation_percent}%</span>
                  </div>
                  <p className="text-text-secondary text-sm">{modality.rationale}</p>
                  {modality.tools && modality.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {modality.tools.map((tool, tIndex) => (
                        <span key={tIndex} className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-slate-900">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {blueprint.sustainability_plan && (
        <SectionCard
          icon={Leaf}
          title="Sustainability Plan"
          description="Long-term maintenance and scaling"
          gradient="bg-success/20"
          iconColor="text-success"
          onModify={() => console.log('Modify Sustainability Plan')}
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary leading-relaxed">{blueprint.sustainability_plan.content}</p>
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  gradient,
  iconColor = 'text-primary',
  children,
  onModify,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor?: string;
  children: React.ReactNode;
  onModify?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl border border-white/10 overflow-hidden"
    >
      {/* Section Header - Always Visible, Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-8 text-left transition-all hover:bg-white/5"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={`rounded-xl p-3 ${gradient}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-text-secondary text-sm">{description}</p>
          </div>
        </div>

        {/* Right Side Controls - Only visible when expanded */}
        <div className="flex shrink-0 items-center gap-2 ml-4">
          {isExpanded && onModify && (
            <motion.button
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
                onModify();
              }}
              className="pressable inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_25px_rgba(167,218,219,0.8)]"
              title="Modify with AI"
              aria-label="Modify section with AI"
            >
              <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
            </motion.button>
          )}

          {/* Collapse/Expand Button */}
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
          >
            <ChevronUp className="text-text-secondary h-5 w-5" />
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
            <div className="border-t border-white/10 px-8 pb-8 pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

