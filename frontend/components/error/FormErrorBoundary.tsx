'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { QuestionnaireButton } from '@/components/demo-v2-questionnaire/QuestionnaireButton';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component for form sections
 * Catches rendering errors and provides user-friendly fallback UI
 */
export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('FormErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div
          className="p-8 bg-error/10 border border-error/20 rounded-lg text-center space-y-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-error text-xl font-semibold">
            ⚠️ Something went wrong
          </div>
          <p className="text-text-secondary">
            An unexpected error occurred while rendering this section.
          </p>
          {this.state.error && (
            <details className="text-left text-sm text-text-secondary bg-black/20 p-4 rounded">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-4 justify-center">
            <QuestionnaireButton
              type="button"
              variant="primary"
              onClick={this.handleReset}
            >
              Try Again
            </QuestionnaireButton>
            <QuestionnaireButton
              type="button"
              variant="secondary"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </QuestionnaireButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
