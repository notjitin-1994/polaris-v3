'use client';

import React from 'react';
import { ProgressTrackerProps } from '@/lib/dynamic-form';
import { cn } from '@/lib/utils';

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalSections,
  completedSections,
  currentSection,
  className,
  showPercentage = true,
  showSections = true,
}) => {
  const progressPercentage =
    totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</h3>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {progressPercentage}%
            </span>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            // One-off: Dynamic width for real-time progress indicator
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Form progress: ${progressPercentage}% complete`}
          />
        </div>
      </div>

      {/* Section progress */}
      {showSections && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections</h4>
          <div className="flex space-x-2">
            {Array.from({ length: totalSections }, (_, index) => {
              const sectionNumber = index + 1;
              const isCompleted = sectionNumber <= completedSections;
              const isCurrent = sectionNumber === currentSection;
              const _isUpcoming =
                sectionNumber > completedSections && sectionNumber !== currentSection;

              return (
                <div
                  key={index}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-all duration-300',
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700',
                  )}
                  title={`Section ${sectionNumber}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ' (Upcoming)'}`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Completed: {completedSections}</span>
            <span>Total: {totalSections}</span>
          </div>
        </div>
      )}

      {/* Progress milestones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Milestones</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {completedSections} / {totalSections} sections
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { threshold: 25, label: '25%', icon: '🌱' },
            { threshold: 50, label: '50%', icon: '🌿' },
            { threshold: 75, label: '75%', icon: '🌳' },
            { threshold: 100, label: '100%', icon: '🎉' },
          ].map(({ threshold, label, icon }) => {
            const isReached = progressPercentage >= threshold;
            const isCurrent =
              progressPercentage >= threshold - 25 && progressPercentage < threshold;

            return (
              <div
                key={threshold}
                className={cn(
                  'text-center p-2 rounded-lg transition-all duration-300',
                  isReached
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : isCurrent
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                )}
              >
                <div className="text-lg">{icon}</div>
                <div className="text-xs font-medium">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion message */}
      {progressPercentage === 100 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center">
            <div className="text-green-500 mr-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              All sections completed! Ready to submit.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
