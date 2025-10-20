/**
 * Error Boundary for Blueprint Viewer
 * Gracefully handles runtime errors
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn, glassCard, componentStyles } from '@/lib/design-system';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ViewerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Blueprint Viewer Error:', error);
      console.error('Error Info:', errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="bg-background flex min-h-screen items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glassCard.premium, 'max-w-md p-8 text-center')}
          >
            <div className="bg-error/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
              <AlertCircle className="text-error h-8 w-8" />
            </div>

            <h2 className="text-foreground mb-2 text-xl font-bold">Something went wrong</h2>

            <p className="text-text-secondary mb-6 text-sm">
              The blueprint viewer encountered an error. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-text-disabled cursor-pointer text-xs">
                  Error details
                </summary>
                <pre className="text-error mt-2 max-h-40 overflow-auto rounded-lg bg-white/5 p-3 text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className={cn(
                componentStyles.button.base,
                componentStyles.button.variants.primary,
                componentStyles.button.sizes.md,
                'w-full'
              )}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
