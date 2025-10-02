import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import SignupFormContent from '@/components/auth/SignupFormContent';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('SignupFormContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires matching passwords', async () => {
    render(
      <AuthProvider>
        <SignupFormContent />
      </AuthProvider>
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret2' } });
    const btn = await screen.findByRole('button', { name: /create account/i });
    fireEvent.click(btn);
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
