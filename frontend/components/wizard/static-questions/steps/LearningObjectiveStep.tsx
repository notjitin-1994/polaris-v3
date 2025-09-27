'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function LearningObjectiveStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="learningObjective"
          className="block text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          What is your learning objective?
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe what you want learners to achieve by the end of this learning experience. Be
          specific about the skills, knowledge, or behaviors they should gain.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          id="learningObjective"
          {...register('learningObjective')}
          className={`
            w-full min-h-32 p-4 text-base rounded-lg border-2 transition-colors resize-none
            ${
              errors.learningObjective
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-500'
            }
            dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
          `}
          placeholder="e.g., By the end of this course, learners will be able to design and implement a responsive web application using React and modern CSS techniques..."
          aria-invalid={!!errors.learningObjective}
          aria-describedby={errors.learningObjective ? 'learningObjective-error' : undefined}
        />
        {errors.learningObjective && (
          <p
            id="learningObjective-error"
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.learningObjective.message}
          </p>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Tip:</p>
            <p>
              Focus on observable outcomes. Instead of &quot;understand React&quot;, try &quot;build a complete
              React application with routing and state management&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
