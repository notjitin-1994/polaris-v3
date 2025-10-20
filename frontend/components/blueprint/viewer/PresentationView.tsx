/**
 * Analytics-Based Presentation View
 * Modern presentation system that transforms analytics dashboard into navigable slides
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { glassPanel, microInteractions, cn } from '@/lib/design-system';
import type { BlueprintJSON } from '../types';
import {
  PresentationToolbar,
  type PresentationTool,
  type PresentationDrawingSettings,
} from './PresentationToolbar';
import { PresentationSlide } from './PresentationSlide';
import { PresentationSectionCard } from './PresentationSectionCard';
import { PresenterNotes } from './PresenterNotes';
import { SlideGridOverview } from './SlideGridOverview';
import { ColorThemeProvider } from './ColorThemeProvider';
import { DrawingCanvas } from './presenter/DrawingCanvas';
import { LaserPointer } from './presenter/LaserPointer';
import { ExecutiveSummaryInfographic } from '../infographics/ExecutiveSummaryInfographic';
import { ObjectivesInfographic } from '../infographics/ObjectivesInfographic';
import { TargetAudienceInfographic } from '../infographics/TargetAudienceInfographic';
import { ContentOutlineInfographic } from '../infographics/ContentOutlineInfographic';
import { InstructionalStrategyInfographic } from '../infographics/InstructionalStrategyInfographic';
import { BudgetResourcesInfographic } from '../infographics/BudgetResourcesInfographic';
import { AssessmentStrategyInfographic } from '../infographics/AssessmentStrategyInfographic';
import { TimelineInfographic } from '../infographics/TimelineInfographic';
import { RiskMitigationInfographic } from '../infographics/RiskMitigationInfographic';
import { SuccessMetricsInfographic } from '../infographics/SuccessMetricsInfographic';
import { SustainabilityPlanInfographic } from '../infographics/SustainabilityPlanInfographic';
import {
  Clock,
  Timer,
  Layers,
  Target,
  BookOpen,
  Compass,
  Users,
  Lightbulb,
  DollarSign,
  BarChart3,
  Calendar,
  Shield,
  TrendingUp,
  Leaf,
  CheckCircle,
  FileBarChart,
  FileText,
  ListChecks,
  type LucideIcon,
} from 'lucide-react';
import CountUp from 'react-countup';

interface PresentationViewProps {
  blueprintData: BlueprintJSON;
  onExit: () => void;
}

interface ColorTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
  glow: string;
}

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
  notes: string;
  icon: LucideIcon;
  colorTheme: ColorTheme;
}

// Unified Brand Color Palette
// Using only teal (brand accent), black, and white for all sections
const BRAND_TEAL = {
  primary: 'rgb(167, 218, 219)', // Brand teal #A7DADB
  light: 'rgb(199, 231, 232)', // Lighter teal
  dark: 'rgb(115, 168, 169)', // Darker teal
  bg: 'rgba(167, 218, 219, 0.1)',
  border: 'rgba(167, 218, 219, 0.3)',
  glow: 'rgba(167, 218, 219, 0.3)',
};

const colorPalettes = {
  executive: BRAND_TEAL,
  objectives: BRAND_TEAL,
  audience: BRAND_TEAL,
  strategy: BRAND_TEAL,
  content: BRAND_TEAL,
  resources: BRAND_TEAL,
  assessment: BRAND_TEAL,
  timeline: BRAND_TEAL,
  risks: BRAND_TEAL,
  metrics: BRAND_TEAL,
  sustainability: BRAND_TEAL,
} as const;

// Section definitions matching InteractiveBlueprintDashboard
interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

const getSectionDefinitions = (
  blueprint: BlueprintJSON,
  modules: any[],
  objectives: any[]
): Record<string, SectionDefinition> => ({
  objectives: {
    id: 'objectives',
    title: 'Learning Objectives',
    description: `${objectives.length} measurable objectives`,
    icon: Target,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  audience: {
    id: 'target_audience',
    title: 'Target Audience',
    description: 'Demographics and learning preferences',
    icon: Users,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  strategy: {
    id: 'strategy',
    title: 'Instructional Strategy',
    description: 'Learning approach and methodology',
    icon: Lightbulb,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  content: {
    id: 'content_outline',
    title: 'Content Outline',
    description: `${modules.length} comprehensive learning modules`,
    icon: BookOpen,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  resources: {
    id: 'resources',
    title: 'Resources & Budget',
    description: 'Team, tools, and financial allocation',
    icon: DollarSign,
    gradient: 'bg-success/20',
    iconColor: 'text-success',
  },
  assessment: {
    id: 'assessment',
    title: 'Assessment Strategy',
    description: 'Evaluation methods and KPIs',
    icon: CheckCircle,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  timeline: {
    id: 'timeline',
    title: 'Implementation Timeline',
    description: `${blueprint.implementation_timeline?.phases?.length || 0} phases`,
    icon: Calendar,
    gradient: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  risks: {
    id: 'risks',
    title: 'Risk Mitigation',
    description: `${blueprint.risk_mitigation?.risks?.length || 0} risks addressed`,
    icon: Shield,
    gradient: 'bg-warning/20',
    iconColor: 'text-warning',
  },
  metrics: {
    id: 'metrics',
    title: 'Success Metrics',
    description: 'Performance indicators and tracking',
    icon: TrendingUp,
    gradient: 'bg-success/20',
    iconColor: 'text-success',
  },
  sustainability: {
    id: 'sustainability',
    title: 'Sustainability Plan',
    description: 'Long-term maintenance and scaling',
    icon: Leaf,
    gradient: 'bg-success/20',
    iconColor: 'text-success',
  },
});

export function PresentationView({
  blueprintData,
  onExit,
}: PresentationViewProps): React.JSX.Element {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [presenterWindow, setPresenterWindow] = useState<Window | null>(null);

  // Drawing tools state
  const [activeTool, setActiveTool] = useState<PresentationTool>('none');
  const [drawingSettings, setDrawingSettings] = useState<PresentationDrawingSettings>({
    color: '#A7DADB',
    size: 3,
    opacity: 1,
  });
  const slideContainerRef = React.useRef<HTMLDivElement>(null);

  // Handle exit - always return to dashboard view
  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    }
    // Note: onExit should always be provided to return to dashboard view
  }, [onExit]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Extract data from blueprint
  const modules = blueprintData.content_outline?.modules || [];
  const objectives = blueprintData.learning_objectives?.objectives || [];
  const totalDuration = useMemo(() => {
    return modules.reduce((sum, module) => {
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
  }, [modules]);

  const totalActivities = useMemo(() => {
    return modules.reduce((sum, m) => sum + (m.learning_activities?.length || 0), 0);
  }, [modules]);

  // Stats Card Component
  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix = '',
    bgColor,
    iconColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    bgColor: string;
    iconColor: string;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:border-white/20"
      >
        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between">
            <div
              className="rounded-xl p-3.5 transition-transform group-hover:scale-105"
              style={{ backgroundColor: bgColor }}
            >
              <Icon className="h-7 w-7" strokeWidth={2.5} style={{ color: iconColor }} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-medium">{label}</p>
            <div className="flex items-baseline gap-1">
              {mounted ? (
                <CountUp
                  start={0}
                  end={value}
                  duration={1.5}
                  decimals={suffix === 'hrs' ? 1 : 0}
                  className="text-4xl font-bold text-white"
                  separator=","
                />
              ) : (
                <span className="text-4xl font-bold text-white">0</span>
              )}
              {suffix && (
                <span className="text-xl font-medium" style={{ color: iconColor }}>
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Build slides dynamically based on available data - each section gets its own slide
  const slides = useMemo<Slide[]>(() => {
    const slideArray: Slide[] = [];
    const sectionDefs = getSectionDefinitions(blueprintData, modules, objectives);

    // First pass: Build all slide content WITHOUT the embedded grid
    const statsContent = (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Total Duration"
          value={totalDuration}
          suffix="hrs"
          bgColor="rgba(167, 218, 219, 0.20)"
          iconColor="rgb(167, 218, 219)"
        />
        <StatCard
          icon={Layers}
          label="Learning Modules"
          value={modules.length}
          bgColor="rgba(167, 218, 219, 0.20)"
          iconColor="rgb(167, 218, 219)"
        />
        <StatCard
          icon={ListChecks}
          label="Learning Objectives"
          value={objectives.length}
          bgColor="rgba(167, 218, 219, 0.20)"
          iconColor="rgb(167, 218, 219)"
        />
        <StatCard
          icon={BookOpen}
          label="Total Activities"
          value={totalActivities}
          bgColor="rgba(167, 218, 219, 0.20)"
          iconColor="rgb(167, 218, 219)"
        />
      </div>
    );

    // Slide 1: Executive Summary with Stats at bottom (grid will be added in second pass)
    if (blueprintData.executive_summary) {
      slideArray.push({
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        colorTheme: colorPalettes.executive,
        notes:
          "<h2>Opening Strong</h2><p>Start with a confident, clear introduction. Establish credibility and set expectations for the presentation.</p><h3>Key Points to Cover:</h3><ul><li>Welcome the audience and introduce yourself</li><li>State the purpose and scope of this program</li><li>Highlight the strategic value and business impact</li><li>Reference the metrics shown to demonstrate program scale</li></ul><h3>Tips:</h3><ul><li>Maintain eye contact and speak with conviction</li><li>Use a moderate pace - don't rush through the overview</li><li>Pause after key statistics to let them sink in</li><li>Connect the program to organizational goals</li></ul>",
        content: (
          <ExecutiveSummaryInfographic
            content={blueprintData.executive_summary.content}
            metadata={blueprintData.metadata}
            isPublicView={false}
            statsCards={statsContent}
          />
        ),
      });
    } else {
      // If no executive summary, still show stats as first slide (grid will be added in second pass)
      slideArray.push({
        id: 'overview',
        title: 'Overview',
        icon: FileBarChart,
        colorTheme: colorPalettes.executive,
        notes:
          '<h2>Program Overview</h2><p>Set the stage by presenting the big picture. Help your audience understand the scale and scope of what you\'re proposing.</p><h3>Speaking Points:</h3><ul><li>Walk through each metric and explain its significance</li><li>Connect quantitative data to qualitative outcomes</li><li>Address "why now" and "why this approach"</li><li>Build excitement about the program scope</li></ul><h3>Engagement Tips:</h3><ul><li>Ask if anyone has questions about the metrics</li><li>Use gestures to emphasize scale</li><li>Relate numbers to familiar benchmarks</li></ul>',
        content: statsContent,
      });
    }

    // Learning Objectives
    if (blueprintData.learning_objectives) {
      slideArray.push({
        id: 'objectives',
        title: 'Learning Objectives',
        icon: Target,
        colorTheme: colorPalettes.objectives,
        notes:
          '<h2>Learning Objectives</h2><p>This is where you connect learning outcomes to business value. Make objectives tangible and measurable.</p><h3>Presentation Strategy:</h3><ul><li>Read each objective aloud for clarity</li><li>Explain how each objective will be measured</li><li>Connect objectives to audience pain points</li><li>Emphasize the SMART criteria</li></ul><h3>Engagement:</h3><ul><li>Ask if objectives resonate with audience needs</li><li>Invite questions about specific outcomes</li><li>Reference baseline and target metrics</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.objectives} isPublicView={false}>
            <ObjectivesInfographic
              objectives={objectives}
              chartConfig={blueprintData.learning_objectives.chartConfig}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Target Audience
    if (blueprintData.target_audience) {
      slideArray.push({
        id: 'audience',
        title: 'Target Audience',
        icon: Users,
        colorTheme: colorPalettes.audience,
        notes:
          '<h2>Target Audience</h2><p>Help stakeholders understand who will benefit from this program and how it addresses their needs.</p><h3>Key Talking Points:</h3><ul><li>Describe the typical learner profile</li><li>Explain department and role distribution</li><li>Discuss experience level diversity</li><li>Address how content adapts to different learning preferences</li></ul><h3>Tips:</h3><ul><li>Use relatable examples of learner personas</li><li>Emphasize inclusivity and accessibility</li><li>Connect audience needs to program design choices</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.audience} isPublicView={false}>
            <TargetAudienceInfographic data={blueprintData.target_audience} />
          </PresentationSectionCard>
        ),
      });
    }

    // Instructional Strategy
    if (blueprintData.instructional_strategy) {
      slideArray.push({
        id: 'strategy',
        title: 'Instructional Strategy',
        icon: Lightbulb,
        colorTheme: colorPalettes.strategy,
        notes:
          '<h2>Instructional Strategy</h2><p>This slide justifies your approach. Explain the "why" behind your design decisions.</p><h3>Core Message:</h3><ul><li>Explain the pedagogical framework and learning theory</li><li>Justify each delivery modality choice</li><li>Describe the cohort model and its benefits</li><li>Address accessibility and inclusion strategies</li></ul><h3>Presentation Tips:</h3><ul><li>Use educational psychology terms appropriately</li><li>Reference best practices in L&D</li><li>Show how strategy aligns with audience preferences</li><li>Be prepared to discuss alternatives considered</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.strategy} isPublicView={false}>
            <InstructionalStrategyInfographic
              overview={blueprintData.instructional_strategy.overview}
              modalities={blueprintData.instructional_strategy.modalities}
              cohort_model={blueprintData.instructional_strategy.cohort_model}
              accessibility_considerations={
                blueprintData.instructional_strategy.accessibility_considerations
              }
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Content Outline
    if (blueprintData.content_outline && modules.length > 0) {
      slideArray.push({
        id: 'content',
        title: 'Content Outline',
        icon: BookOpen,
        colorTheme: colorPalettes.content,
        notes:
          '<h2>Content Outline</h2><p>Take your audience through the learner journey step by step. Make the path clear and logical.</p><h3>Narration Strategy:</h3><ul><li>Present modules in chronological order</li><li>Explain how topics build on each other</li><li>Highlight key activities and assessments</li><li>Show estimated time investment per module</li></ul><h3>Engagement Tips:</h3><ul><li>Use storytelling to illustrate the learning journey</li><li>Reference prerequisite relationships</li><li>Emphasize practical, hands-on components</li><li>Invite questions about specific topics</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.content} isPublicView={false}>
            <ContentOutlineInfographic modules={modules} />
          </PresentationSectionCard>
        ),
      });
    }

    // Resources & Budget
    if (blueprintData.resources) {
      slideArray.push({
        id: 'resources',
        title: 'Resources & Budget',
        icon: DollarSign,
        colorTheme: colorPalettes.resources,
        notes:
          '<h2>Resources & Budget</h2><p>Be transparent about what is needed to succeed. This builds trust and sets realistic expectations.</p><h3>Discussion Points:</h3><ul><li>Outline the team structure and role responsibilities</li><li>Explain time commitments and FTE allocation</li><li>Present tools, platforms, and infrastructure needs</li><li>Walk through budget items and total investment</li></ul><h3>Best Practices:</h3><ul><li>Be prepared to justify larger budget items</li><li>Show how resources map to outcomes</li><li>Discuss potential cost-saving alternatives</li><li>Address questions about ROI and value</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.resources} isPublicView={false}>
            <BudgetResourcesInfographic
              budget={blueprintData.resources.budget}
              human_resources={blueprintData.resources.human_resources}
              tools_and_platforms={blueprintData.resources.tools_and_platforms}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Assessment Strategy
    if (blueprintData.assessment_strategy) {
      slideArray.push({
        id: 'assessment',
        title: 'Assessment Strategy',
        icon: CheckCircle,
        colorTheme: colorPalettes.assessment,
        notes:
          '<h2>Assessment Strategy</h2><p>Demonstrate how you will measure learning effectiveness. Show stakeholders that success is measurable and achievable.</p><h3>Key Points:</h3><ul><li>Present each KPI and its target value</li><li>Explain measurement methods and tools</li><li>Discuss evaluation frequency and timing</li><li>Show how assessments align with objectives</li></ul><h3>Confidence Builders:</h3><ul><li>Reference assessment best practices</li><li>Show how data will drive improvements</li><li>Explain reporting cadence and dashboard access</li><li>Address stakeholder concerns about measurement</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.assessment} isPublicView={false}>
            <AssessmentStrategyInfographic
              kpis={blueprintData.assessment_strategy.kpis}
              overview={blueprintData.assessment_strategy.overview}
              evaluationMethods={blueprintData.assessment_strategy.evaluation_methods}
              chartConfig={blueprintData.assessment_strategy.chartConfig}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Implementation Timeline
    if (blueprintData.implementation_timeline) {
      slideArray.push({
        id: 'timeline',
        title: 'Implementation Timeline',
        icon: Calendar,
        colorTheme: colorPalettes.timeline,
        notes:
          '<h2>Implementation Timeline</h2><p>Give your audience a clear picture of when things will happen. Make the path forward concrete and achievable.</p><h3>Presentation Flow:</h3><ul><li>Walk through each phase chronologically</li><li>Highlight major milestones and deliverables</li><li>Explain dependencies between phases</li><li>Point out the critical path items</li></ul><h3>Communication Tips:</h3><ul><li>Use visual gestures to indicate timeline flow</li><li>Be realistic about timelines - avoid over-promising</li><li>Acknowledge potential bottlenecks proactively</li><li>Emphasize flexibility in the plan</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.timeline} isPublicView={false}>
            <TimelineInfographic
              phases={blueprintData.implementation_timeline.phases}
              critical_path={blueprintData.implementation_timeline.critical_path}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Risk Mitigation
    if (blueprintData.risk_mitigation) {
      slideArray.push({
        id: 'risks',
        title: 'Risk Mitigation',
        icon: Shield,
        colorTheme: colorPalettes.risks,
        notes:
          '<h2>Risk Mitigation</h2><p>Show that you have thought ahead and prepared for challenges. This builds confidence in your planning.</p><h3>Approach:</h3><ul><li>Present each risk with honesty and transparency</li><li>Explain probability and potential impact</li><li>Detail specific mitigation strategies</li><li>Discuss contingency plans</li></ul><h3>Tone & Delivery:</h3><ul><li>Stay calm and matter-of-fact about risks</li><li>Frame risks as manageable challenges, not deal-breakers</li><li>Show that mitigation plans are concrete and actionable</li><li>Welcome questions and show openness to feedback</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.risks} isPublicView={false}>
            <RiskMitigationInfographic
              risks={blueprintData.risk_mitigation.risks}
              contingency_plans={blueprintData.risk_mitigation.contingency_plans}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Success Metrics
    if (blueprintData.success_metrics) {
      slideArray.push({
        id: 'metrics',
        title: 'Success Metrics',
        icon: TrendingUp,
        colorTheme: colorPalettes.metrics,
        notes:
          '<h2>Success Metrics</h2><p>Define what success looks like with concrete, measurable indicators. Show how you will track and report progress.</p><h3>Key Messages:</h3><ul><li>Present each metric with current baseline and target</li><li>Explain measurement methodology</li><li>Discuss the reporting schedule and dashboards</li><li>Connect metrics back to business objectives</li></ul><h3>Delivery Tips:</h3><ul><li>Use confident language about achievability</li><li>Reference industry benchmarks when relevant</li><li>Show how metrics will drive continuous improvement</li><li>Be prepared to discuss what "good" looks like</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.metrics} isPublicView={false}>
            <SuccessMetricsInfographic
              metrics={blueprintData.success_metrics.metrics}
              reportingCadence={blueprintData.success_metrics.reporting_cadence}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Sustainability Plan
    if (blueprintData.sustainability_plan) {
      slideArray.push({
        id: 'sustainability',
        title: 'Sustainability Plan',
        icon: Leaf,
        colorTheme: colorPalettes.sustainability,
        notes:
          '<h2>Sustainability Plan</h2><p>End with confidence about the long-term value. Show that this program is built to last and grow.</p><h3>Closing Points:</h3><ul><li>Explain the content maintenance strategy</li><li>Discuss review cycles and update triggers</li><li>Present scaling considerations for growth</li><li>Show how the program evolves with the organization</li></ul><h3>Strong Finish:</h3><ul><li>Emphasize long-term value and ROI</li><li>Invite stakeholders to envision future impact</li><li>Thank the audience for their time and attention</li><li>Open the floor for final questions and discussion</li></ul>',
        content: (
          <PresentationSectionCard section={sectionDefs.sustainability} isPublicView={false}>
            <SustainabilityPlanInfographic
              content={blueprintData.sustainability_plan.content}
              maintenance_schedule={blueprintData.sustainability_plan.maintenance_schedule}
              scaling_considerations={blueprintData.sustainability_plan.scaling_considerations}
            />
          </PresentationSectionCard>
        ),
      });
    }

    // Second pass: Add embedded grid to first slide now that all slides are built
    if (slideArray.length > 0) {
      const firstSlide = slideArray[0];
      const originalContent = firstSlide.content;

      // Component for embedded slide grid preview
      const EmbeddedSlideGrid = () => (
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="from-primary to-primary/50 h-6 w-0.5 rounded-full bg-gradient-to-b" />
            <h3 className="text-foreground text-xl font-bold">Presentation Overview</h3>
            <div className="text-text-secondary ml-auto text-sm font-medium">
              <span className="text-foreground font-semibold">{slideArray.length}</span>
              <span className="mx-1">slides</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {slideArray.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="glass-card relative overflow-hidden rounded-xl border-2 p-3"
                style={{
                  borderColor: slide.colorTheme.primary,
                  boxShadow: `0 4px 20px -4px ${slide.colorTheme.glow}`,
                }}
              >
                {/* Decorative gradient background with slide color */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.15]"
                  style={{
                    background: `linear-gradient(135deg, ${slide.colorTheme.primary}40 0%, ${slide.colorTheme.dark}20 100%)`,
                  }}
                />

                {/* Top accent bar */}
                <div
                  className="absolute top-0 right-0 left-0 h-1 rounded-t-xl"
                  style={{
                    background: `linear-gradient(90deg, ${slide.colorTheme.primary}, ${slide.colorTheme.light})`,
                  }}
                />

                {/* Slide Number Badge */}
                <div
                  className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg"
                  style={{
                    backgroundColor: slide.colorTheme.primary,
                    color: '#fff',
                    boxShadow: `0 2px 10px ${slide.colorTheme.glow}`,
                  }}
                >
                  {index + 1}
                </div>

                {/* Icon Only - No background */}
                <div className="relative z-10 flex items-center justify-center pt-6 pb-3">
                  {slide.icon &&
                    React.createElement(slide.icon, {
                      className: 'h-12 w-12',
                      strokeWidth: 2,
                      style: {
                        color: slide.colorTheme.primary,
                        filter: `drop-shadow(0 4px 12px ${slide.colorTheme.glow})`,
                      },
                    })}
                </div>

                {/* Slide Title */}
                <div className="relative z-10 mt-2 px-1 text-center">
                  <h4
                    className="text-sm leading-tight font-bold"
                    style={{ color: slide.colorTheme.primary }}
                  >
                    {slide.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );

      // Wrap first slide content with grid
      firstSlide.content = (
        <>
          {originalContent}
          <EmbeddedSlideGrid />
        </>
      );
    }

    return slideArray;
  }, [blueprintData, modules, objectives, totalDuration, totalActivities, mounted]);

  // Navigation
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setShowGrid(false);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen not supported or denied
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {
        // Already exited or not in fullscreen
      });
      setIsFullscreen(false);
    }
  }, []);

  // Sync fullscreen state with actual fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Open presenter window
  const openPresenterWindow = useCallback(() => {
    // Close existing window if open
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.focus();
      return;
    }

    // Get blueprint ID from URL
    const blueprintId = window.location.pathname
      .split('/')
      .find((segment) =>
        segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      );

    if (!blueprintId) {
      console.error('Blueprint ID not found');
      return;
    }

    // Store slides data in sessionStorage for presenter window to access
    try {
      const slidesData = slides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        notes: slide.notes,
        colorTheme: slide.colorTheme,
      }));
      sessionStorage.setItem(`presenter-slides-${blueprintId}`, JSON.stringify(slidesData));
    } catch (error) {
      console.error('Failed to store slides data:', error);
    }

    // Calculate window dimensions for aesthetic portrait size (9:16 ratio)
    const height = Math.floor(window.screen.height * 0.85); // 85% of screen height
    const width = Math.floor(height * 0.5625); // 9:16 portrait ratio
    const left = Math.floor((window.screen.width - width) / 2);
    const top = Math.floor((window.screen.height - height) / 2);

    // Open presenter view in new window
    const presenterUrl = `/blueprint/${blueprintId}/presenter`;
    const newWindow = window.open(
      presenterUrl,
      'PresenterView',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (!newWindow) {
      console.error('Failed to open presenter window. Please allow popups.');
      alert('Please allow popups to open the Presenter View');
      return;
    }

    setPresenterWindow(newWindow);
  }, [presenterWindow, blueprintData, slides]);

  // Sync slide changes with presenter window
  useEffect(() => {
    if (presenterWindow && !presenterWindow.closed) {
      presenterWindow.postMessage(
        { type: 'SLIDE_CHANGE', slide: currentSlide },
        window.location.origin
      );
    }
  }, [currentSlide, presenterWindow]);

  // Listen for messages from presenter window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'PRESENTER_SLIDE_CHANGE') {
        setCurrentSlide(event.data.slide);
      } else if (event.data.type === 'PRESENTER_TOOL_CHANGE') {
        setActiveTool(event.data.tool);
        setDrawingSettings(event.data.settings);
      } else if (event.data.type === 'TOGGLE_GRID') {
        setShowGrid((prev) => !prev);
      } else if (event.data.type === 'TOGGLE_FULLSCREEN') {
        toggleFullscreen();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toggleFullscreen]);

  // Cleanup presenter window on unmount
  useEffect(() => {
    return () => {
      if (presenterWindow && !presenterWindow.closed) {
        presenterWindow.close();
      }
    };
  }, [presenterWindow]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    right: goToNextSlide,
    space: goToNextSlide,
    left: goToPrevSlide,
    n: openPresenterWindow,
    N: openPresenterWindow,
    l: () => setActiveTool(activeTool === 'laser' ? 'none' : 'laser'),
    L: () => setActiveTool(activeTool === 'laser' ? 'none' : 'laser'),
    p: () => setActiveTool(activeTool === 'pen' ? 'none' : 'pen'),
    P: () => setActiveTool(activeTool === 'pen' ? 'none' : 'pen'),
    h: () => setActiveTool(activeTool === 'highlighter' ? 'none' : 'highlighter'),
    H: () => setActiveTool(activeTool === 'highlighter' ? 'none' : 'highlighter'),
    e: () => setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser'),
    E: () => setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser'),
    g: () => setShowGrid((prev) => !prev),
    G: () => setShowGrid((prev) => !prev),
    f: toggleFullscreen,
    F: toggleFullscreen,
    escape: () => {
      if (activeTool !== 'none') {
        setActiveTool('none');
      } else if (showGrid) {
        setShowGrid(false);
      } else if (showNotes) {
        setShowNotes(false);
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          // Fullscreen already exited or error
        });
      } else {
        handleExit();
      }
    },
  });

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      {/* Decorative background gradient - unified teal theme */}
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <motion.div
          animate={{
            background:
              'radial-gradient(circle at 25% 0%, rgba(167, 218, 219, 0.25), transparent 50%)',
          }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            background:
              'radial-gradient(circle at 75% 100%, rgba(167, 218, 219, 0.15), transparent 50%)',
          }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-3xl"
        />
      </div>

      {/* Presentation Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: 1,
          y: 0,
          borderColor: 'rgba(167, 218, 219, 0.3)',
        }}
        transition={{ duration: 0.3 }}
        className={cn(glassPanel.header, 'relative z-50 border-b')}
        style={{
          borderBottomColor: 'rgba(167, 218, 219, 0.3)',
        }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Back button */}
              <motion.button
                {...microInteractions.buttonPress}
                onClick={handleExit}
                className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                  'text-text-secondary hover:text-foreground',
                  'transition-all duration-200 hover:bg-white/10'
                )}
                aria-label="Exit presentation"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>

              {/* Slide Title with accent */}
              <div className="flex min-w-0 items-center gap-2">
                {/* Teal accent bar */}
                <div className="hidden h-6 w-0.5 rounded-full bg-gradient-to-b from-[rgb(167,218,219)] to-[rgba(167,218,219,0.5)] sm:flex" />

                {/* Relevant slide icon in teal */}
                {slides[currentSlide]?.icon && (
                  <div className="flex-shrink-0 text-[rgb(167,218,219)]">
                    {React.createElement(slides[currentSlide].icon, {
                      className: 'h-5 w-5',
                      strokeWidth: 2,
                    })}
                  </div>
                )}

                {/* Title in teal */}
                <h1
                  className="truncate text-lg font-bold text-[rgb(167,218,219)]"
                  style={{
                    textShadow: '0 0 20px rgba(167, 218, 219, 0.3)',
                  }}
                >
                  {slides[currentSlide]?.title || 'Presentation'}
                </h1>
              </div>
            </div>

            {/* Right: Slide counter */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="text-text-secondary text-sm font-medium">
                <span className="text-foreground font-semibold">{currentSlide + 1}</span>
                <span className="mx-1">/</span>
                <span>{slides.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Slides Container */}
        <div
          ref={slideContainerRef}
          className="relative z-10 flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:px-8 lg:px-12"
        >
          <AnimatePresence mode="wait">
            <PresentationSlide key={currentSlide} colorTheme={slides[currentSlide]?.colorTheme}>
              {slides[currentSlide]?.colorTheme && (
                <ColorThemeProvider colorTheme={slides[currentSlide].colorTheme}>
                  {slides[currentSlide]?.content}
                </ColorThemeProvider>
              )}
              {!slides[currentSlide]?.colorTheme && slides[currentSlide]?.content}
            </PresentationSlide>
          </AnimatePresence>

          {/* Drawing Canvas Overlay */}
          {activeTool !== 'none' && activeTool !== 'laser' && (
            <DrawingCanvas
              isActive={true}
              tool={activeTool as any}
              settings={drawingSettings}
              onClear={() => setActiveTool('none')}
            />
          )}

          {/* Laser Pointer Overlay */}
          {activeTool === 'laser' && slideContainerRef.current && (
            <LaserPointer containerRef={slideContainerRef as React.RefObject<HTMLDivElement>} />
          )}
        </div>

        {/* Presenter Notes Panel */}
        <PresenterNotes
          isOpen={showNotes}
          notes={slides[currentSlide]?.notes || ''}
          onClose={() => setShowNotes(false)}
        />
      </div>

      {/* Toolbar - Only show when presenter window is NOT open */}
      {(!presenterWindow || presenterWindow.closed) && (
        <PresentationToolbar
          currentSlide={currentSlide}
          totalSlides={slides.length}
          activeTool={activeTool}
          drawingSettings={drawingSettings}
          onToolChange={setActiveTool}
          onSettingsChange={setDrawingSettings}
          onPrevSlide={goToPrevSlide}
          onNextSlide={goToNextSlide}
          onClearDrawings={() => setActiveTool('none')}
          onPresenterView={openPresenterWindow}
          onGridView={() => setShowGrid(true)}
          onToggleFullscreen={toggleFullscreen}
          canGoPrev={currentSlide > 0}
          canGoNext={currentSlide < slides.length - 1}
          isFullscreen={isFullscreen}
          presenterViewActive={false}
        />
      )}

      {/* Grid Overview Modal */}
      <SlideGridOverview
        isOpen={showGrid}
        slides={slides}
        currentSlide={currentSlide}
        onSelectSlide={goToSlide}
        onClose={() => setShowGrid(false)}
      />
    </div>
  );
}
