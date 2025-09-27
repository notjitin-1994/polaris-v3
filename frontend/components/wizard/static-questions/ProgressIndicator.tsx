'use client';

import React from 'react';
import { wizardSteps } from '@/components/wizard/static-questions/types';

type ProgressProps = {
  currentIndex: number;
  onSelect?: (index: number) => void;
};

export function ProgressIndicator({ currentIndex, onSelect }: ProgressProps): JSX.Element {
  const percent = Math.round(((currentIndex + 1) / wizardSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Step {currentIndex + 1} of {wizardSteps.length}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {percent}% complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-out"
            // One-off: Dynamic width for wizard step progress indicator
            style={{ width: `${percent}%` }}
          />
        </div>
        {/* Progress dots */}
        <div className="flex justify-between mt-2">
          {wizardSteps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx <= currentIndex
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex flex-wrap gap-2">
        {wizardSteps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const canAccess = idx <= currentIndex;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect?.(idx)}
              disabled={!canAccess}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : isCompleted
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                      : canAccess
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }
                ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="flex items-center gap-2">
                {isCompleted && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isCurrent && <div className="w-2 h-2 bg-white rounded-full" />}
                {idx + 1}. {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
