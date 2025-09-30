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
      <label htmlFor={inputId} className="block text-sm text-white/70">
        {question.label}
        {question.required && (
          <span className="ml-1" style={{ color: '#a7dadb' }} aria-label="required">
            *
          </span>
        )}
      </label>

      {question.helpText && <p className="mb-2 text-xs text-white/50">{question.helpText}</p>}

      <div className="relative">{children}</div>

      {hasError && (
        <p
          className="animate-fade-in flex items-center gap-1 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

interface BaseInputFieldProps {
  id: string;
  name: string;
  type?: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  maxLength?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const BaseInputField: React.FC<BaseInputFieldProps> = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  disabled,
  required,
  placeholder,
  error,
  className,
  maxLength,
  ...props
}) => {
  const hasError = !!error;

  const inputClasses = cn(
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40',
    'ring-0 transition outline-none',
    hasError
      ? 'border-red-400/50 focus:border-red-400/50 focus:ring-[1.2px] focus:ring-red-400/50'
      : 'focus:border-[#d0edf0] focus:ring-[1.2px] focus:ring-[#d0edf0]',
    disabled && 'cursor-not-allowed disabled:opacity-50',
    className
  );

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${id}-error` : undefined}
      className={inputClasses}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#e0e0e0',
      }}
      {...props}
    />
  );
};
