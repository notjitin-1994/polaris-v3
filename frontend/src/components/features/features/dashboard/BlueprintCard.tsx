'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Pencil,
  Play,
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlueprintRow } from '@/lib/db/blueprints';


interface BlueprintCardProps {
  blueprint: BlueprintRow;
  index: number;
  onRename: (blueprint: BlueprintRow) => void;
  onResume: (blueprintId: string) => void;
  onDelete: (blueprintId: string) => void;
  questionnaireComplete: boolean;
  isResuming?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (blueprintId: string) => void;
}

export function BlueprintCard({
  blueprint,
  index,
  onRename,
  onResume,
  onDelete,
  questionnaireComplete,
  isResuming = false,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
}: BlueprintCardProps): React.JSX.Element {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking for interactive spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Status configuration
  const statusConfig = {
    draft: {
      icon: Clock,
      label: 'Draft',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      glowColor: 'rgba(245, 158, 11, 0.2)',
    },
    generating: {
      icon: Sparkles,
      label: 'Generating',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/30',
      glowColor: 'rgba(79, 70, 229, 0.2)',
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      glowColor: 'rgba(16, 185, 129, 0.2)',
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
      glowColor: 'rgba(239, 68, 68, 0.2)',
    },
  };

  const status = statusConfig[blueprint.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
  };

  // Calculate completion percentage (mock for now, can be enhanced with actual data)
  const completionPercentage =
    blueprint.status === 'completed'
      ? 100
      : blueprint.status === 'generating'
        ? 65
        : questionnaireComplete
          ? 40
          : 15;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Main Card Container */}
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-2xl transition-all duration-300',
          'glass-card h-[28rem] border sm:h-[28rem] lg:h-[28rem', // Optimized height for streamlined content
          isSelected && isSelectionMode
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
            : isHovered
              ? 'border-primary/30'
              : 'border-white/10'
        )}
        whileHover={{
          y: -4,
          transition: { duration: 0.2 },
        }}
        onClick={() => isSelectionMode && onSelect?.(blueprint.id)}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <motion.div
            className="absolute top-3 left-3 z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(blueprint.id);
              }}
              className={cn(
                'h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground shadow-primary/30'
                  : 'bg-background/90 border-white/40 hover:border-primary/60 hover:bg-background/95 backdrop-blur-sm'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <CheckSquare className="h-4 w-4" />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${status.glowColor}, transparent 40%)`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Interactive Spotlight */}
        <div className="interactive-spotlight" aria-hidden="true" />

        {/* Card Content */}
        <div className={cn(
          "relative flex h-full flex-col space-y-4",
          isSelectionMode ? "p-6 pl-12" : "p-6"
        )}>
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            {/* Status Info & Title */}
            <div className="min-w-0 flex-1">
              {/* Status Badge - Icon and Text Grouped */}
              <div className="mb-3">
                <motion.div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold',
                    status.bgColor,
                    status.color,
                    'border',
                    status.borderColor
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <StatusIcon className="h-4 w-4" />
                  <span>{status.label}</span>
                </motion.div>
              </div>

              {/* Title with Edit Button */}
              <div className="relative group/title">
                <div className="flex items-start gap-2">
                  {/* Expandable Title Container */}
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className={cn(
                        'font-heading text-lg leading-tight font-bold',
                        'text-white/95',
                        'cursor-pointer select-none',
                        'w-full'
                      )}
                      initial={{ maxHeight: '1.5rem' }}
                      animate={{
                        maxHeight: '1.5rem',
                        lineHeight: '1.25rem'
                      }}
                      whileHover={{
                        maxHeight: '4rem',
                        lineHeight: '1.25rem',
                        scale: [1, 1.02, 1],
                        transition: {
                          duration: 0.4,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          scale: {
                            duration: 0.6,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        }
                      }}
                      title={blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`}
                    >
                      <span className="block truncate group-hover/title:hidden w-full">
                        {blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`}
                      </span>
                      <span className="hidden group-hover/title:block break-words leading-tight w-full">
                        {blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`}
                      </span>
                    </motion.h3>
                  </div>

                  {/* Edit Title Button - Close to title */}
                  <motion.button
                    type="button"
                    className={cn(
                      'flex items-center justify-center mt-1 flex-shrink-0',
                      'h-6 w-6 rounded-md',
                      'text-slate-400 hover:text-slate-300',
                      'hover:bg-slate-700/50',
                      'transition-all duration-200',
                      'opacity-60 hover:opacity-100'
                    )}
                    onClick={() => onRename(blueprint)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit title"
                    aria-label="Edit title"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary Highlight */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.5, duration: 0.4 }}
          >
            {/* Highlight Container - Increased Height */}
            <div className="glass rounded-xl p-5 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[140px]">
              {/* Executive Summary Icon & Label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Executive Summary</span>
                  <div className="h-0.5 w-16 bg-primary/30 mt-1" />
                </div>
              </div>

              {/* Executive Summary Content - Limited to 3 lines */}
              <div className="space-y-3">
                {/* Executive Summary Text with Inline Continue Reading */}
                <div className="text-sm text-white/80 leading-relaxed">
                  {(() => {
                    // Extract and truncate executive summary content to 3 lines
                    try {
                      const blueprintData = blueprint.blueprint_json as any;
                      let content = '';

                      if (blueprintData?.executive_summary?.content) {
                        content = blueprintData.executive_summary.content.split('\n\n')[0]?.trim() || '';
                      } else if (blueprintData?.executive_summary?.overview) {
                        content = blueprintData.executive_summary.overview;
                      } else if (blueprintData?.description) {
                        content = blueprintData.description;
                      } else {
                        content = 'This comprehensive program transforms participants into AI-literate practitioners through a gamified, story-driven learning experience built around compelling narratives and real-world application development.';
                      }

                      // Truncate to exactly 3 lines of text ending with "..."
                      const lines = content.split('\n');
                      let truncatedContent = '';

                      if (lines.length > 3) {
                        // Take first 3 lines and ensure proper truncation
                        const firstThreeLines = lines.slice(0, 3);
                        truncatedContent = firstThreeLines.join('\n');

                        // If the last line is too long, truncate it with "..."
                        const lastLineIndex = truncatedContent.lastIndexOf('\n');
                        if (lastLineIndex !== -1) {
                          const lastLine = truncatedContent.substring(lastLineIndex + 1);
                          if (lastLine.length > 50) { // Approximate characters per line
                            truncatedContent = truncatedContent.substring(0, lastLineIndex + 1) +
                                             lastLine.substring(0, 47) + '...';
                          } else {
                            truncatedContent += '...';
                          }
                        }
                      } else if (content.length > 200) {
                        // For single long lines, truncate to 200 chars with "..."
                        truncatedContent = content.substring(0, 197).replace(/\s+\S*$/, '') + '...';
                      } else {
                        truncatedContent = content;
                      }

                      // Check if content ends with "..." to show continue reading
                      const needsContinueReading = truncatedContent.endsWith('...');

                      return (
                        <p className="leading-relaxed">
                          {truncatedContent}
                          {needsContinueReading && (
                            <motion.button
                              className={cn(
                                'inline-flex items-center gap-1 ml-1',
                                'text-xs font-medium text-primary hover:text-primary-dark',
                                'transition-all duration-200 group',
                                'hover:underline hover:underline-offset-2'
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Continue reading</span>
                              <svg
                                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          )}
                        </p>
                      );
                    } catch {
                      return (
                        <p className="leading-relaxed">
                          This comprehensive program transforms participants into AI-literate practitioners through a gamified, story-driven learning experience...
                          <motion.button
                            className={cn(
                              'inline-flex items-center gap-1 ml-1',
                              'text-xs font-medium text-primary hover:text-primary-dark',
                              'transition-all duration-200 group',
                              'hover:underline hover:underline-offset-2'
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Continue reading</span>
                            <svg
                              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </p>
                      );
                    }
                  })()}
                </div>

                {/* Summary Metrics */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-white/60">Scope</span>
                  </div>
                  <span className="text-xs font-bold text-primary">Comprehensive</span>
                </div>
              </div>

              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 rounded-xl opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              </div>
            </div>
          </motion.div>

          {/* Blueprint Info - Horizontal Display */}
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-4 text-xs">
              {/* Version */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span
                  className="text-white/60 font-medium cursor-help"
                  title={`Version ${blueprint.version}`}
                >
                  v{blueprint.version}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-1.5">
                <div
                  className="cursor-help"
                  title={`Created at ${new Date(blueprint.created_at).toLocaleString()}`}
                >
                  <Calendar className="h-3 w-3 text-white/40" />
                </div>
                <span className="text-white/60 font-medium">{formatDate(blueprint.created_at)}</span>
              </div>

              {/* Updated Date */}
              {blueprint.updated_at && blueprint.updated_at !== blueprint.created_at && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="cursor-help"
                    title={`Updated at ${new Date(blueprint.updated_at).toLocaleString()}`}
                  >
                    <Clock className="h-3 w-3 text-white/40" />
                  </div>
                  <span className="text-white/60 font-medium">{formatDate(blueprint.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar - Absolutely positioned for consistent alignment */}
          <div className="absolute bottom-16 left-6 right-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white/60">Progress</span>
                <motion.span
                  className="text-primary font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.3 }}
                >
                  {completionPercentage}%
                </motion.span>
              </div>

              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="bg-primary absolute inset-y-0 left-0 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{
                    delay: index * 0.08 + 0.4,
                    duration: 1,
                    ease: 'easeOut',
                  }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex items-end justify-end gap-2 pb-0.5">

            {/* Delete Button */}
            <motion.button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'h-10 w-10 rounded-lg',
                'border-error/30 bg-error/10 border',
                'text-error hover:bg-error/90 hover:border-error hover:text-white',
                'transition-all duration-200'
              )}
              onClick={() => onDelete(blueprint.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Delete blueprint"
              aria-label="Delete blueprint"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>

            {/* Status-specific action buttons */}
            {blueprint.status === 'draft' && (
              <motion.button
                type="button"
                className={cn(
                  'flex items-center justify-center',
                  'h-10 w-10 rounded-lg',
                  'bg-secondary hover:bg-secondary-dark',
                  'text-white',
                  'transition-all duration-200',
                  'shadow-secondary/20 hover:shadow-secondary/30 shadow-lg',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                onClick={() => onResume(blueprint.id)}
                disabled={isResuming}
                whileHover={!isResuming ? { scale: 1.05 } : {}}
                whileTap={!isResuming ? { scale: 0.95 } : {}}
                title={isResuming ? 'Loading...' : 'Resume blueprint'}
                aria-label={isResuming ? 'Loading blueprint' : 'Resume blueprint'}
              >
                {isResuming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="h-4 w-4"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </motion.button>
            )}

            {blueprint.status === 'completed' && blueprint.blueprint_markdown && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/blueprint/${blueprint.id}`}
                  className={cn(
                    'flex items-center justify-center',
                    'h-10 w-10 rounded-lg',
                    'border-indigo-400/30 bg-indigo-500/10 border',
                    'text-indigo-400 hover:bg-indigo-500 hover:border-indigo-400 hover:text-white',
                    'transition-all duration-200'
                  )}
                  title="View Blueprint"
                  aria-label="View Blueprint"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </motion.div>
            )}

            {blueprint.status === 'generating' && (
              <div className="bg-secondary/10 border-secondary/30 flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="text-secondary h-4 w-4" />
                </motion.div>
                <span className="text-secondary text-sm font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className={cn(
            'h-1',
            blueprint.status === 'completed'
              ? 'bg-success'
              : blueprint.status === 'generating'
                ? 'bg-secondary'
                : 'bg-primary'
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0.5 }}
        />
      </motion.div>

      {/* Hover elevation shadow */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-2xl"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: `0 20px 60px -15px ${status.glowColor}`,
          filter: 'blur(20px)',
        }}
      />
    </motion.div>
  );
}
