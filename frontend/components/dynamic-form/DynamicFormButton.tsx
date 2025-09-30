'use client';

import React from 'react';

type DynamicFormButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function DynamicFormButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}: DynamicFormButtonProps): JSX.Element {
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  if (variant === 'primary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} text-white`}
        style={{
          backgroundColor: '#6366f1',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = '#4f46e5';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#6366f1';
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
      className={`${baseClasses} text-white/70`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        transition: 'all 200ms ease',
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
