import { useState } from 'react';
import { AuthInput } from '@/features/auth/components/AuthInput';
import type { IdentifierValue } from '@/features/auth/types';
import * as authService from '@/features/auth/services/authService';
import { GoogleOAuthButton } from '@/features/auth/components/GoogleOAuthButton';
import { PasswordInput } from '@/components/PasswordInput';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';

export function SignUpForm() {
  const [identifierRaw, setIdentifierRaw] = useState('');
  const [identifier, setIdentifier] = useState<IdentifierValue>({ kind: 'unknown', raw: '' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.signup({ identifier, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
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

      <button type="submit" className="btn-primary pressable w-full" disabled={loading}>
        <span className={loading ? 'animate-pulse-subtle opacity-70' : ''}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </span>
      </button>

      <div className="relative py-2 text-center text-xs text-white/40">
        <span className="text-primary-500 relative z-10 bg-[rgb(var(--card))] px-2">or</span>
        <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/10" />
      </div>

      <GoogleOAuthButton />
    </form>
  );
}
