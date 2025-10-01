'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { BookOpen, Calendar, Target, Zap, BarChart3, FileText, Sparkles } from 'lucide-react';
import 'highlight.js/styles/tokyo-night-dark.css';
import type { AnyBlueprint } from '@/lib/ollama/schema';
import { BlueprintDashboard } from './BlueprintDashboard';
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

export function BlueprintRenderer({
  markdown,
  blueprint,
  isEditMode = false,
  onSaveMarkdown,
  onCancelEdit,
}: BlueprintRendererProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>(blueprint ? 'dashboard' : 'markdown');

  // Auto-switch to markdown tab when edit mode is enabled
  React.useEffect(() => {
    if (isEditMode) {
      setActiveTab('markdown');
    }
  }, [isEditMode]);

  const tabs = [
    ...(blueprint
      ? [
          {
            id: 'dashboard' as TabType,
            label: 'Analytics',
            icon: BarChart3,
            description: 'Visual insights',
          },
        ]
      : []),
    {
      id: 'markdown' as TabType,
      label: 'Content',
      icon: FileText,
      description: 'Detailed view',
    },
  ];

  return (
    <article className="blueprint-content">
      {/* Enhanced Tabbed Navigation */}
      {blueprint && (
        <div className="mb-10">
          <div className="relative">
            {/* Tab Background Glow */}
            <div className="from-primary-500/10 to-secondary/10 absolute inset-0 rounded-2xl bg-gradient-to-r via-transparent blur-xl" />

            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-2 backdrop-blur-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {/* Animated background for active tab */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="from-primary-500/30 to-primary-600/30 border-primary-500/50 absolute inset-0 rounded-xl border bg-gradient-to-r"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Tab content */}
                    <div className="relative flex items-center gap-2">
                      <Icon
                        className={`h-5 w-5 transition-all duration-300 ${
                          isActive
                            ? 'text-primary-400 drop-shadow-glow'
                            : 'group-hover:text-primary-300'
                        }`}
                      />
                      <div className="text-left">
                        <div className="font-heading text-sm font-semibold sm:text-base">
                          {tab.label}
                        </div>
                        <div className="hidden text-xs opacity-70 sm:block">{tab.description}</div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
                      >
                        <span className="bg-primary-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                        <span className="bg-primary-400 relative inline-flex h-3 w-3 rounded-full" />
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
            <BlueprintDashboard blueprint={blueprint} />
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
                <div className="mb-8 flex flex-wrap gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="from-primary-500/20 to-primary-600/20 border-primary-500/30 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2"
                  >
                    <BookOpen className="text-primary-400 h-4 w-4" />
                    <span className="text-primary-300 font-medium">Learning Blueprint</span>
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
                    className="from-secondary/20 to-secondary/30 border-secondary/40 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2"
                  >
                    <Sparkles className="text-secondary h-4 w-4" />
                    <span className="text-secondary">AI Enhanced</span>
                  </motion.div>
                </div>

                {/* Main markdown content with enhanced styling */}
                <div className="prose prose-blueprint prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                    components={{
                      h1: ({ children, ...props }) => (
                        <h1
                          className="font-heading border-gradient-to-r from-primary-500/30 mt-8 mb-6 border-b via-transparent to-transparent pb-4 text-4xl font-bold text-white"
                          {...props}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2
                          className="font-heading group text-primary-400 mt-8 mb-4 flex items-center gap-3 text-3xl font-bold"
                          {...props}
                        >
                          <span className="from-primary-500 to-primary-600 h-8 w-1 rounded-full bg-gradient-to-b transition-all group-hover:h-10" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3
                          className="font-heading text-primary-300 mt-6 mb-3 text-2xl font-semibold"
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
                              ? 'before:counter-increment-item before:from-primary-500/20 before:to-primary-600/20 before:text-primary-400 before:absolute before:top-0 before:left-0 before:flex before:h-6 before:w-6 before:items-center before:justify-center before:rounded-full before:bg-gradient-to-br before:text-xs before:font-bold before:content-[counter(item)]'
                              : 'before:from-primary-500 before:to-primary-600 before:absolute before:top-[0.6em] before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-gradient-to-br before:content-[""]'
                          }`}
                          {...props}
                        >
                          {children}
                        </li>
                      ),
                      a: ({ children, href, ...props }) => (
                        <a
                          href={href}
                          className="text-primary-400 decoration-primary-500/40 hover:text-primary-300 hover:decoration-primary-400 font-medium underline transition-all"
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
                        <em className="text-primary-300 italic" {...props}>
                          {children}
                        </em>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="text-primary-300 rounded-md border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-1.5 py-0.5 font-mono text-sm"
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
                          className="border-primary-500 from-primary-500/10 text-text-secondary my-6 rounded-r-lg border-l-4 bg-gradient-to-r to-transparent py-4 pr-4 pl-6 italic"
                          {...props}
                        >
                          <div className="flex gap-3">
                            <Zap className="text-primary-400 mt-1 h-5 w-5 flex-shrink-0" />
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
                        <thead
                          className="from-primary-500/10 to-primary-600/10 bg-gradient-to-r"
                          {...props}
                        >
                          {children}
                        </thead>
                      ),
                      th: ({ children, ...props }) => (
                        <th
                          className="text-primary-400 border-b border-white/10 px-4 py-3 text-left font-semibold"
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
                        <hr
                          className="via-primary-500/30 my-8 h-px border-0 bg-gradient-to-r from-transparent to-transparent"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>

                {/* Enhanced Footer */}
                <div className="mt-12 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-text-disabled flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Generated with SmartSlate AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="from-primary-500/10 to-primary-600/10 text-primary-300 rounded-full bg-gradient-to-r px-3 py-1 text-xs">
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
