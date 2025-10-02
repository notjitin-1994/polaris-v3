import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StepWizard from '@/components/wizard/static-questions/StepWizard';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';

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

// Supabase client is globally mocked in vitest.setup.ts

// Provide a minimal wrapper to satisfy ProtectedRoute dependency if used elsewhere
function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Static Questions Wizard', () => {
  it('validates fields and navigates between steps', async () => {
    render(<StepWizard />, { wrapper: Wrapper });

    // On step 1: Role - submit without filling to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();

    // Fill valid value
    fireEvent.change(screen.getByLabelText(/what is your role/i), {
      target: { value: 'Instructional Designer' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Wait for step 2 to mount before validating it
    await screen.findByLabelText(/organization/i);

    // Step 2: Organization validation on submit
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/organization/i), {
      target: { value: 'Global L&D' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Learning Gap - fill and continue
    const learningGapInput = await screen.findByLabelText(/identified learning gap/i);
    fireEvent.change(learningGapInput, {
      target: { value: 'Learners lack foundation in data-driven design' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Resources - wait for input and provide value
    const resourcesInput = await screen.findByLabelText(/resources and budgets/i);
    fireEvent.change(resourcesInput, { target: { value: '2 IDs, LMS, $15k' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 5: Constraints - check progress indicator appears updated
    expect(screen.getByText(/80% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();

    // Final validation - we successfully navigated through the steps without errors
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
