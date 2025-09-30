'use client';

import React from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isSelectQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper } from './BaseInput';
import { cn } from '@/lib/utils';

export const SelectInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  if (!isSelectQuestion(question)) {
    console.warn('SelectInput received non-select question:', question);
    return null;
  }

  const inputId = `select-${question.id}`;
  const hasError = !!error;

  const selectClasses = cn(
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white',
    'ring-0 transition outline-none',
    'cursor-pointer appearance-none',
    hasError
      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-[1.2px] focus:ring-red-400/50'
      : 'focus:border-[#d0edf0] focus:ring-[1.2px] focus:ring-[#d0edf0]',
    disabled && 'cursor-not-allowed disabled:opacity-50'
  );

  return (
    <InputWrapper
      question={question}
      error={error}
      disabled={disabled}
      className={className}
      inputId={inputId}
    >
      <select
        id={inputId}
        name={question.id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        required={question.required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={selectClasses}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23a7dadb' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {!question.required && (
          <option value="" disabled className="bg-[#0d1b2a] text-white/50">
            Select an option...
          </option>
        )}
        {question.options?.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={option.value}
            disabled={option.disabled}
            className="bg-[#0d1b2a] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </InputWrapper>
  );
};

export default SelectInput;
