'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import {
  BookOpen,
  Calendar,
  Target,
  Zap,
  BarChart3,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import 'highlight.js/styles/tokyo-night-dark.css';
import type { AnyBlueprint } from '@/lib/ollama/schema';
import { BlueprintDashboard } from './BlueprintDashboard';
import { InteractiveBlueprintDashboard } from './InteractiveBlueprintDashboard';
import type { BlueprintJSON } from './types';
import { MarkdownEditor } from './MarkdownEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface BlueprintRendererProps {
  markdown: string;
  blueprint?: AnyBlueprint;
  isEditMode?: boolean;
  onSaveMarkdown?: (newMarkdown: string) => Promise<void>;
  onCancelEdit?: () => void;
}

type TabType = 'dashboard' | 'markdown';

interface MarkdownSection {
  title: string;
  content: string;
  index: number;
}

// Helper to detect if blueprint has comprehensive structure (Claude or Ollama with FullBlueprint)
function isComprehensiveBlueprint(blueprint: any): boolean {
  if (!blueprint || typeof blueprint !== 'object') return false;

  // Check for Claude schema (comprehensive JSON structure)
  const hasClaudeSchema = Boolean(
    blueprint.metadata ||
      blueprint.executive_summary ||
      blueprint.learning_objectives ||
      blueprint.content_outline ||
      blueprint.assessment_strategy ||
      blueprint.implementation_timeline
  );

  // Check for Ollama FullBlueprint schema (extended structure)
  const hasOllamaFullSchema = Boolean(
    blueprint.objectives ||
      blueprint.instructional_strategy ||
      blueprint.content_outline ||
      blueprint.implementation_roadmap ||
      blueprint.infographics ||
      blueprint.dashboard
  );

  return hasClaudeSchema || hasOllamaFullSchema;
}

// Normalize blueprint data to Claude schema format for consistent rendering
function normalizeBlueprint(blueprint: any): BlueprintJSON {
  // If it already has Claude schema structure, return as-is
  if (blueprint.learning_objectives || blueprint.executive_summary) {
    return blueprint as BlueprintJSON;
  }

  // Normalize Ollama FullBlueprint to Claude schema
  const normalized: any = { ...blueprint };

  // Map objectives -> learning_objectives
  if (blueprint.objectives && !normalized.learning_objectives) {
    normalized.learning_objectives = {
      objectives: blueprint.objectives,
      displayType: 'infographic',
    };
  }

  // Map content_outline array -> content_outline.modules
  if (Array.isArray(blueprint.content_outline) && !blueprint.content_outline.modules) {
    normalized.content_outline = {
      modules: blueprint.content_outline.map((module: any) => ({
        ...module,
        title: module.title || module.module,
        topics: module.topics || [],
        learning_activities:
          module.activities?.map((activity: string) => ({
            activity,
            type: 'Exercise',
            duration: '30 minutes',
          })) || [],
        assessment: module.assessments
          ? {
              type: 'Mixed',
              description: module.assessments.join(', '),
            }
          : undefined,
      })),
      displayType: 'timeline',
    };
  }

  // Map timeline -> implementation_timeline
  if (blueprint.timeline && !normalized.implementation_timeline) {
    if (blueprint.timeline.phases) {
      normalized.implementation_timeline = {
        phases: blueprint.timeline.phases.map((phase: any) => ({
          phase: phase.name,
          start_date: phase.start,
          end_date: phase.end,
          milestones: phase.milestones?.map((m: any) => m.name) || [],
          dependencies: [],
        })),
        critical_path: [],
        displayType: 'timeline',
      };
    }
  }

  // Map assessment -> assessment_strategy
  if (blueprint.assessment && !normalized.assessment_strategy) {
    normalized.assessment_strategy = {
      overview: 'Comprehensive assessment strategy',
      kpis: blueprint.assessment.kpis || [],
      evaluation_methods:
        blueprint.assessment.methods?.map((method: string) => ({
          method,
          timing: 'Ongoing',
          weight: '10%',
        })) || [],
      displayType: 'infographic',
    };
  }

  // Add metadata if missing
  if (!normalized.metadata) {
    normalized.metadata = {
      title: blueprint.title || 'Learning Blueprint',
      organization: blueprint.metadata?.organization || 'Organization',
      role: blueprint.metadata?.role || 'Professional',
      generated_at: blueprint.metadata?.generated_at || new Date().toISOString(),
      version: '1.0',
      model: 'ollama',
    };
  }

  return normalized as BlueprintJSON;
}

