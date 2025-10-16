'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface ScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  labels?: string[];
  step?: number;
}

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit: string;
  markers?: number[];
}

interface ValidationRule {
  rule: string;
  value?: string | number | boolean;
  message: string;
}

interface Question {
  id: string;
  label: string;
  type: string;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: QuestionOption[];
  scaleConfig?: ScaleConfig;
  sliderConfig?: SliderConfig;
  validation?: ValidationRule[];
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  currencySymbol?: string;
  step?: number;
}

interface DynamicQuestionRendererProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  touched?: boolean;
  onBlur?: () => void;
}

/**
 * Validate question structure before rendering
 * Ensures all required fields are present and properly formatted
 */
function validateQuestionStructure(question: Question): void {
  if (!question) {
    throw new Error('Question object is undefined or null');
  }
  
  if (!question.id) {
    throw new Error('Question is missing required "id" field');
  }
  
  if (!question.label || typeof question.label !== 'string') {
    throw new Error(`Question ${question.id} is missing or has invalid "label" field`);
  }
  
  if (!question.type) {
    throw new Error(`Question ${question.id} is missing required "type" field`);
  }
  
  // Validate selection-type questions have options
  const selectionTypes = [
    'radio_pills',
    'checkbox_pills',
    'radio_cards',
    'checkbox_cards',
    'toggle_switch',
    'select',
    'multiselect',
  ];
  
  if (selectionTypes.includes(question.type)) {
    if (!question.options || !Array.isArray(question.options)) {
      throw new Error(
        `Question ${question.id} (${question.type}) requires an "options" array but none was provided`
      );
    }
    
    if (question.options.length === 0) {
      throw new Error(
        `Question ${question.id} (${question.type}) has an empty options array. At least one option is required.`
      );
    }
    
    // Validate each option has value and label
    question.options.forEach((opt, idx) => {
      if (!opt.value || typeof opt.value !== 'string') {
        throw new Error(
          `Question ${question.id}, option ${idx}: Missing or invalid "value" field`
        );
      }
      if (!opt.label || typeof opt.label !== 'string') {
        throw new Error(
          `Question ${question.id}, option ${idx}: Missing or invalid "label" field`
        );
      }
    });
    
    // Special validation for toggle switches
    if (question.type === 'toggle_switch' && question.options.length !== 2) {
      throw new Error(
        `Question ${question.id} is a toggle_switch but has ${question.options.length} options. Toggle switches require exactly 2 options.`
      );
    }
  }
  
  // Validate scale questions have config
  if (['scale', 'enhanced_scale'].includes(question.type)) {
    if (!question.scaleConfig) {
      throw new Error(
        `Question ${question.id} (${question.type}) requires "scaleConfig" but none was provided`
      );
    }
    if (typeof question.scaleConfig.min !== 'number' || typeof question.scaleConfig.max !== 'number') {
      throw new Error(
        `Question ${question.id} scaleConfig must have numeric "min" and "max" values`
      );
    }
  }
  
  // Validate slider questions have config
  if (question.type === 'labeled_slider') {
    if (!question.sliderConfig) {
      throw new Error(
        `Question ${question.id} (labeled_slider) requires "sliderConfig" but none was provided`
      );
    }
  }
}

/**
 * Validate answer against question rules
 */
function validateAnswer(value: unknown, question: Question): string | null {
  // Required check
  if (question.required) {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'Please select at least one option';
    }
  }

  // Apply custom validation rules
  if (question.validation && value !== undefined && value !== null && value !== '') {
    for (const rule of question.validation) {
      switch (rule.rule) {
        case 'minLength':
          if (typeof value === 'string' && typeof rule.value === 'number') {
            if (value.length < rule.value) {
              return rule.message;
            }
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && typeof rule.value === 'number') {
            if (value.length > rule.value) {
              return rule.message;
            }
          }
          break;
        case 'min':
          if (typeof value === 'number' && typeof rule.value === 'number') {
            if (value < rule.value) {
              return rule.message;
            }
          }
          break;
        case 'max':
          if (typeof value === 'number' && typeof rule.value === 'number') {
            if (value > rule.value) {
              return rule.message;
            }
          }
          break;
        case 'minSelections':
          if (Array.isArray(value) && typeof rule.value === 'number') {
            if (value.length < rule.value) {
              return rule.message;
            }
          }
          break;
        case 'maxSelections':
          if (Array.isArray(value) && typeof rule.value === 'number') {
            if (value.length > rule.value) {
              return rule.message;
            }
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && typeof rule.value === 'string') {
            const regex = new RegExp(rule.value);
            if (!regex.test(value)) {
              return rule.message;
            }
          }
          break;
        case 'email':
          if (typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return rule.message;
            }
          }
          break;
        case 'url':
          if (typeof value === 'string') {
            try {
              new URL(value);
            } catch {
              return rule.message;
            }
          }
          break;
      }
    }
  }

  return null;
}

