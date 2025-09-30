import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { PolarisStep } from '../hooks/usePolarisState';

interface NavigationItem {
  id: PolarisStep;
  label: string;
  icon?: string;
}

interface PolarisNavigationProps {
  activeStep: PolarisStep;
  onStepChange: (step: PolarisStep) => void;
  isStepComplete: (step: PolarisStep) => boolean;
  canProgressToStep: (step: PolarisStep) => boolean;
  currentStepNumber: number;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'experience', label: 'Experience', icon: '🎯' },
  { id: 'static', label: 'Context', icon: '📊' },
  { id: 'stage2', label: 'Stage 2', icon: '🔍' },
  { id: 'stage3', label: 'Stage 3', icon: '💡' },
  { id: 'stage4', label: 'Stage 4', icon: '🚀' },
  { id: 'stage5', label: 'Stage 5', icon: '🎨' },
  { id: 'report', label: 'Report', icon: '📋' },
];

export const PolarisNavigation = memo(function PolarisNavigation({
  activeStep,
  onStepChange,
  isStepComplete,
  canProgressToStep,
  currentStepNumber,
}: PolarisNavigationProps) {
  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <nav className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          {NAVIGATION_ITEMS.map((item, index) => {
            const isActive = activeStep === item.id;
            const isComplete = isStepComplete(item.id);
            const canAccess = canProgressToStep(item.id);

            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => canAccess && onStepChange(item.id)}
                  disabled={!canAccess}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200',
                    'text-sm font-medium',
                    isActive && 'bg-primary-500/20 text-primary-300 border-primary-400/30 border',
                    !isActive && canAccess && 'text-white/70 hover:bg-white/10 hover:text-white',
                    !canAccess && 'cursor-not-allowed text-white/40 opacity-40',
                    isComplete && !isActive && 'text-green-400/70'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {isComplete && (
                    <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {index < NAVIGATION_ITEMS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 transition-colors duration-200',
                      isStepComplete(NAVIGATION_ITEMS[index].id) ? 'bg-green-400/30' : 'bg-white/10'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentStepNumber - 2);
              const prevStep = NAVIGATION_ITEMS[prevIndex].id;
              if (canProgressToStep(prevStep)) {
                onStepChange(prevStep);
              }
            }}
            disabled={currentStepNumber === 1}
            className={cn(
              'rounded-lg p-2 transition-colors',
              currentStepNumber === 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-white/10'
            )}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">{NAVIGATION_ITEMS[currentStepNumber - 1]?.icon}</span>
            <span className="font-medium">{NAVIGATION_ITEMS[currentStepNumber - 1]?.label}</span>
            <span className="text-sm text-white/50">
              ({currentStepNumber}/{NAVIGATION_ITEMS.length})
            </span>
          </div>

          <button
            onClick={() => {
              const nextIndex = Math.min(NAVIGATION_ITEMS.length - 1, currentStepNumber);
              const nextStep = NAVIGATION_ITEMS[nextIndex].id;
              if (canProgressToStep(nextStep)) {
                onStepChange(nextStep);
              }
            }}
            disabled={
              currentStepNumber === NAVIGATION_ITEMS.length ||
              !canProgressToStep(NAVIGATION_ITEMS[currentStepNumber]?.id)
            }
            className={cn(
              'rounded-lg p-2 transition-colors',
              currentStepNumber === NAVIGATION_ITEMS.length ||
                !canProgressToStep(NAVIGATION_ITEMS[currentStepNumber]?.id)
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-white/10'
            )}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress Dots */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {NAVIGATION_ITEMS.map((item, index) => {
            const isActive = index === currentStepNumber - 1;
            const isComplete = isStepComplete(item.id);

            return (
              <button
                key={item.id}
                onClick={() => canProgressToStep(item.id) && onStepChange(item.id)}
                disabled={!canProgressToStep(item.id)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200',
                  isActive && 'bg-primary-400 w-6',
                  !isActive && isComplete && 'bg-green-400/50',
                  !isActive && !isComplete && 'bg-white/20',
                  !canProgressToStep(item.id) && 'cursor-not-allowed'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
