'use client';

import React from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isScaleQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper } from './BaseInput';
import { cn } from '@/lib/utils';

export const ScaleInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  if (!isScaleQuestion(question)) {
    console.warn('ScaleInput received non-scale question:', question);
    return null;
  }

  const inputId = `scale-${question.id}`;
  const hasError = !!error;
  const config = question.scaleConfig;
  const min = config?.min || 1;
  const max = config?.max || 5;
  const step = config?.step || 1;

  // Generate scale options
  const scaleOptions = [];
  for (let i = min; i <= max; i += step) {
    scaleOptions.push(i);
  }

  return (
    <InputWrapper
      question={question}
      error={error}
      disabled={disabled}
      className={className}
      inputId={inputId}
    >
      <div className="space-y-4">
        {/* Scale labels */}
        <div className="flex justify-between text-sm text-foreground/60">
          {config?.minLabel && <span>{config.minLabel}</span>}
          {config?.maxLabel && <span>{config.maxLabel}</span>}
        </div>

        {/* Scale options */}
        <div className="flex justify-between items-center space-x-2">
          {scaleOptions.map((option) => (
            <label
              key={option}
              className={cn(
                'flex flex-col items-center cursor-pointer',
                disabled && 'cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(parseInt(e.target.value))}
                onBlur={onBlur}
                disabled={disabled}
                required={question.required}
                className="sr-only"
                aria-describedby={hasError ? `${inputId}-error` : undefined}
              />
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200',
                  value === option
                    ? 'glass-strong border-primary bg-primary text-white'
                    : 'glass border-foreground/20 text-foreground hover:border-primary/50 hover:glass-hover',
                  disabled && 'disabled:opacity-50 cursor-not-allowed',
                  hasError && 'border-error',
                )}
              >
                {option}
              </div>
            </label>
          ))}
        </div>

        {/* Range slider alternative */}
        <div className="mt-4">
          <div className="relative w-full h-2">
            <div className={cn(
              "absolute inset-0 bg-neutral-200 dark:bg-neutral-700 rounded-lg",
              hasError && "bg-error/20"
            )} />
            <div 
              className="absolute h-full bg-primary rounded-lg"
              style={{ width: `${(((value || min) - min) / (max - min)) * 100}%` }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value || min}
              onChange={(e) => onChange(parseInt(e.target.value))}
              onBlur={onBlur}
              disabled={disabled}
              className={cn(
                'absolute inset-0 w-full h-2 rounded-lg appearance-none cursor-pointer opacity-0',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            />
          </div>
        </div>

        {/* Current value display */}
        <div className="text-center">
          <span className="text-lg font-semibold text-foreground">
            {value || min}
          </span>
          <span className="text-sm text-foreground/60 ml-1">/ {max}</span>
        </div>
      </div>

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}
    </InputWrapper>
  );
};

export default ScaleInput;
