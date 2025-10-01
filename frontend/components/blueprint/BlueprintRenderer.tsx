'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
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
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 via-transparent to-secondary/10 blur-xl" />
            
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
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/30 to-primary-600/30 border border-primary-500/50"
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
                        <div className="font-heading text-sm sm:text-base font-semibold">
                          {tab.label}
                        </div>
                        <div className="hidden sm:block text-xs opacity-70">
                          {tab.description}
                        </div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-400" />
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
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 px-4 py-2"
                  >
                    <BookOpen className="h-4 w-4 text-primary-400" />
                    <span className="font-medium text-primary-300">Learning Blueprint</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2"
                  >
                    <Target className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Personalized Path</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/30 border border-secondary/40 px-4 py-2"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
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
                          className="font-heading mt-8 mb-6 pb-4 text-4xl font-bold text-white border-b border-gradient-to-r from-primary-500/30 via-transparent to-transparent"
                          {...props}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2
                          className="font-heading group mt-8 mb-4 flex items-center gap-3 text-3xl font-bold text-primary-400"
                          {...props}
                        >
                          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-primary-600 transition-all group-hover:h-10" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3
                          className="font-heading mt-6 mb-3 text-2xl font-semibold text-primary-300"
                          {...props}
                        >
                          {children}
                        </h3>
                      ),
                      h4: ({ children, ...props }) => (
                        <h4
                          className="font-heading mt-4 mb-2 text-xl font-semibold text-text-primary"
                          {...props}
                        >
                          {children}
                        </h4>
                      ),
                      h5: ({ children, ...props }) => (
                        <h5
                          className="font-heading mt-3 mb-2 text-lg font-medium text-text-primary"
                          {...props}
                        >
                          {children}
                        </h5>
                      ),
                      h6: ({ children, ...props }) => (
                        <h6
                          className="font-heading mt-3 mb-2 text-base font-medium text-text-secondary"
                          {...props}
                        >
                          {children}
                        </h6>
                      ),
                      p: ({ children, ...props }) => (
                        <p
                          className="mb-4 text-base leading-relaxed text-text-secondary"
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
                      li: ({ children, ordered, ...props }) => (
                        <li
                          className={`relative pl-8 text-text-secondary transition-colors hover:text-text-primary ${
                            ordered
                              ? 'before:counter-increment-item before:absolute before:top-0 before:left-0 before:flex before:h-6 before:w-6 before:items-center before:justify-center before:rounded-full before:bg-gradient-to-br before:from-primary-500/20 before:to-primary-600/20 before:text-xs before:font-bold before:text-primary-400 before:content-[counter(item)]'
                              : 'before:absolute before:top-[0.6em] before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-gradient-to-br before:from-primary-500 before:to-primary-600 before:content-[""]'
                          }`}
                          {...props}
                        >
                          {children}
                        </li>
                      ),
                      a: ({ children, href, ...props }) => (
                        <a
                          href={href}
                          className="font-medium text-primary-400 underline decoration-primary-500/40 transition-all hover:text-primary-300 hover:decoration-primary-400"
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
                        <em className="italic text-primary-300" {...props}>
                          {children}
                        </em>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="rounded-md border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-1.5 py-0.5 font-mono text-sm text-primary-300"
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
                          className="my-6 rounded-r-lg border-l-4 border-primary-500 bg-gradient-to-r from-primary-500/10 to-transparent py-4 pr-4 pl-6 italic text-text-secondary"
                          {...props}
                        >
                          <div className="flex gap-3">
                            <Zap className="mt-1 h-5 w-5 flex-shrink-0 text-primary-400" />
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
                        <thead className="bg-gradient-to-r from-primary-500/10 to-primary-600/10" {...props}>
                          {children}
                        </thead>
                      ),
                      th: ({ children, ...props }) => (
                        <th
                          className="border-b border-white/10 px-4 py-3 text-left font-semibold text-primary-400"
                          {...props}
                        >
                          {children}
                        </th>
                      ),
                      td: ({ children, ...props }) => (
                        <td
                          className="border-b border-white/5 px-4 py-3 text-text-secondary"
                          {...props}
                        >
                          {children}
                        </td>
                      ),
                      hr: ({ ...props }) => (
                        <hr
                          className="my-8 h-px border-0 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
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
                    <div className="flex items-center gap-3 text-sm text-text-disabled">
                      <Calendar className="h-4 w-4" />
                      <span>Generated with SmartSlate AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-xs text-primary-300">
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