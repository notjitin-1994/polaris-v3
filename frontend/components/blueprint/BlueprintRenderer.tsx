'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { BookOpen, Calendar, Target, Zap, BarChart3, FileText, Edit3 } from 'lucide-react';
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
            label: 'Dashboard',
            icon: BarChart3,
          },
        ]
      : []),
    {
      id: 'markdown' as TabType,
      label: 'Markdown',
      icon: FileText,
    },
  ];

  return (
    <article className="blueprint-content">
      {/* Tabbed Navigation - Only show if blueprint exists */}
      {blueprint && (
        <div className="mb-8">
          <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {/* Animated background for active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="bg-primary-500/20 border-primary-500/40 absolute inset-0 rounded-xl border"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Tab content */}
                  <Icon
                    className={`relative h-5 w-5 transition-colors duration-300 ${
                      isActive ? 'text-primary-400' : ''
                    }`}
                  />
                  <span className="font-heading relative text-sm sm:text-base">{tab.label}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary-400 absolute -top-1 -right-1 h-2 w-2 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content with Animations */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && blueprint ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <BlueprintDashboard blueprint={blueprint} />
          </motion.div>
        ) : (
          <motion.div
            key="markdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Show Editor or Rendered Markdown */}
            {isEditMode && onSaveMarkdown && onCancelEdit ? (
              <MarkdownEditor markdown={markdown} onSave={onSaveMarkdown} onCancel={onCancelEdit} />
            ) : (
              <>
                {/* Enhanced visual hierarchy with icon badges */}
                <div className="mb-8 flex flex-wrap gap-3">
                  <div className="bg-primary-500/10 border-primary-500/20 text-primary-400 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Learning Blueprint</span>
                  </div>
                  <div className="text-text-secondary inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                    <Target className="h-4 w-4" />
                    <span>Personalized Path</span>
                  </div>
                </div>

                {/* Main markdown content with professional styling */}
                <div className="prose prose-blueprint prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                    components={{
                      h1: ({ children, ...props }) => (
                        <h1
                          className="border-primary-500/30 font-heading mt-8 mb-6 border-b pb-3 text-4xl font-bold text-white"
                          {...props}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2
                          className="text-primary-400 font-heading group mt-8 mb-4 flex items-center gap-3 text-3xl font-bold"
                          {...props}
                        >
                          <span className="bg-primary-500 h-8 w-1 rounded-full transition-all group-hover:h-10" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3
                          className="text-primary-300 font-heading mt-6 mb-3 text-2xl font-semibold"
                          {...props}
                        >
                          {children}
                        </h3>
                      ),
                      h4: ({ children, ...props }) => (
                        <h4
                          className="text-text-primary font-heading mt-4 mb-2 text-xl font-semibold"
                          {...props}
                        >
                          {children}
                        </h4>
                      ),
                      h5: ({ children, ...props }) => (
                        <h5
                          className="text-text-primary font-heading mt-3 mb-2 text-lg font-medium"
                          {...props}
                        >
                          {children}
                        </h5>
                      ),
                      h6: ({ children, ...props }) => (
                        <h6
                          className="text-text-secondary font-heading mt-3 mb-2 text-base font-medium"
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
                      li: ({ children, ordered, ...props }) => (
                        <li
                          className={`text-text-secondary relative pl-7 ${
                            ordered
                              ? 'before:counter-increment-item before:bg-primary-500/20 before:text-primary-400 before:absolute before:top-0 before:left-0 before:flex before:h-5 before:w-5 before:items-center before:justify-center before:rounded-full before:text-xs before:font-bold before:content-[counter(item)]'
                              : 'before:bg-primary-500 before:absolute before:top-[0.6em] before:left-0 before:h-1.5 before:w-1.5 before:rounded-full before:content-[""]'
                          }`}
                          {...props}
                        >
                          {children}
                        </li>
                      ),
                      a: ({ children, href, ...props }) => (
                        <a
                          href={href}
                          className="text-primary-400 hover:text-primary-300 decoration-primary-500/40 hover:decoration-primary-400 font-medium underline transition-colors"
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
                            className="text-primary-300 rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-sm"
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
                        <pre className="my-6 overflow-hidden rounded-lg" {...props}>
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children, ...props }) => (
                        <blockquote
                          className="border-primary-500 bg-primary-500/5 text-text-secondary my-6 rounded-r-lg border-l-4 py-4 pr-4 pl-6 italic"
                          {...props}
                        >
                          <div className="flex gap-3">
                            <Zap className="text-primary-400 mt-1 h-5 w-5 flex-shrink-0" />
                            <div>{children}</div>
                          </div>
                        </blockquote>
                      ),
                      table: ({ children, ...props }) => (
                        <div className="my-6 overflow-x-auto rounded-lg border border-white/10">
                          <table className="w-full border-collapse text-sm" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children, ...props }) => (
                        <thead className="bg-primary-500/10" {...props}>
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

                {/* Footer badge */}
                <div className="text-text-disabled mt-12 flex items-center justify-between border-t border-white/10 pt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Generated with SmartSlate AI</span>
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
