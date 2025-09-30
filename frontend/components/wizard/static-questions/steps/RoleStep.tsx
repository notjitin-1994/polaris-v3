'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';
import { QuestionnaireInput } from '@/components/wizard/static-questions/QuestionnaireInput';

const PREDEFINED_ROLES = [
  'Learning & Development Manager',
  'HR Director',
  'Training Specialist',
  'Instructional Designer',
  'Corporate Trainer',
  'Chief Learning Officer',
  'Talent Development Manager',
  'L&D Consultant',
  'Education Manager',
  'Custom (Specify below)',
];

export function RoleStep(): JSX.Element {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<StaticQuestionsFormValues>();

  const role = watch('role');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Initialize selected option based on existing role value
  useEffect(() => {
    if (role) {
      if (PREDEFINED_ROLES.includes(role)) {
        setSelectedOption(role);
        setShowCustomInput(false);
      } else {
        setSelectedOption('Custom (Specify below)');
        setShowCustomInput(true);
      }
    }
  }, []);

  const handleDropdownChange = (value: string) => {
    setSelectedOption(value);

    if (value === 'Custom (Specify below)') {
      setShowCustomInput(true);
      setValue('role', ''); // Clear the role value to prompt custom input
    } else {
      setShowCustomInput(false);
      setValue('role', value);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Dropdown Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/90">
          What is your role? <span className="text-red-400">*</span>
        </label>
        <select
          value={selectedOption}
          onChange={(e) => handleDropdownChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-[#d0edf0] focus:ring-[1.2px] focus:ring-[#d0edf0]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23a7dadb' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          <option value="" disabled className="bg-[#0d1b2a] text-white/50">
            Select your role...
          </option>
          {PREDEFINED_ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption} className="bg-[#0d1b2a] text-white">
              {roleOption}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="animate-fade-in text-sm text-red-400">{errors.role.message}</p>
        )}
        <p className="text-xs text-white/50">Your role relevant to this learning initiative</p>
      </div>

      {/* Custom Input (shown when "Custom" is selected) */}
      {showCustomInput && (
        <div className="animate-fade-in-up">
          <QuestionnaireInput
            label="Specify your custom role"
            value={role}
            onChange={(value) => setValue('role', value)}
            placeholder="e.g., Chief Learning Officer, Curriculum Developer, etc."
            error={errors.role?.message}
            helpText="Enter your specific role title"
            required
          />
        </div>
      )}

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
            <p className="mb-2 font-medium">Why this matters:</p>
            <p className="mb-2 text-white/70">
              Your role helps us understand your perspective and decision-making authority, so we
              can tailor recommendations to your needs.
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs text-white/70">
              <li>
                If you&apos;re a <strong>manager/director</strong>: We&apos;ll focus on strategic
                alignment and ROI
              </li>
              <li>
                If you&apos;re a <strong>designer/specialist</strong>: We&apos;ll dive deeper into
                implementation details
              </li>
              <li>
                If you&apos;re a <strong>consultant</strong>: We&apos;ll consider client-facing
                aspects and scalability
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
