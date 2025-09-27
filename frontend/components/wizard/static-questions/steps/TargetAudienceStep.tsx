'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function TargetAudienceStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="targetAudience"
          className="block text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Who is your target audience?
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe the learners who will benefit from this content. Consider their background,
          experience level, and learning goals.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          id="targetAudience"
          {...register('targetAudience')}
          className={`
            w-full min-h-28 p-4 text-base rounded-lg border-2 transition-colors resize-none
            ${
              errors.targetAudience
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-500'
            }
            dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
          `}
          placeholder="e.g., Frontend developers with 1-2 years of experience who want to learn React, junior full-stack developers, product managers who need to understand technical concepts..."
          aria-invalid={!!errors.targetAudience}
          aria-describedby={errors.targetAudience ? 'targetAudience-error' : undefined}
        />
        {errors.targetAudience && (
          <p
            id="targetAudience-error"
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.targetAudience.message}
          </p>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">Tip:</p>
            <p>
              Be specific about experience levels and prior knowledge. This helps tailor the content
              appropriately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
