'use client';

import { useState } from 'react';
import type React from 'react';
import { AuthInput } from './AuthInput';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { GoogleOAuthButton } from './GoogleOAuthButton';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type IdentifierValue = { kind: 'email'; email: string } | { kind: 'unknown'; raw: string };

export function SignupFormContent(): React.JSX.Element {
  const router = useRouter();
  const [identifierRaw, setIdentifierRaw] = useState('');
  const [identifier, setIdentifier] = useState<IdentifierValue>({ kind: 'unknown', raw: '' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (identifier.kind !== 'email') {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: identifier.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // Force immediate redirect using window.location
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="animate-fade-in-up space-y-5">
      <AuthInput
        value={identifierRaw}
        onChange={(raw, parsed) => {
          setIdentifierRaw(raw);
          setIdentifier(parsed);
        }}
      />
      <PasswordInput
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Create a strong password"
        autoComplete="new-password"
        name="new-password"
      />
      <PasswordStrength value={password} />
      <PasswordInput
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Repeat password"
        autoComplete="new-password"
        name="confirm-password"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" className="btn-primary pressable w-full rounded-xl px-4 py-3" disabled={loading}>
        <span className={loading ? 'animate-pulse opacity-70' : ''}>
          {loading ? 'Creating account…' : 'Create account'}
        </span>
      </button>

      <div className="relative py-2 text-center text-xs text-white/40">
        <span className="text-primary relative z-10 rounded-sm bg-white/5 px-2">or</span>
        <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/10" />
      </div>

      <GoogleOAuthButton />
    </form>
  );
}