export function DynamicQuestionRenderer({
  question,
  value,
  onChange,
  error: externalError,
  touched: externalTouched,
  onBlur,
}: DynamicQuestionRendererProps): React.JSX.Element {
  const [localTouched, setLocalTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  const touched = externalTouched ?? localTouched;
  const error = externalError ?? localError;
  
  // Validate question structure on mount
  useEffect(() => {
    try {
      validateQuestionStructure(question);
      setRenderError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid question structure';
      setRenderError(errorMsg);
      console.error(`Question validation failed for ${question.id}:`, err);
    }
  }, [question]);
  
  // Real-time validation (only show after touched)
  useEffect(() => {
    if (touched) {
      const validationError = validateAnswer(value, question);
      setLocalError(validationError);
    }
  }, [value, question, touched]);
  
  // Handle blur event
  const handleBlur = () => {
    setLocalTouched(true);
    if (onBlur) {
      onBlur();
    }
  };
  
  // Wrapper for onChange to validate immediately for selection types
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
    // For selection types, validate immediately (good UX)
    if (['radio_pills', 'radio_cards', 'checkbox_pills', 'checkbox_cards', 'toggle_switch'].includes(question.type)) {
      setLocalTouched(true);
    }
  };
  const hasError = Boolean(error && touched);
  
  // Show render error if question structure is invalid
  if (renderError) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-foreground font-medium text-lg flex items-center gap-2">
            {question.label || 'Unnamed Question'}
            {question.required && (
              <span className="text-error text-base" aria-label="required">*</span>
            )}
          </label>
        </div>
        <div className="border-error bg-error/10 rounded-xl border p-4" role="alert">
          <p className="text-error mb-2 text-sm font-semibold">
            Unable to render this question
          </p>
          <p className="text-text-secondary text-xs">
            {renderError}
          </p>
        </div>
      </div>
    );
  }
  
  const renderInput = () => {
    switch (question.type) {
      case 'radio_pills':
        return renderRadioPills();
      case 'checkbox_pills':
        return renderCheckboxPills();
      case 'radio_cards':
        return renderRadioCards();
      case 'checkbox_cards':
        return renderCheckboxCards();
      case 'toggle_switch':
        return renderToggleSwitch();
      case 'scale':
        return renderScale();
      case 'enhanced_scale':
        return renderEnhancedScale();
      case 'labeled_slider':
        return renderLabeledSlider();
      case 'textarea':
        return renderTextarea();
      case 'text':
        return renderText();
      case 'email':
        return renderEmail();
      case 'url':
        return renderUrl();
      case 'currency':
        return renderCurrency();
      case 'number_spinner':
        return renderNumberSpinner();
      case 'date':
        return renderDate();
      default:
        return <div className="text-error">Unsupported question type: {question.type}</div>;
    }
  };

  const renderRadioPills = () => {
    const options = question.options || [];
    
    if (options.length === 0) {
      return (
        <div className="border-warning bg-warning/10 rounded-xl border p-4">
          <p className="text-warning text-sm">
            This question has no options to display. Please contact support if this issue persists.
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              className={cn(
                'group relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                'border-2 flex items-center gap-2 touch-target',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary text-primary shadow-[0_0_20px_rgba(167,218,219,0.4)] scale-105'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl animate-pulse" />
              )}
              <span className="relative flex items-center gap-2">
                {option.icon && <span className="text-lg">{option.icon}</span>}
                {option.label}
              </span>
              {isSelected && (
                <svg className="relative w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderCheckboxPills = () => {
    // Ensure selectedValues is always an array, never a string
    let selectedValues: string[] = [];
    if (Array.isArray(value)) {
      selectedValues = value as string[];
    } else if (value && typeof value === 'string') {
      // If somehow a string was stored, treat it as single selection
      selectedValues = [value];
    }

    // Get selection constraints from validation rules
    const minSelections = question.validation?.find(v => v.rule === 'minSelections')?.value as number | undefined;
    const maxSelections = question.validation?.find(v => v.rule === 'maxSelections')?.value as number | undefined;
    const canAddMore = !maxSelections || selectedValues.length < maxSelections;
    const canRemove = !minSelections || selectedValues.length > minSelections;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {question.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = !isSelected && !canAddMore;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (isSelected && !canRemove) return;
                  if (!isSelected && !canAddMore) return;
                  
                  const newValues = isSelected
                    ? selectedValues.filter(v => v !== option.value)
                    : [...selectedValues, option.value];
                  handleChange(newValues);
                }}
                disabled={isDisabled}
                className={cn(
                  'group relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                  'border-2 touch-target',
                  isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 active:scale-95',
                  isSelected
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary text-primary shadow-[0_0_20px_rgba(167,218,219,0.4)] scale-105'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl animate-pulse" />
              )}
              <span className="relative flex items-center gap-2">
                {option.label}
                {isSelected && (
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
        </div>
        
        {/* Selection count indicator */}
        {(minSelections || maxSelections) && (
          <div className="text-sm text-text-secondary">
            <span className={cn(
              selectedValues.length >= (minSelections || 0) && 
              selectedValues.length <= (maxSelections || Infinity) 
                ? "text-success" 
                : "text-error"
            )}>
              {selectedValues.length} selected
            </span>
            <span className="text-text-secondary ml-2">
              {minSelections && maxSelections 
                ? `(select ${minSelections}-${maxSelections})`
                : minSelections 
                ? `(select at least ${minSelections})`
                : `(select up to ${maxSelections})`
              }
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderRadioCards = () => (
    <div className="grid gap-4">
      {question.options?.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={cn(
              'group relative p-5 rounded-2xl text-left transition-all duration-300 touch-target',
              'border-2 hover:scale-[1.02] active:scale-[0.98]',
              isSelected
                ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary shadow-[0_0_24px_rgba(167,218,219,0.3)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl'
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className={cn(
                'mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
                isSelected ? 'border-primary bg-primary/20' : 'border-white/20 group-hover:border-white/40'
              )}>
                {isSelected && (
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div className="flex-1 pr-8">
                <div className={cn(
                  "font-semibold text-base mb-2 transition-colors",
                  isSelected ? "text-primary" : "text-white group-hover:text-white"
                )}>{option.label}</div>
                {option.description && (
                  <div className="text-sm text-white/60 leading-relaxed">{option.description}</div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderCheckboxCards = () => {
    // Ensure selectedValues is always an array, never a string
    let selectedValues: string[] = [];
    if (Array.isArray(value)) {
      selectedValues = value as string[];
    } else if (value && typeof value === 'string') {
      // If somehow a string was stored, treat it as single selection
      selectedValues = [value];
    }

    // Get selection constraints from validation rules
    const minSelections = question.validation?.find(v => v.rule === 'minSelections')?.value as number | undefined;
    const maxSelections = question.validation?.find(v => v.rule === 'maxSelections')?.value as number | undefined;
    const canAddMore = !maxSelections || selectedValues.length < maxSelections;
    const canRemove = !minSelections || selectedValues.length > minSelections;

    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {question.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = !isSelected && !canAddMore;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (isSelected && !canRemove) return;
                  if (!isSelected && !canAddMore) return;
                  
                  const newValues = isSelected
                    ? selectedValues.filter(v => v !== option.value)
                    : [...selectedValues, option.value];
                  handleChange(newValues);
                }}
                disabled={isDisabled}
                className={cn(
                  'group relative p-5 rounded-2xl text-left transition-all duration-300 touch-target',
                  isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'border-2 hover:scale-[1.02] active:scale-[0.98]',
                  isSelected
                    ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary shadow-[0_0_24px_rgba(167,218,219,0.3)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={cn(
                  'mt-1 h-6 w-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  isSelected ? 'border-primary bg-primary' : 'border-white/20 group-hover:border-white/40'
                )}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 pr-8">
                  <div className={cn(
                    "font-semibold text-base mb-2 transition-colors",
                    isSelected ? "text-primary" : "text-white group-hover:text-white"
                  )}>{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-white/60 leading-relaxed">{option.description}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        </div>
        
        {/* Selection count indicator */}
        {(minSelections || maxSelections) && (
          <div className="text-sm text-text-secondary">
            <span className={cn(
              selectedValues.length >= (minSelections || 0) && 
              selectedValues.length <= (maxSelections || Infinity) 
                ? "text-success" 
                : "text-error"
            )}>
              {selectedValues.length} selected
            </span>
            <span className="text-text-secondary ml-2">
              {minSelections && maxSelections 
                ? `(select ${minSelections}-${maxSelections})`
                : minSelections 
                ? `(select at least ${minSelections})`
                : `(select up to ${maxSelections})`
              }
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderToggleSwitch = () => {
    // Toggle switch expects exactly 2 options: [No, Yes] or [Off, On]
    const options = question.options || [];
    if (options.length !== 2) {
      return <div className="text-error">Toggle switch requires exactly 2 options</div>;
    }

    const [option1, option2] = options;
    const isOption2Selected = value === option2.value;

    return (
      <div className="flex items-center gap-4">
        <span className={cn(
          'text-sm font-medium transition-colors',
          !isOption2Selected ? 'text-white' : 'text-white/40'
        )}>
          {option1.label}
        </span>
        <button
          type="button"
          onClick={() => handleChange(isOption2Selected ? option1.value : option2.value)}
          className={cn(
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200',
            isOption2Selected ? 'bg-primary' : 'bg-white/20'
          )}
          aria-label={`Toggle between ${option1.label} and ${option2.label}`}
          aria-checked={isOption2Selected}
          role="switch"
        >
          <span
            className={cn(
              'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200',
              isOption2Selected ? 'translate-x-7' : 'translate-x-1'
            )}
          />
        </button>
        <span className={cn(
          'text-sm font-medium transition-colors',
          isOption2Selected ? 'text-white' : 'text-white/40'
        )}>
          {option2.label}
        </span>
      </div>
    );
  };

  const renderScale = () => {
    const config = question.scaleConfig || { min: 1, max: 5, step: 1 };
    const currentValue = (value as number) || config.min;

    return (
      <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
        <div className="flex justify-between items-center">
          {config.minLabel && (
            <span className="text-sm font-medium text-white/60">{config.minLabel}</span>
          )}
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-primary mb-1">{currentValue}</span>
            <span className="text-xs text-white/40 uppercase tracking-wider">Selected Value</span>
          </div>
          {config.maxLabel && (
            <span className="text-sm font-medium text-white/60">{config.maxLabel}</span>
          )}
        </div>
        <div className="relative">
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step || 1}
            value={currentValue}
            onChange={(e) => handleChange(Number(e.target.value))}
            onBlur={handleBlur}
            className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb hover:h-4 transition-all"
            style={{
              background: `linear-gradient(to right, rgba(167, 218, 219, 0.3) 0%, rgba(167, 218, 219, 0.3) ${((currentValue - config.min) / (config.max - config.min)) * 100}%, rgba(255, 255, 255, 0.1) ${((currentValue - config.min) / (config.max - config.min)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
          {/* Scale markers */}
          <div className="flex justify-between mt-2 px-1">
            {Array.from({ length: config.max - config.min + 1 }, (_, i) => config.min + i).map((mark) => (
              <div key={mark} className="flex flex-col items-center">
                <div className={cn(
                  "w-1 h-2 rounded-full transition-all",
                  mark === currentValue ? "bg-primary h-3" : "bg-white/20"
                )} />
                <span className={cn(
                  "text-xs mt-1 transition-all",
                  mark === currentValue ? "text-primary font-semibold" : "text-white/40"
                )}>{mark}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEnhancedScale = () => {
    const config = question.scaleConfig || { min: 1, max: 5, step: 1, labels: [] };
    const currentValue = (value as number) || config.min;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">
            {config.labels?.[currentValue - 1]?.split(' ')[0] || '⚪'}
          </div>
          <div className="text-xl font-semibold text-primary">
            {config.labels?.[currentValue - 1]?.split(' ').slice(1).join(' ') || currentValue}
          </div>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step || 1}
          value={currentValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <div className="flex justify-between text-xs text-white/40">
          <span>{config.minLabel}</span>
          <span>{config.maxLabel}</span>
        </div>
      </div>
    );
  };

  const renderLabeledSlider = () => {
    const config = question.sliderConfig || { min: 0, max: 100, step: 1, unit: '%' };
    const currentValue = (value as number) || config.min;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-primary">{currentValue}{config.unit}</span>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={currentValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        {config.markers && (
          <div className="flex justify-between text-xs text-white/40">
            {config.markers.map((marker, idx) => (
              <span key={idx}>{marker}{config.unit}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTextarea = () => {
    const rows = question.rows || 5;
    const maxLength = question.maxLength;
    const currentLength = ((value as string) || '').length;
    const progress = maxLength ? (currentLength / maxLength) * 100 : 0;

    return (
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={question.placeholder}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
            className={cn(
              "w-full px-5 py-4 bg-white/5 border-2 rounded-2xl text-foreground placeholder-text-disabled",
              "focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all resize-none",
              "hover:border-white/20",
              hasError 
                ? "border-error focus:border-error" 
                : "border-white/10 focus:border-primary"
            )}
          />
          {currentLength > 0 && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
              <span className={cn(
                "text-xs font-medium",
                currentLength > maxLength * 0.9 ? "text-warning" : "text-white/60"
              )}>
                {currentLength}{maxLength && ` / ${maxLength}`}
              </span>
            </div>
          )}
        </div>
        {maxLength && (
          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progress > 90 ? "bg-warning" : progress > 70 ? "bg-yellow-500" : "bg-primary"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderText = () => {
    const maxLength = question.maxLength;
    const currentLength = ((value as string) || '').length;

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={question.placeholder}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
            className={cn(
              "w-full px-5 py-4 bg-white/5 border-2 rounded-xl text-foreground placeholder-text-disabled",
              "focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
              "hover:border-white/20",
              hasError 
                ? "border-error focus:border-error shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
                : "border-white/10 focus:border-primary focus:shadow-[0_0_12px_rgba(167,218,219,0.2)]"
            )}
          />
          {maxLength && currentLength > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                currentLength > maxLength * 0.9 
                  ? "text-warning bg-warning/10" 
                  : "text-white/40 bg-white/5"
              )}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmail = () => (
    <input
      type="email"
      value={(value as string) || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={question.placeholder || 'email@example.com'}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
      className={cn(
        "w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-foreground placeholder-text-disabled focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
        hasError 
          ? "border-error focus:border-error" 
          : "border-white/10 focus:border-primary"
      )}
    />
  );

  const renderUrl = () => (
    <input
      type="url"
      value={(value as string) || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={question.placeholder || 'https://example.com'}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
      className={cn(
        "w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-foreground placeholder-text-disabled focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
        hasError 
          ? "border-error focus:border-error" 
          : "border-white/10 focus:border-primary"
      )}
    />
  );

  const renderCurrency = () => {
    const config = question.currencyConfig || { symbol: '$', min: 0 };
    const currencySymbol = config.symbol || '$';
    const min = config.min ?? 0;
    const max = config.max;
    const step = question.step ?? 0.01;

    return (
      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
            {currencySymbol}
          </span>
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                handleChange(val);
              }
            }}
            onBlur={handleBlur}
            placeholder="0"
            min={min}
            max={max}
            step={step}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
            className={cn(
              "w-full pl-8 pr-4 py-3 bg-white/5 border-2 rounded-lg text-foreground placeholder-text-disabled focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
              hasError 
                ? "border-error focus:border-error" 
                : "border-white/10 focus:border-primary"
            )}
          />
        </div>
        {(min !== undefined || max !== undefined) && (
          <div className="flex justify-between text-xs text-text-secondary">
            {min !== undefined && <span>Min: {currencySymbol}{min.toLocaleString()}</span>}
            {max !== undefined && <span>Max: {currencySymbol}{max.toLocaleString()}</span>}
          </div>
        )}
      </div>
    );
  };

  const renderNumberSpinner = () => {
    const min = question.min ?? 0;
    const max = question.max;
    const step = question.step ?? 1;

    return (
      <div className="space-y-2">
        <input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          placeholder="0"
          min={min}
          max={max}
          step={step}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
          className={cn(
            "w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-foreground placeholder-text-disabled focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
            hasError 
              ? "border-error focus:border-error" 
              : "border-white/10 focus:border-primary"
          )}
        />
        {(min !== undefined || max !== undefined) && (
          <div className="text-xs text-white/40">
            {min !== undefined && max !== undefined
              ? `Range: ${min} - ${max}`
              : min !== undefined
              ? `Minimum: ${min}`
              : `Maximum: ${max}`}
          </div>
        )}
      </div>
    );
  };

  const renderDate = () => (
    <input
      type="date"
      value={(value as string) || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${question.id}-error` : question.helpText ? `${question.id}-help` : undefined}
      className={cn(
        "w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all",
        hasError 
          ? "border-error focus:border-error" 
          : "border-white/10 focus:border-primary"
      )}
    />
  );

  return (
    <div className="space-y-4">
      {/* Question Label */}
      <div className="space-y-2">
        <label htmlFor={question.id} className="text-foreground font-medium text-lg flex items-center gap-2">
          {question.label}
          {question.required && (
            <span className="text-error text-base" aria-label="required">*</span>
          )}
        </label>
        {question.helpText && (
          <p id={`${question.id}-help`} className="text-text-secondary text-[15px] leading-relaxed">
            {question.helpText}
          </p>
        )}
      </div>

      {/* Question Input */}
      <div>
        {renderInput()}
      </div>
      
      {/* Validation Error Message - Only shown when touched and has error */}
      {hasError && (
        <div 
          id={`${question.id}-error`}
          className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-5 h-5 text-error flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-error text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
