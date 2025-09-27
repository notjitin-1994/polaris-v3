import '@testing-library/jest-dom/vitest';

// Provide safe defaults to avoid Supabase client throwing in tests
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';
