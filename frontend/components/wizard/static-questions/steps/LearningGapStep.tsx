'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';
import { QuestionnaireInput } from '@/components/wizard/static-questions/QuestionnaireInput';

export function LearningGapStep(): JSX.Element {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<StaticQuestionsFormValues>();

  const learningGap = watch('learningGap');

  return (
    <div className="animate-fade-in-up space-y-6">
      <QuestionnaireInput
        label="What skills or knowledge gap needs to be addressed?"
        value={learningGap}
        onChange={(value) => setValue('learningGap', value)}
        placeholder="e.g., Our sales team can't effectively demonstrate our product's new AI features to potential clients, leading to missed opportunities and longer sales cycles."
        error={errors.learningGap?.message}
        helpText="Describe what your learners currently struggle with and how it impacts performance"
        required
        multiline
        rows={5}
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
            <p className="mb-2 font-medium">Tips for identifying learning gaps:</p>
            <ul className="list-inside list-disc space-y-2 text-white/70">
              <li>
                <strong>Be specific:</strong> Instead of &quot;poor communication skills&quot;, say
                &quot;team members struggle to deliver clear project updates in client
                meetings&quot;
              </li>
              <li>
                <strong>Include the impact:</strong> Explain how this gap affects work quality,
                productivity, customer satisfaction, or business results
              </li>
              <li>
                <strong>Focus on observable behaviors:</strong> What can&apos;t they do now that
                they need to do? What mistakes are they making?
              </li>
              <li>
                <strong>Think about context:</strong> Where and when does this gap show up in their
                day-to-day work?
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
