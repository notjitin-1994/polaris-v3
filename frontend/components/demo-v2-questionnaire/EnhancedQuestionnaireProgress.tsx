'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type EnhancedQuestionnaireProgressProps = {
  currentStep: number;
  totalSteps: number;
  sections: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  onSectionClick?: (index: number) => void;
};

export function EnhancedQuestionnaireProgress({
  currentStep,
  totalSteps,
  sections,
  onSectionClick,
}: EnhancedQuestionnaireProgressProps): React.JSX.Element {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-10 space-y-6">
      {/* Enhanced Progress Bar */}
      <div className="relative">
        {/* Background track with gradient */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 shadow-inner backdrop-blur-sm">
          {/* Active progress with animation */}
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary shadow-lg"
            style={{
              boxShadow: '0 0 20px rgba(167, 218, 219, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Animated shimmer effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Progress dots with enhanced styling */}
        <div className="absolute top-1/2 left-0 right-0 flex -translate-y-1/2 justify-between px-1">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFuture = index > currentStep;

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => onSectionClick?.(index)}
                className={cn(
                  "relative rounded-full border-2 transition-all duration-300 touch-target-sm",
                  isCurrent && "h-4 w-4 border-primary bg-primary shadow-[0_0_12px_rgba(167,218,219,0.8)] scale-125",
                  isCompleted && "h-3 w-3 border-green-500 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                  isFuture && "h-3 w-3 border-white/20 bg-white/10"
                )}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Go to section ${index + 1}`}
              >
                {isCompleted && (
                  <svg 
                    className="absolute inset-0 w-full h-full text-white p-0.5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Section Info Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 backdrop-blur-sm"
      >
        {/* Decorative gradient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
        
        <div className="relative space-y-3">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary tracking-wide">
              Section {currentStep + 1} of {totalSteps}
            </span>
            <div className="ml-2 text-xs text-primary/70">
              {Math.round(progress)}% Complete
            </div>
          </div>

          {/* Section title */}
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            {sections[currentStep]?.title}
          </h3>

          {/* Section description */}
          {sections[currentStep]?.description && (
            <p className="text-base text-text-secondary leading-relaxed max-w-3xl">
              {sections[currentStep]?.description}
            </p>
          )}

          {/* Progress stats */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-text-secondary">
                <span className="font-semibold text-green-500">{currentStep}</span> completed
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-text-secondary">
                <span className="font-semibold text-primary">{totalSteps - currentStep - 1}</span> remaining
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mini section navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {sections.map((section, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;

          return (
            <motion.button
              key={section.id}
              type="button"
              onClick={() => onSectionClick?.(idx)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                isCurrent && "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/20",
                isCompleted && "bg-green-500/10 text-green-500 border border-green-500/20",
                isFuture && "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                isCurrent && "bg-primary text-white",
                isCompleted && "bg-green-500 text-white",
                isFuture && "bg-white/10 text-white/40"
              )}>
                {isCompleted ? '✓' : idx + 1}
              </span>
              <span className="hidden sm:inline">{section.title.substring(0, 20)}{section.title.length > 20 ? '...' : ''}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}






























