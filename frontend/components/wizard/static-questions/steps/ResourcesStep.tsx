'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';
import { QuestionnaireInput } from '@/components/wizard/static-questions/QuestionnaireInput';

export function ResourcesStep(): JSX.Element {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<StaticQuestionsFormValues>();

  const resources = watch('resources');

  return (
    <div className="animate-fade-in-up space-y-6">
      <QuestionnaireInput
        label="What resources and budgets are available?"
        value={resources}
        onChange={(value) => setValue('resources', value)}
        placeholder="e.g., $50K budget, 6-month timeline, LMS platform available, subject matter experts accessible"
        error={errors.resources?.message}
        helpText="Available resources, tools, budget, and support for this initiative"
        required
        multiline
        rows={4}
      />

      <div
        className="animate-fade-in rounded-lg p-4"
        style={{
          backgroundColor: 'rgba(167, 218, 219, 0.1)',
          border: '1px solid rgba(167, 218, 219, 0.2)',
        }}
      >
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            style={{ color: '#a7dadb' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm" style={{ color: '#d0edf0' }}>
            <p className="mb-2 font-medium">What to include:</p>
            <ul className="list-inside list-disc space-y-1.5 text-xs text-white/70">
              <li>
                <strong>Budget:</strong> Total amount available (e.g., &quot;$50K for pilot
                phase&quot;)
              </li>
              <li>
                <strong>Timeline:</strong> How much time you have (e.g., &quot;Need to launch in 6
                months&quot;)
              </li>
              <li>
                <strong>Technology:</strong> Existing platforms (e.g., &quot;We have Microsoft Teams
                and an LMS&quot;)
              </li>
              <li>
                <strong>People:</strong> Team support (e.g., &quot;2 instructional designers, access
                to 5 subject matter experts&quot;)
              </li>
              <li>
                <strong>Content:</strong> Existing materials you can reuse (e.g., &quot;Have product
                documentation and training videos&quot;)
              </li>
            </ul>
            <p className="mt-2 text-xs text-white/60">
              💡 Even approximate amounts help us create realistic recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
