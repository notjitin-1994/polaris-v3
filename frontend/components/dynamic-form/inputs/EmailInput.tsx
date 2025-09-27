'use client';

import React from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isEmailQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper, BaseInputField } from './BaseInput';

export const EmailInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  if (!isEmailQuestion(question)) {
    console.warn('EmailInput received non-email question:', question);
    return null;
  }

  const inputId = `email-${question.id}`;

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
        type="email"
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={question.required}
        placeholder={question.placeholder || 'Enter your email address'}
        error={error}
        autoComplete="email"
        aria-label={question.label}
        aria-describedby={question.helpText ? `${inputId}-help` : undefined}
      />

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}
    </InputWrapper>
  );
};

export default EmailInput;
