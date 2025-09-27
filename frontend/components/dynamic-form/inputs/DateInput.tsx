'use client';

import React from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isDateQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper, BaseInputField } from './BaseInput';

export const DateInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  if (!isDateQuestion(question)) {
    console.warn('DateInput received non-date question:', question);
    return null;
  }

  const inputId = `date-${question.id}`;

  return (
    <InputWrapper
      question={question}
      error={error}
      disabled={disabled}
      className={className}
      inputId={inputId}
    >
      <BaseInputField
        id={inputId}
        name={question.id}
        type="date"
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={question.required}
        error={error}
        min={question.minDate}
        max={question.maxDate}
        aria-label={question.label}
        aria-describedby={question.helpText ? `${inputId}-help` : undefined}
      />

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}

      {(question.minDate || question.maxDate) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {question.minDate && question.maxDate
            ? `Date range: ${question.minDate} - ${question.maxDate}`
            : question.minDate
              ? `Earliest date: ${question.minDate}`
              : `Latest date: ${question.maxDate}`}
        </p>
      )}
    </InputWrapper>
  );
};

export default DateInput;
