import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates inputs and renders', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>,
    );

    const btn = await screen.findByRole('button', { name: /sign in/i });
    fireEvent.click(btn);
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });
});
