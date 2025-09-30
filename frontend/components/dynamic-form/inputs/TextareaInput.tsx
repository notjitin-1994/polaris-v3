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

  const textareaClasses = cn(
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40',
    'ring-0 transition outline-none',
    'min-h-[120px] resize-none',
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
      <textarea
        id={inputId}
        name={question.id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        required={question.required}
        placeholder={question.placeholder}
        rows={question.rows || 4}
        maxLength={question.maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={textareaClasses}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#e0e0e0',
        }}
      />

      {question.maxLength && (
        <p className="mt-1 text-xs text-white/60">
          {typeof value === 'string' ? value.length : 0} / {question.maxLength} characters
        </p>
      )}
    </InputWrapper>
  );
};

export default TextareaInput;
