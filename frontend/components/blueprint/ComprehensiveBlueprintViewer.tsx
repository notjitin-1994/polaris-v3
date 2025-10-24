'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  BarChart3,
  Calendar,
  Shield,
  TrendingUp,
  FileText,
  Leaf,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { BlueprintJSON } from './types';
import { ObjectivesInfographic } from '@/src/components/features/blueprint/infographics/ObjectivesInfographic';
import { TargetAudienceInfographic } from '@/src/components/features/blueprint/infographics/TargetAudienceInfographic';
import { AssessmentStrategyInfographic } from '@/src/components/features/blueprint/infographics/AssessmentStrategyInfographic';
import { SuccessMetricsInfographic } from '@/src/components/features/blueprint/infographics/SuccessMetricsInfographic';
import { TimelineInfographic } from '@/src/components/features/blueprint/infographics/TimelineInfographic';
import { RiskMitigationInfographic } from '@/src/components/features/blueprint/infographics/RiskMitigationInfographic';
import { BudgetResourcesInfographic } from '@/src/components/features/blueprint/infographics/BudgetResourcesInfographic';
import { ContentOutlineInfographic } from '@/src/components/features/blueprint/infographics/ContentOutlineInfographic';
import { InstructionalStrategyInfographic } from '@/src/components/features/blueprint/infographics/InstructionalStrategyInfographic';
import { SustainabilityPlanInfographic } from '@/src/components/features/blueprint/infographics/SustainabilityPlanInfographic';
import CountUp from 'react-countup';

interface ComprehensiveBlueprintViewerProps {
  blueprint: BlueprintJSON;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
}

