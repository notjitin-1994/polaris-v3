'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BaseInputProps } from '@/lib/dynamic-form';

interface InputWrapperProps extends BaseInputProps {
  children: React.ReactNode;
  inputId: string;
}

export const InputWrapper: React.FC<InputWrapperProps> = ({
  question,
  error,
  disabled,
  className,
  children,
  inputId,
  ..._accessibilityProps
}) => {
  const hasError = !!error;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'block text-sm font-medium',
          hasError ? 'text-error dark:text-error' : 'text-foreground',
          disabled && 'text-foreground/50',
        )}
      >
        {question.label}
        {question.required && (
          <span className="text-error ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {question.helpText && (
        <p className="text-sm text-foreground/60">{question.helpText}</p>
      )}

      <div className="relative">{children}</div>

      {hasError && (
        <p className="text-sm text-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};

interface BaseInputFieldProps {
  id: string;
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const BaseInputField: React.FC<BaseInputFieldProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  required,
  placeholder,
  error,
  className,
  ...props
}) => {
  const hasError = !!error;

  return (
    <input
      id={id}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${id}-error` : undefined}
      className={cn(
        'glass w-full px-3 py-2 rounded-md text-foreground placeholder:text-foreground/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'transition-all duration-200',
        hasError && 'border-error focus-visible:ring-error/50',
        disabled && 'disabled:opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
};
