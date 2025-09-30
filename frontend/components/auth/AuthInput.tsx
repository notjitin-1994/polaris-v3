'use client';

import { useEffect } from 'react';

type IdentifierValue = { kind: 'email'; email: string } | { kind: 'unknown'; raw: string };

type Props = {
  value: string;
  onChange: (raw: string, parsed: IdentifierValue) => void;
  placeholder?: string;
};

function detect(input: string): IdentifierValue {
  const trimmed = input.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (emailRegex.test(trimmed)) {
    return { kind: 'email', email: trimmed.toLowerCase() };
  }
  return { kind: 'unknown', raw: input };
}

export function AuthInput({ value, onChange, placeholder }: Props): JSX.Element {
  useEffect(() => {
    const parsed = detect(value);
    onChange(value, parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleRawChange(next: string): void {
    onChange(next, detect(next));
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/70">Email</label>
      <input
        className="focus:ring-primary focus:border-primary w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 ring-0 transition outline-none focus:ring-[1.2px]"
        placeholder={placeholder ?? 'name@company.com'}
        value={value}
        onChange={(e) => handleRawChange(e.target.value)}
        inputMode="email"
        autoComplete="username"
      />
    </div>
  );
}
