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
function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Static Questions Wizard', () => {
  it('validates fields and navigates between steps', async () => {
    render(<StepWizard />, { wrapper: Wrapper });

    // On step 1: Learning Objective - submit without filling to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();

    // Fill valid value
    fireEvent.change(screen.getByLabelText(/learning objective/i), {
      target: { value: 'Understand Redux deeply' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Wait for step 2 to mount before validating it
    await screen.findByLabelText(/target audience/i);

    // Step 2: Target audience validation on submit
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/target audience/i), {
      target: { value: 'Frontend devs' },
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Delivery method - wait for radios, pick a value and continue
    const onlineRadio = await screen.findByDisplayValue('online');
    fireEvent.click(onlineRadio);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Duration - wait for input and provide value
    const durationInput = await screen.findByLabelText(
      /how long should this learning experience be/i,
    );
    fireEvent.change(durationInput, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Duration - check that we successfully navigated to step 4
    // The wizard should be at 80% completion (step 4 of 5)
    expect(screen.getByText(/80% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();

    // Final validation - we successfully navigated through the steps without errors
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
