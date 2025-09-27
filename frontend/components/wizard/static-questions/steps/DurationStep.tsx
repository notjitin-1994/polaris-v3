'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function DurationStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="duration"
          className="block text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          How long should this learning experience be?
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Specify the total duration in hours. This helps determine the depth and scope of content.
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            id="duration"
            type="number"
            min={1}
            step={1}
            {...register('duration', { valueAsNumber: true })}
            className={`
              w-32 p-4 text-center text-2xl font-bold rounded-lg border-2 transition-colors
              ${
                errors.duration
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-500'
              }
              dark:text-slate-100
            `}
            aria-invalid={!!errors.duration}
            aria-describedby={errors.duration ? 'duration-error' : undefined}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <span className="text-sm font-medium">hours</span>
          </div>
        </div>

        {errors.duration && (
          <p
            id="duration-error"
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.duration.message}
          </p>
        )}
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <p className="font-medium mb-1">Duration Guidelines:</p>
            <ul className="space-y-1">
              <li>
                • <strong>1-4 hours:</strong> Quick workshop or focused tutorial
              </li>
              <li>
                • <strong>5-12 hours:</strong> Comprehensive course module
              </li>
              <li>
                • <strong>13-40 hours:</strong> Full course or certification program
              </li>
              <li>
                • <strong>40+ hours:</strong> Intensive bootcamp or semester-long course
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
