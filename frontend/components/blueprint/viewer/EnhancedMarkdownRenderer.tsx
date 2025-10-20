/**
 * Enhanced Markdown Renderer
 * Magazine-style layouts with rich typography
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/tokyo-night-dark.css';
import {
  Quote,
  Info,
  AlertCircle,
  CheckCircle,
  Zap,
  BookOpen,
  Code,
  ExternalLink,
} from 'lucide-react';
import {
  cn,
  typographyPresets,
  magazineLayouts,
  glassCard,
  itemAnimations,
} from '@/lib/design-system';
import type { LayoutMode } from './BlueprintViewer';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface EnhancedMarkdownRendererProps {
  markdown: string;
  sections: Section[];
  showAnnotations: boolean;
  layoutMode: LayoutMode;
}

export function EnhancedMarkdownRenderer({
  markdown,
  sections,
  showAnnotations,
  layoutMode,
}: EnhancedMarkdownRendererProps): React.JSX.Element {
  // Apply magazine layout features based on layout mode
  const enableDropCaps = layoutMode === 'spacious';
  const enableColumns = layoutMode === 'spacious';
  const enablePullQuotes = layoutMode !== 'compact';

  return (
    <motion.article
      variants={itemAnimations.fadeInUp}
      className={cn(
        'prose prose-invert prose-lg max-w-none',
        layoutMode === 'spacious' && 'prose-xl',
        layoutMode === 'compact' && 'prose-base'
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          // Enhanced headings with decorative elements
          h1: ({ children }) => (
            <motion.h1
              variants={itemAnimations.fadeInScale}
              className={cn(
                typographyPresets.heroTitle,
                'mt-12 mb-8 border-b border-white/10 pb-6',
                'from-foreground via-primary to-foreground bg-gradient-to-r bg-clip-text text-transparent',
                enableDropCaps && magazineLayouts.dropCap
              )}
            >
              {children}
            </motion.h1>
          ),

          h2: ({ children }) => (
            <motion.h2
              variants={itemAnimations.fadeInUp}
              className={cn(
                typographyPresets.articleTitle,
                'group mt-10 mb-6 flex items-center gap-4'
              )}
            >
              <span className="from-primary h-1 w-12 rounded-full bg-gradient-to-r to-transparent" />
              {children}
            </motion.h2>
          ),

          h3: ({ children }) => (
            <motion.h3
              variants={itemAnimations.fadeInUp}
              className={cn('text-foreground text-2xl font-semibold', 'mt-8 mb-4')}
            >
              {children}
            </motion.h3>
          ),

          // Paragraphs with optional column layout
          p: ({ children }) => {
            // Check if this paragraph contains only an image
            const isImageOnly =
              React.Children.count(children) === 1 &&
              React.isValidElement(children) &&
              (children as any).type === 'img';

            if (isImageOnly) {
              return <div className="my-8">{children}</div>;
            }

            return (
              <p
                className={cn(
                  typographyPresets.articleBody,
                  'text-text-secondary mb-6',
                  enableColumns && sections.length > 3 && magazineLayouts.columns.two
                )}
              >
                {children}
              </p>
            );
          },

          // Enhanced blockquotes as pull quotes
          blockquote: ({ children }) => (
            <motion.blockquote
              variants={itemAnimations.slideInLeft}
              className={cn(
                glassCard.base,
                'border-primary relative my-8 border-l-4 p-6',
                enablePullQuotes && magazineLayouts.pullQuote
              )}
            >
              <Quote className="text-primary/20 absolute -top-3 -left-3 h-8 w-8" />
              <div className="relative z-10">{children}</div>
            </motion.blockquote>
          ),

          // Code blocks with syntax highlighting
          pre: ({ children }) => (
            <motion.pre
              variants={itemAnimations.fadeInScale}
              className={cn(glassCard.base, 'my-6 overflow-hidden !bg-[#1a1b26] p-0')}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <Code className="text-primary h-4 w-4" />
                <span className="text-text-secondary text-xs">Code</span>
              </div>
              <div className="overflow-x-auto p-4">{children}</div>
            </motion.pre>
          ),

          // Inline code styling
          code: ({ children, ...props }) => {
            return (
              <code
                className={cn(
                  'border-primary/20 bg-primary/10 rounded-md border',
                  'text-primary px-1.5 py-0.5 font-mono text-sm'
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Enhanced lists
          ul: ({ children }) => <ul className="my-6 space-y-3">{children}</ul>,

          li: ({ children }) => (
            <li
              className={cn(
                'text-text-secondary relative pl-8',
                'before:absolute before:top-[0.6em] before:left-0',
                'before:bg-primary before:h-2 before:w-2 before:rounded-full',
                'hover:text-foreground transition-colors'
              )}
            >
              {children}
            </li>
          ),

          // Tables with glass morphism
          table: ({ children }) => (
            <div className={cn(glassCard.base, 'my-8 overflow-hidden')}>
              <div className="overflow-x-auto">
                <table className="w-full">{children}</table>
              </div>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="border-b border-white/10 bg-white/5">{children}</thead>
          ),

          th: ({ children }) => (
            <th
              className={cn(
                'text-primary px-4 py-3 text-left font-semibold',
                typographyPresets.labelText
              )}
            >
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="text-text-secondary border-b border-white/5 px-4 py-3">{children}</td>
          ),

          // Links with external indicator
          a: ({ children, href }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                className={cn(
                  'inline-flex items-center gap-1',
                  'text-primary decoration-primary/40 underline',
                  'hover:text-primary-light hover:decoration-primary',
                  'transition-colors'
                )}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            );
          },

          // Images with enhanced styling
          img: ({ src, alt }) => (
            <motion.figure variants={itemAnimations.fadeInScale} className="my-8">
              <div className={cn(glassCard.base, 'overflow-hidden p-2')}>
                <img src={src} alt={alt} className="w-full rounded-lg" loading="lazy" />
              </div>
              {alt && (
                <figcaption className="text-text-secondary mt-3 text-center text-sm">
                  {alt}
                </figcaption>
              )}
            </motion.figure>
          ),

          // Horizontal rules as decorative elements
          hr: () => (
            <div className="my-12 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <Zap className="text-primary h-5 w-5" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </motion.article>
  );
}
