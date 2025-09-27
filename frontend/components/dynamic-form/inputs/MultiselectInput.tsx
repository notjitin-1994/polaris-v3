'use client';

import React, { useState } from 'react';
import { BaseInputProps } from '@/lib/dynamic-form';
import { isMultiselectQuestion } from '@/lib/dynamic-form/schema';
import { InputWrapper } from './BaseInput';
import { cn } from '@/lib/utils';

export const MultiselectInput: React.FC<BaseInputProps> = ({
  question,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isMultiselectQuestion(question)) {
    console.warn('MultiselectInput received non-multiselect question:', question);
    return null;
  }

  const inputId = `multiselect-${question.id}`;
  const hasError = !!error;
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;

    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];

    // Check max selections limit
    if (question.maxSelections && newValues.length > question.maxSelections) {
      return;
    }

    onChange(newValues);
  };

  const handleRemoveOption = (optionValue: string) => {
    if (disabled) return;
    const newValues = selectedValues.filter((v) => v !== optionValue);
    onChange(newValues);
  };

  const selectedOptions =
    question.options?.filter((opt) => selectedValues.includes(opt.value)) || [];

  return (
    <InputWrapper
      question={question}
      error={error}
      disabled={disabled}
      className={className}
      inputId={inputId}
    >
      <div className="relative">
        {/* Selected values display */}
        <div
          className={cn(
            'glass min-h-input w-full px-3 py-2 rounded-md cursor-pointer text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200',
            hasError && 'border-error focus-visible:ring-error/50',
            disabled && 'disabled:opacity-50 cursor-not-allowed',
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={onBlur}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${inputId}-options`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-foreground/50">Select options...</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option, index) => (
                <span
                  key={`selected-${option.value}-${index}`}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md"
                >
                  {option.label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.value);
                      }}
                      className="ml-1 text-primary hover:text-primary-dark"
                      aria-label={`Remove ${option.label}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>

        {/* Options dropdown */}
        {isOpen && !disabled && (
          <div
            id={`${inputId}-options`}
            className="absolute z-10 w-full mt-1 glass rounded-md shadow-lg max-h-60 overflow-auto border border-foreground/10"
            role="listbox"
          >
            {question.options?.map((option, index) => (
              <div
                key={`option-${option.value}-${index}`}
                className={cn(
                  'px-3 py-2 cursor-pointer hover:bg-foreground/5',
                  selectedValues.includes(option.value) && 'bg-primary/10',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => !option.disabled && handleToggleOption(option.value)}
                role="option"
                aria-selected={selectedValues.includes(option.value)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => {}} // Handled by parent onClick
                    className="glass h-4 w-4 mr-2 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    disabled={option.disabled}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      selectedValues.includes(option.value) ? 'font-medium' : 'font-normal',
                    )}
                  >
                    {option.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {question.helpText && (
        <p id={`${inputId}-help`} className="text-sm text-foreground/60 mt-1">
          {question.helpText}
        </p>
      )}

      {question.maxSelections && (
        <p className="text-xs text-foreground/60 mt-1">
          {selectedValues.length} / {question.maxSelections} selections
        </p>
      )}
    </InputWrapper>
  );
};

export default MultiselectInput;
