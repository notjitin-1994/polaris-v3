'use client';

import React from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isTextareaQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper } from './BaseInput';
import { cn } from '@/lib/utils';

export const TextareaInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  if (!isTextareaQuestion(question)) {
    console.warn('TextareaInput received non-textarea question:', question);
    return null;
  }

  const inputId = `textarea-${question.id}`;
  const hasError = !!error;

  return (
    <InputWrapper
      question={question}
      error={error}
      disabled={disabled}
      className={className}
      inputId={inputId}
    >
      <textarea
        id={inputId}
        name={question.id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        required={question.required}
        placeholder={question.placeholder}
        rows={question.rows}
        maxLength={question.maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={cn(
          'glass w-full px-3 py-2 rounded-md text-foreground placeholder:text-foreground/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'resize-vertical transition-all duration-200',
          hasError && 'border-error focus-visible:ring-error/50',
          disabled && 'disabled:opacity-50 cursor-not-allowed',
        )}
      />

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}

      {question.maxLength && (
        <p className="text-xs text-foreground/60 mt-1">
          {typeof value === 'string' ? value.length : 0} / {question.maxLength} characters
        </p>
      )}
    </InputWrapper>
  );
};

export default TextareaInput;
