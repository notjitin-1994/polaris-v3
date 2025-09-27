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
        className={cn(
          'glass w-full px-3 py-2 rounded-md text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'appearance-none cursor-pointer transition-all duration-200',
          hasError && 'border-error focus-visible:ring-error/50',
          disabled && 'disabled:opacity-50 cursor-not-allowed',
        )}
      >
        {!question.required && <option value="">Select an option...</option>}
        {question.options?.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}
    </InputWrapper>
  );
};

export default SelectInput;
