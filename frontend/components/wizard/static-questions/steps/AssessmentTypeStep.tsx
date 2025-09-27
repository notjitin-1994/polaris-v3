'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function AssessmentTypeStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  const assessmentExamples = [
    'Multiple choice quizzes',
    'Practical projects',
    'Code reviews',
    'Peer assessments',
    'Written assignments',
    'Live presentations',
    'Portfolio reviews',
    'Self-assessments',
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="assessmentType"
          className="block text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          What type of assessment will you use?
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe how learners will demonstrate their understanding and skills. This could be
          quizzes, projects, presentations, or other evaluation methods.
        </p>
      </div>

      <div className="space-y-2">
        <input
          id="assessmentType"
          type="text"
          {...register('assessmentType')}
          className={`
            w-full p-4 text-base rounded-lg border-2 transition-colors
            ${
              errors.assessmentType
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 focus-visible:border-red-500 focus-visible:ring-red-500/50'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-visible:border-blue-500 focus-visible:ring-blue-500/50'
            }
            dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
          `}
          placeholder="e.g., Final project with code review, weekly quizzes, peer code reviews..."
          aria-invalid={!!errors.assessmentType}
          aria-describedby={errors.assessmentType ? 'assessmentType-error' : undefined}
        />
        {errors.assessmentType && (
          <p
            id="assessmentType-error"
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.assessmentType.message}
          </p>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-indigo-800 dark:text-indigo-200">
            <p className="font-medium mb-2">Common Assessment Types:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentExamples.map((example, index) => (
                <span key={index} className="text-xs">
                  • {example}
                </span>
              ))}
            </div>
            <p className="mt-2 font-medium">Tips:</p>
            <p className="text-xs">
              Choose assessments that align with your learning objectives and delivery method.
              Consider both formative (ongoing) and summative (final) evaluations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
