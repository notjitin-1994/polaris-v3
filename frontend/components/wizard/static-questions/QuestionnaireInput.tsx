'use client';

import React from 'react';

type QuestionnaireInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
};

export function QuestionnaireInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  helpText,
  required = false,
  multiline = false,
  rows = 4,
}: QuestionnaireInputProps): JSX.Element {
  const inputClasses = `
    w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 
    outline-none ring-0 transition
    focus:ring-[1.2px] focus:border-primary-400
    ${error ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50' : 'focus:ring-primary-400'}
    ${multiline ? 'min-h-[120px] resize-none' : ''}
  `;

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#e0e0e0',
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/70">
        {label}
        {required && <span className="text-primary-400 ml-1">*</span>}
      </label>

      {helpText && <p className="mb-2 text-xs text-white/50">{helpText}</p>}

      {multiline ? (
        <textarea
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          style={inputStyle}
        />
      ) : (
        <input
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}

      {error && (
        <p className="animate-fade-in flex items-center gap-1 text-sm text-red-400">
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
