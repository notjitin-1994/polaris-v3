'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioPillOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface RadioPillGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioPillOption[];
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RadioPillGroup({
  label,
  value,
  onChange,
  options,
  error,
  helpText,
  required = false,
  disabled = false,
  className,
}: RadioPillGroupProps): JSX.Element {
  const hasError = !!error;

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-[15px] font-medium text-foreground leading-tight">
        {label}
        {required && (
          <span className="ml-1.5 text-primary font-semibold" aria-label="required">
            *
          </span>
        )}
      </label>

      {helpText && <p className="text-[13px] text-text-secondary leading-snug">{helpText}</p>}

      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'rounded-full px-5 py-2.5 text-[15px] font-medium transition-all duration-200',
              'border-[1.5px] focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2',
              disabled && 'cursor-not-allowed opacity-50',
              value === option.value
                ? 'bg-primary text-primary-foreground border-primary shadow-[0_4px_12px_rgba(167,218,219,0.3)]'
                : 'border-neutral-300 bg-white/5 text-text-secondary hover:bg-white/10 hover:border-neutral-400 hover:text-foreground',
              hasError && 'border-error/50'
            )}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      {hasError && (
        <p
          className="animate-fade-in flex items-center gap-1 text-[13px] text-error font-medium"
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
}
