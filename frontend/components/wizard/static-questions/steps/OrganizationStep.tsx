'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';
import { QuestionnaireInput } from '@/components/wizard/static-questions/QuestionnaireInput';

export function OrganizationStep(): JSX.Element {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<StaticQuestionsFormValues>();

  const organization = watch('organization');

  return (
    <div className="animate-fade-in-up space-y-6">
      <QuestionnaireInput
        label="What is your organization or team?"
        value={organization}
        onChange={(value) => setValue('organization', value)}
        placeholder="e.g., Acme Corp - Learning & Development Team"
        error={errors.organization?.message}
        helpText="Organization or team context for this learning initiative"
        required
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
            <p className="mb-2 font-medium">How to format this:</p>
            <ul className="list-inside list-disc space-y-2 text-white/70">
              <li>
                <strong>Company name + Department:</strong> &quot;Acme Corp - Sales Training
                Team&quot;
              </li>
              <li>
                <strong>Division level:</strong> &quot;Global Tech Solutions - APAC Learning &
                Development&quot;
              </li>
              <li>
                <strong>Small team:</strong> &quot;Smith & Associates HR Department&quot;
              </li>
            </ul>
            <p className="mt-2 text-xs text-white/60">
              This context helps us understand your organization&apos;s size, structure, and
              learning culture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