export function ComprehensiveBlueprintViewer({
  blueprint,
}: ComprehensiveBlueprintViewerProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Extract metrics
  const modules = blueprint.content_outline?.modules || [];
  const objectives = blueprint.learning_objectives?.objectives || [];
  const totalActivities = modules.reduce((sum, m) => sum + (m.learning_activities?.length || 0), 0);
  const totalTopics = modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);

  const totalDuration = modules.reduce((sum, module) => {
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

  // Build sections configuration
  const sections: SectionConfig[] = [];

  if (blueprint.learning_objectives) {
    sections.push({
      id: 'learning_objectives',
      title: 'Learning Objectives',
      icon: Target,
      iconColor: 'text-success',
      description: `${objectives.length} key objectives with measurable outcomes`,
    });
  }

  if (blueprint.target_audience) {
    sections.push({
      id: 'target_audience',
      title: 'Target Audience',
      icon: Users,
      iconColor: 'text-secondary',
      description: 'Demographic analysis and learning preferences',
    });
  }

  if (blueprint.content_outline) {
    sections.push({
      id: 'content_outline',
      title: 'Content Outline',
      icon: BookOpen,
      iconColor: 'text-primary',
      description: `${modules.length} modules with structured learning path`,
    });
  }

  if (blueprint.resources) {
    sections.push({
      id: 'resources',
      title: 'Resources & Budget',
      icon: DollarSign,
      iconColor: 'text-success',
      description: 'Budget allocation and resource requirements',
    });
  }

  if (blueprint.assessment_strategy) {
    sections.push({
      id: 'assessment_strategy',
      title: 'Assessment Strategy',
      icon: BarChart3,
      iconColor: 'text-primary',
      description: 'KPIs and evaluation methodologies',
    });
  }

  if (blueprint.implementation_timeline) {
    sections.push({
      id: 'implementation_timeline',
      title: 'Implementation Timeline',
      icon: Calendar,
      iconColor: 'text-secondary',
      description: 'Phased rollout with milestones',
    });
  }

  if (blueprint.risk_mitigation) {
    sections.push({
      id: 'risk_mitigation',
      title: 'Risk Mitigation',
      icon: Shield,
      iconColor: 'text-warning',
      description: 'Risk identification and mitigation strategies',
    });
  }

  if (blueprint.success_metrics) {
    sections.push({
      id: 'success_metrics',
      title: 'Success Metrics',
      icon: TrendingUp,
      iconColor: 'text-success',
      description: 'Performance tracking and reporting',
    });
  }

  if (blueprint.instructional_strategy) {
    sections.push({
      id: 'instructional_strategy',
      title: 'Instructional Strategy',
      icon: FileText,
      iconColor: 'text-primary',
      description: 'Delivery methods and pedagogical approach',
    });
  }

  if (blueprint.sustainability_plan) {
    sections.push({
      id: 'sustainability_plan',
      title: 'Sustainability Plan',
      icon: Leaf,
      iconColor: 'text-success',
      description: 'Long-term maintenance and scaling',
    });
  }

  return (
    <div className="space-y-6">
      {/* Strategic Overview Section */}
      {blueprint.executive_summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl border border-neutral-300 p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-3">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">Strategic Overview</h2>
          </div>
          <div className="text-text-secondary leading-relaxed">
            {blueprint.executive_summary.content}
          </div>
        </motion.div>
      )}

      {/* Subgoals / Objectives Preview Cards */}
      {objectives.length > 0 && objectives.length <= 3 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {objectives.slice(0, 3).map((objective, index) => (
            <motion.div
              key={objective.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl border border-neutral-300 p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="bg-primary/20 rounded-lg p-2">
                  <Target className="text-primary h-5 w-5" />
                </div>
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                  Subgoal {index + 1}
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-white">{objective.title}</h3>
              <p className="text-text-secondary mb-3 text-sm">{objective.description}</p>
              <div className="border-t border-white/10 pt-3">
                <div className="text-text-secondary flex items-center gap-2 text-xs">
                  <CheckCircle2 className="text-success h-4 w-4" />
                  <span>
                    Target: {objective.target} • Metric: {objective.metric}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Duration Metric */}
        <div className="glass-card group hover:border-primary/30 relative overflow-hidden rounded-2xl border border-neutral-300 p-6 transition-all">
          <div className="bg-primary/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="bg-primary/20 mb-4 inline-flex rounded-xl p-3">
              <Clock className="text-primary h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-sm font-medium">Total Duration</p>
              <div className="flex items-baseline gap-1">
                {mounted ? (
                  <CountUp
                    start={0}
                    end={totalDuration}
                    duration={2}
                    decimals={1}
                    className="text-4xl font-bold text-white"
                    separator=","
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">0</span>
                )}
                <span className="text-primary text-xl font-medium">hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Metric */}
        <div className="glass-card group hover:border-secondary/30 relative overflow-hidden rounded-2xl border border-neutral-300 p-6 transition-all">
          <div className="bg-secondary/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="bg-secondary/20 mb-4 inline-flex rounded-xl p-3">
              <BookOpen className="text-secondary h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-sm font-medium">Modules</p>
              <div className="flex items-baseline">
                {mounted ? (
                  <CountUp
                    start={0}
                    end={modules.length}
                    duration={2}
                    className="text-4xl font-bold text-white"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">0</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activities Metric */}
        <div className="glass-card group hover:border-success/30 relative overflow-hidden rounded-2xl border border-neutral-300 p-6 transition-all">
          <div className="bg-success/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="bg-success/20 mb-4 inline-flex rounded-xl p-3">
              <Layers className="text-success h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-sm font-medium">Activities</p>
              <div className="flex items-baseline">
                {mounted ? (
                  <CountUp
                    start={0}
                    end={totalActivities}
                    duration={2}
                    className="text-4xl font-bold text-white"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">0</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topics Metric */}
        <div className="glass-card group hover:border-warning/30 relative overflow-hidden rounded-2xl border border-neutral-300 p-6 transition-all">
          <div className="bg-warning/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="bg-warning/20 mb-4 inline-flex rounded-xl p-3">
              <Target className="text-warning h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-sm font-medium">Topics Covered</p>
              <div className="flex items-baseline">
                {mounted ? (
                  <CountUp
                    start={0}
                    end={totalTopics}
                    duration={2}
                    className="text-4xl font-bold text-white"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">0</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.has(section.id);

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
              className="glass-card overflow-hidden rounded-2xl border border-neutral-300"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-${section.iconColor.replace('text-', '')}/20 p-3`}>
                    <Icon className={`h-5 w-5 ${section.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white">
                      {section.title}
                    </h3>
                    <p className="text-text-secondary text-sm">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="text-primary h-5 w-5" />
                    ) : (
                      <ChevronDown className="text-text-secondary h-5 w-5" />
                    )}
                  </motion.div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 p-6">
                      {/* Render appropriate infographic based on section */}
                      {section.id === 'learning_objectives' && blueprint.learning_objectives && (
                        <ObjectivesInfographic
                          objectives={blueprint.learning_objectives.objectives}
                          chartConfig={blueprint.learning_objectives.chartConfig}
                        />
                      )}
                      {section.id === 'target_audience' && blueprint.target_audience && (
                        <TargetAudienceInfographic data={blueprint.target_audience} />
                      )}
                      {section.id === 'content_outline' && blueprint.content_outline && (
                        <ContentOutlineInfographic modules={blueprint.content_outline.modules} />
                      )}
                      {section.id === 'resources' && blueprint.resources && (
                        <BudgetResourcesInfographic
                          human_resources={blueprint.resources.human_resources}
                          tools_and_platforms={blueprint.resources.tools_and_platforms}
                          budget={blueprint.resources.budget}
                        />
                      )}
                      {section.id === 'assessment_strategy' && blueprint.assessment_strategy && (
                        <AssessmentStrategyInfographic
                          overview={blueprint.assessment_strategy.overview}
                          kpis={blueprint.assessment_strategy.kpis}
                          evaluationMethods={blueprint.assessment_strategy.evaluation_methods}
                        />
                      )}
                      {section.id === 'implementation_timeline' &&
                        blueprint.implementation_timeline && (
                          <TimelineInfographic
                            phases={blueprint.implementation_timeline.phases}
                            critical_path={blueprint.implementation_timeline.critical_path}
                          />
                        )}
                      {section.id === 'risk_mitigation' && blueprint.risk_mitigation && (
                        <RiskMitigationInfographic
                          risks={blueprint.risk_mitigation.risks}
                          contingency_plans={blueprint.risk_mitigation.contingency_plans}
                        />
                      )}
                      {section.id === 'success_metrics' && blueprint.success_metrics && (
                        <SuccessMetricsInfographic
                          metrics={blueprint.success_metrics.metrics}
                          reportingCadence={blueprint.success_metrics.reporting_cadence}
                        />
                      )}
                      {section.id === 'instructional_strategy' &&
                        blueprint.instructional_strategy && (
                          <InstructionalStrategyInfographic
                            overview={blueprint.instructional_strategy.overview}
                            modalities={blueprint.instructional_strategy.modalities}
                            cohort_model={blueprint.instructional_strategy.cohort_model}
                            accessibility_considerations={
                              blueprint.instructional_strategy.accessibility_considerations
                            }
                          />
                        )}
                      {section.id === 'sustainability_plan' && blueprint.sustainability_plan && (
                        <SustainabilityPlanInfographic
                          content={blueprint.sustainability_plan.content}
                          maintenance_schedule={blueprint.sustainability_plan.maintenance_schedule}
                          scaling_considerations={
                            blueprint.sustainability_plan.scaling_considerations
                          }
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
