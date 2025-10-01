'use client';

import type React from 'react';

type Props = {
  value: string;
};

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export function PasswordStrength({ value }: Props): React.JSX.Element | null {
  const strength = getStrength(value);

  if (!value) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.score ? strength.color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-white/60">
        Password strength: <span className="font-medium text-white/80">{strength.label}</span>
      </p>
    </div>
  );
}
