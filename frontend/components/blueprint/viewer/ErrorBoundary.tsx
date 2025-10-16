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
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              glassCard.premium,
              'max-w-md p-8 text-center',
            )}
          >
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Something went wrong
            </h2>
            
            <p className="mb-6 text-sm text-text-secondary">
              The blueprint viewer encountered an error. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-xs text-text-disabled">
                  Error details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white/5 p-3 text-xs text-error">
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
                'w-full',
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