// Split markdown into logical sections based on H1 and H2 headers
function splitMarkdownIntoSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];

  // Split by H1 or H2 headers (# or ##)
  const headerRegex = /^(#{1,2})\s+(.+)$/gm;
  const matches = Array.from(markdown.matchAll(headerRegex));

  if (matches.length === 0) {
    // No headers found, return entire content as one section
    return [{ title: 'Content', content: markdown, index: 0 }];
  }

  // Extract sections between headers
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];
    const headerLevel = match[1].length;
    const title = match[2].trim();

    // Only split on H1 and H2 headers
    if (headerLevel <= 2) {
      const startIndex = match.index!;
      const endIndex = nextMatch ? nextMatch.index! : markdown.length;
      const content = markdown.slice(startIndex, endIndex).trim();

      sections.push({
        title,
        content,
        index: sections.length,
      });
    }
  }

  // If we still don't have sections (e.g., only H3+ headers), return whole content
  if (sections.length === 0) {
    return [{ title: 'Content', content: markdown, index: 0 }];
  }

  return sections;
}

export function BlueprintRenderer({
  markdown,
  blueprint,
  isEditMode = false,
  onSaveMarkdown,
  onCancelEdit,
}: BlueprintRendererProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>(blueprint ? 'dashboard' : 'markdown');
  const [currentPage, setCurrentPage] = useState(0);
  const [showSectionNav, setShowSectionNav] = useState(false);

  // Split markdown into sections for pagination
  const sections = useMemo(() => splitMarkdownIntoSections(markdown), [markdown]);

  // Auto-switch to markdown tab when edit mode is enabled
  React.useEffect(() => {
    if (isEditMode) {
      setActiveTab('markdown');
    }
  }, [isEditMode]);

  // Reset to first page when markdown changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [markdown]);

  // Get current section to display
  const currentSection = sections[currentPage] || sections[0];
  const totalPages = sections.length;
  const hasPagination = totalPages > 1;

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      setShowSectionNav(false);
      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tabs = [
    ...(blueprint
      ? [
          {
            id: 'dashboard' as TabType,
            label: 'Analytics',
            icon: BarChart3,
          },
        ]
      : []),
    {
      id: 'markdown' as TabType,
      label: 'Content',
      icon: FileText,
    },
  ];

  return (
    <article className="blueprint-content">
      {/* Enhanced Tabbed Navigation */}
      {blueprint && (
        <div className="mb-10">
          <div className="relative">
            {/* Tab Background Glow */}
            <div className="bg-primary/10 absolute inset-0 rounded-2xl blur-xl" />

            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {/* Animated background for active tab */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="border-primary/50 bg-primary/30 absolute inset-0 rounded-xl border"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Tab content - Single Line */}
                    <div className="relative z-10 flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 transition-all duration-300 ${
                          isActive ? 'text-primary drop-shadow-glow' : 'group-hover:text-primary'
                        }`}
                      />
                      <span
                        className={`font-heading text-sm font-semibold ${isActive ? 'text-white' : ''}`}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center"
                      >
                        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                        <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content with Enhanced Animations */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && blueprint ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Use InteractiveBlueprintDashboard if blueprint has detailed sections */}
            {isComprehensiveBlueprint(blueprint) ? (
              <InteractiveBlueprintDashboard blueprint={normalizeBlueprint(blueprint)} />
            ) : (
              <BlueprintDashboard blueprint={blueprint} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="markdown"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Show Editor or Rendered Markdown */}
            {isEditMode && onSaveMarkdown && onCancelEdit ? (
              <MarkdownEditor markdown={markdown} onSave={onSaveMarkdown} onCancel={onCancelEdit} />
            ) : (
              <>
                {/* Enhanced visual hierarchy with animated badges */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="border-primary/30 bg-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2"
                    >
                      <BookOpen className="text-primary h-4 w-4" />
                      <span className="text-primary font-medium">Learning Blueprint</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2"
                    >
                      <Target className="text-text-secondary h-4 w-4" />
                      <span className="text-text-secondary">Personalized Path</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="border-primary/40 bg-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2"
                    >
                      <Sparkles className="text-primary h-4 w-4" />
                      <span className="text-primary">AI Enhanced</span>
                    </motion.div>
                  </div>

                  {/* Section Navigation Badge (only show if multiple sections) */}
                  {hasPagination && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <button
                        onClick={() => setShowSectionNav(!showSectionNav)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 transition-all hover:bg-white/20"
                      >
                        <List className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium text-white">
                          Section {currentPage + 1} of {totalPages}
                        </span>
                      </button>

                      {/* Section Navigation Dropdown - Overlay */}
                      <AnimatePresence>
                        {showSectionNav && (
                          <>
                            {/* Backdrop to capture clicks outside */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setShowSectionNav(false)}
                            />
                            {/* Overlay Panel */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="fixed top-auto right-6 bottom-auto z-50 max-h-96 w-72 overflow-y-auto shadow-2xl"
                              style={{
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(2, 12, 27, 0.95)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(167, 218, 219, 0.2)',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                              }}
                            >
                              <div className="p-2">
                                {sections.map((section, index) => (
                                  <button
                                    key={index}
                                    onClick={() => goToPage(index)}
                                    className={`text-text-secondary flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                                      currentPage === index
                                        ? 'bg-primary/20 text-primary border-primary/30 border'
                                        : 'hover:bg-white/5 hover:text-white'
                                    }`}
                                  >
                                    <span
                                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        currentPage === index
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-neutral-200 text-neutral-700'
                                      }`}
                                    >
                                      {index + 1}
                                    </span>
                                    <span className="line-clamp-2 flex-1">{section.title}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>

                {/* Current Section Title (if pagination active) */}
                {hasPagination && (
                  <motion.div
                    key={`section-title-${currentPage}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4"
                  >
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
                      <span className="text-primary-foreground text-lg font-bold">
                        {currentPage + 1}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                      <p className="text-text-secondary text-sm">
                        Section {currentPage + 1} of {totalPages}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Main markdown content with enhanced styling */}
                <motion.div
                  key={`markdown-content-${currentPage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="prose prose-blueprint prose-invert prose-lg max-w-none"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                    components={{
                      h1: ({ children, ...props }) => (
                        <h1
                          className="font-heading border-primary/30 mt-8 mb-6 border-b pb-4 text-4xl font-bold text-white"
                          {...props}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2
                          className="font-heading group text-primary mt-8 mb-4 flex items-center gap-3 text-3xl font-bold"
                          {...props}
                        >
                          <span className="bg-primary h-8 w-1 rounded-full transition-all group-hover:h-10" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3
                          className="font-heading text-primary mt-6 mb-3 text-2xl font-semibold"
                          {...props}
                        >
                          {children}
                        </h3>
                      ),
                      h4: ({ children, ...props }) => (
                        <h4
                          className="font-heading text-text-primary mt-4 mb-2 text-xl font-semibold"
                          {...props}
                        >
                          {children}
                        </h4>
                      ),
                      h5: ({ children, ...props }) => (
                        <h5
                          className="font-heading text-text-primary mt-3 mb-2 text-lg font-medium"
                          {...props}
                        >
                          {children}
                        </h5>
                      ),
                      h6: ({ children, ...props }) => (
                        <h6
                          className="font-heading text-text-secondary mt-3 mb-2 text-base font-medium"
                          {...props}
                        >
                          {children}
                        </h6>
                      ),
                      p: ({ children, ...props }) => (
                        <p
                          className="text-text-secondary mb-4 text-base leading-relaxed"
                          {...props}
                        >
                          {children}
                        </p>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul className="my-4 ml-0 list-none space-y-2" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="counter-reset-item my-4 ml-0 list-none space-y-2" {...props}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li
                          className={`text-text-secondary hover:text-text-primary relative pl-8 transition-colors ${
                            // Use data attribute from ordered lists added by our class on <ol>
                            (props as unknown as { className?: string }).className?.includes(
                              'counter-reset-item'
                            )
                              ? 'before:counter-increment-item before:text-primary-foreground before:bg-primary before:absolute before:top-0 before:left-0 before:flex before:h-6 before:w-6 before:items-center before:justify-center before:rounded-full before:text-xs before:font-bold before:content-[counter(item)]'
                              : 'before:bg-primary before:absolute before:top-[0.6em] before:left-0 before:h-2 before:w-2 before:rounded-full before:content-[""]'
                          }`}
                          {...props}
                        >
                          {children}
                        </li>
                      ),
                      a: ({ children, href, ...props }) => (
                        <a
                          href={href}
                          className="text-primary decoration-primary/40 hover:text-primary-light hover:decoration-primary font-medium underline transition-all"
                          target={href?.startsWith('http') ? '_blank' : undefined}
                          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          {...props}
                        >
                          {children}
                        </a>
                      ),
                      strong: ({ children, ...props }) => (
                        <strong className="font-semibold text-white" {...props}>
                          {children}
                        </strong>
                      ),
                      em: ({ children, ...props }) => (
                        <em className="text-primary italic" {...props}>
                          {children}
                        </em>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="text-primary rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className={`${className} block overflow-x-auto rounded-lg border border-white/10 bg-[#0a1628] p-4 font-mono text-sm`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children, ...props }) => (
                        <pre className="my-6 overflow-hidden rounded-lg shadow-xl" {...props}>
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children, ...props }) => (
                        <blockquote
                          className="border-primary text-text-secondary bg-primary/10 my-6 rounded-r-lg border-l-4 py-4 pr-4 pl-6 italic"
                          {...props}
                        >
                          <div className="flex gap-3">
                            <Zap className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                            <div>{children}</div>
                          </div>
                        </blockquote>
                      ),
                      table: ({ children, ...props }) => (
                        <div className="my-6 overflow-x-auto rounded-lg border border-white/10 shadow-lg">
                          <table className="w-full border-collapse text-sm" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children, ...props }) => (
                        <thead className="bg-primary/10" {...props}>
                          {children}
                        </thead>
                      ),
                      th: ({ children, ...props }) => (
                        <th
                          className="text-primary border-b border-white/10 px-4 py-3 text-left font-semibold"
                          {...props}
                        >
                          {children}
                        </th>
                      ),
                      td: ({ children, ...props }) => (
                        <td
                          className="text-text-secondary border-b border-white/5 px-4 py-3"
                          {...props}
                        >
                          {children}
                        </td>
                      ),
                      hr: ({ ...props }) => (
                        <hr className="bg-primary/30 my-8 h-px border-0" {...props} />
                      ),
                    }}
                  >
                    {currentSection.content}
                  </ReactMarkdown>
                </motion.div>

                {/* Pagination Controls */}
                {hasPagination && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 border-t border-white/10 pt-8"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Previous Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, x: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                          currentPage === 0
                            ? 'cursor-not-allowed bg-white/5 text-white/30'
                            : 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary hover:text-primary-light border'
                        }`}
                      >
                        <ChevronLeft
                          className={`h-5 w-5 transition-transform ${currentPage > 0 ? 'group-hover:-translate-x-1' : ''}`}
                        />
                        <span className="hidden sm:inline">Previous</span>
                      </motion.button>

                      {/* Page Indicators */}
                      <div className="flex items-center gap-2">
                        {sections.map((section, index) => (
                          <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`group relative transition-all ${
                              currentPage === index ? 'h-3 w-8' : 'h-3 w-3 hover:w-8'
                            }`}
                            title={section.title}
                          >
                            <div
                              className={`h-full w-full rounded-full transition-all ${
                                currentPage === index
                                  ? 'bg-primary'
                                  : 'bg-white/20 group-hover:bg-white/40'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Next Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages - 1}
                        className={`group flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                          currentPage === totalPages - 1
                            ? 'cursor-not-allowed bg-white/5 text-white/30'
                            : 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary hover:text-primary-light border'
                        }`}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${currentPage < totalPages - 1 ? 'group-hover:translate-x-1' : ''}`}
                        />
                      </motion.button>
                    </div>

                    {/* Section Progress Bar */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Progress</span>
                        <span className="text-primary font-medium">
                          {Math.round(((currentPage + 1) / totalPages) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          className="bg-primary h-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Footer */}
                <div
                  className={`border-t border-white/10 pt-6 ${hasPagination ? 'mt-8' : 'mt-12'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-text-disabled flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Generated with SmartSlate AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-xs">
                        Version 1.0
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
