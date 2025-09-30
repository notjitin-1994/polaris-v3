'use client';

import React from 'react';

type QuestionnaireButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function QuestionnaireButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}: QuestionnaireButtonProps): JSX.Element {
  const baseClasses = `
    inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const pressableClasses = `
    transition-transform duration-200 ease-out
    hover:translate-y-[-2px]
    active:translate-y-0 active:scale-[0.98]
  `;

  if (variant === 'primary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${pressableClasses} text-white`}
        style={{
          backgroundColor: '#4F46E5',
          transition: 'all 180ms ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#3730A3';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4F46E5';
        }}
      >
        <span className={loading ? 'animate-pulse opacity-70' : ''}>
          {loading ? 'Processing…' : children}
        </span>
      </button>
    );
  }

  // Ghost variant
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${pressableClasses} border border-white/10 bg-white/5 text-white/90`}
      style={{
        transition: 'all 180ms ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      {children}
    </button>
  );
}
