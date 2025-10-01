'use client';

import React, { useState } from 'react';
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
}

export function BlueprintCard({
  blueprint,
  index,
  onRename,
  onResume,
  onDelete,
  questionnaireComplete,
}: BlueprintCardProps): React.JSX.Element {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking for interactive spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
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
          'glass-card border',
          isHovered ? 'border-primary/30' : 'border-white/10'
        )}
        whileHover={{
          y: -4,
          transition: { duration: 0.2 },
        }}
      >
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
        <div className="relative space-y-4 p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            {/* Status Icon & Info */}
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-xl p-2.5',
                  'border transition-all duration-300',
                  status.bgColor,
                  status.borderColor,
                  'relative overflow-hidden'
                )}
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: isHovered ? `0 0 20px ${status.glowColor}` : '0 0 0px rgba(0,0,0,0)',
                }}
              >
                <StatusIcon className={cn('h-5 w-5', status.color)} />

                {/* Pulse animation for generating status */}
                {blueprint.status === 'generating' && (
                  <motion.div
                    className={cn('absolute inset-0 rounded-xl', status.bgColor)}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                {/* Status Badge & Version */}
                <div className="mb-2 flex items-center gap-2">
                  <motion.span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold',
                      status.bgColor,
                      status.color,
                      'border',
                      status.borderColor
                    )}
                    whileHover={{ scale: 1.05 }}
                  >
                    {status.label}
                  </motion.span>
                  <span className="text-xs font-medium text-white/40">v{blueprint.version}</span>

                  {blueprint.blueprint_markdown && (
                    <motion.span
                      className="text-success inline-flex items-center gap-1 text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <TrendingUp className="h-3 w-3" />
                      Generated
                    </motion.span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    'font-heading text-lg leading-tight font-bold transition-colors duration-200',
                    'text-white/95 group-hover:text-white',
                    'line-clamp-2'
                  )}
                  title={blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`}
                >
                  {blueprint.title || `Blueprint #${blueprint.id.slice(0, 8)}`}
                </h3>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(blueprint.created_at)}</span>
            </div>

            {blueprint.updated_at && blueprint.updated_at !== blueprint.created_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {formatDate(blueprint.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {/* Rename Button */}
            <motion.button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'h-10 w-10 rounded-lg',
                'border border-white/10 bg-white/5',
                'text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white',
                'transition-all duration-200'
              )}
              onClick={() => onRename(blueprint)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Rename blueprint"
              aria-label="Rename blueprint"
            >
              <Pencil className="h-4 w-4" />
            </motion.button>

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
                  'shadow-secondary/20 hover:shadow-secondary/30 shadow-lg'
                )}
                onClick={() => onResume(blueprint.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Resume blueprint"
                aria-label="Resume blueprint"
              >
                <Play className="h-4 w-4" />
              </motion.button>
            )}

            {blueprint.status === 'completed' && blueprint.blueprint_markdown && (
              <Link
                href={`/blueprint/${blueprint.id}`}
                className={cn(
                  'flex items-center justify-center',
                  'h-10 w-10 rounded-lg',
                  'bg-secondary hover:bg-secondary-dark',
                  'transition-all duration-200',
                  'shadow-secondary/20 hover:shadow-secondary/30 shadow-lg'
                )}
                title="View Blueprint"
                aria-label="View Blueprint"
              >
                <Eye className="h-4 w-4 text-indigo-200" />
              </Link>
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
