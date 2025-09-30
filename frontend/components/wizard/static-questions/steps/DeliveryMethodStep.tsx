import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function DeliveryMethodStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="resources" className="text-primary block text-lg font-semibold">
          What resources and budgets are available?
        </label>
        <p className="text-secondary text-sm">
          Summarize people, tools, content, platforms, and budget constraints that apply.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          id="resources"
          {...register('resources')}
          className={`min-h-28 w-full resize-none rounded-lg border-2 p-4 text-base transition-colors ${
            errors.resources
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-900/20'
              : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'
          } placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-500`}
          placeholder="e.g., 1 SME, 2 IDs, Articulate 360, LMS, $15k budget, access to analytics"
          aria-invalid={!!errors.resources}
          aria-describedby={errors.resources ? 'resources-error' : undefined}
        />
        {errors.resources && (
          <p
            id="resources-error"
            className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {errors.resources.message}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <p className="mb-1 font-medium">Considerations:</p>
            <p>
              Be explicit about staffing, tooling, and budget limits. This shapes scope, sequencing,
              and delivery realism.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
