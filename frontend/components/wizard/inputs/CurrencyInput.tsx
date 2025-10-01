'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  allowApproximate?: boolean;
  className?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  currency = 'USD',
  placeholder = '0',
  error,
  helpText,
  required = false,
  disabled = false,
  allowApproximate = false,
  className,
}: CurrencyInputProps): JSX.Element {
  const hasError = !!error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue ? Number(rawValue) : 0);
  };

  const formatValue = (val: number): string => {
    if (val === 0) return '';
    return val.toLocaleString('en-US');
  };

  const getCurrencySymbol = (curr: string): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
    };
    return symbols[curr] || curr;
  };

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

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
          aria-hidden="true"
        >
          <span className="text-base font-semibold text-primary-accent">
            {getCurrencySymbol(currency)}
          </span>
        </div>
        <input
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-[3.25rem] rounded-[0.875rem] border-[1.5px] bg-[rgba(13,27,42,0.4)] py-3 pl-11 pr-4 text-base text-foreground placeholder-text-disabled font-normal',
            'outline-none transition-all duration-300',
            'shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)]',
            'hover:border-[var(--border-strong)] hover:bg-[rgba(13,27,42,0.5)]',
            hasError
              ? 'border-error/70 focus:border-error focus:bg-[rgba(13,27,42,0.6)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)]'
              : 'border-[var(--border-medium)] focus:border-primary focus:bg-[rgba(13,27,42,0.6)] focus:shadow-[0_0_0_3px_rgba(167,218,219,0.15),inset_0_1px_2px_rgba(0,0,0,0.1),var(--glow-subtle)]',
            disabled && 'cursor-not-allowed opacity-50 bg-[rgba(13,27,42,0.3)]'
          )}
          aria-label={label}
          aria-invalid={hasError}
        />
      </div>

      {allowApproximate && (
        <p className="text-[13px] text-text-secondary italic">Approximate amounts are fine</p>
      )}

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
