import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Provide safe defaults to avoid Supabase client throwing in tests
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock Zustand stores
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const mockStore = {
      user: null,
      session: null,
      status: 'loading',
      isLoading: false,
      error: null,
      lastActivity: null,
      sessionExpiry: null,
      isSessionValid: false,
      rememberMe: false,
      autoLogin: false,
      setAuth: vi.fn(),
      setStatus: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setLastActivity: vi.fn(),
      setSessionExpiry: vi.fn(),
      setRememberMe: vi.fn(),
      setAutoLogin: vi.fn(),
      checkSessionValidity: vi.fn(() => false),
      clearAuth: vi.fn(),
      reset: vi.fn(),
    };

    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    return mockStore;
  }),
}));
