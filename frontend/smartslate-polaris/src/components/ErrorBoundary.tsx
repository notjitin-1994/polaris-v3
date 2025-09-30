import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { formatErrorMessage } from '@/lib/errors';
import { reportError } from '@/dev/errorTracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global error boundary component for catching React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to local dev error tracker
    try {
      reportError(error, {
        type: 'boundary',
        origin: 'ErrorBoundary',
        context: { componentStack: errorInfo.componentStack },
      });
    } catch {}

    // Send error to monitoring service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Fail silently if error reporting fails
      });
    } catch {
      // Fail silently
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020C1B] to-[#0A1628] p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-white">
              Oops! Something went wrong
            </h1>

            <p className="mb-6 text-center text-white/60">{formatErrorMessage(this.state.error)}</p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-white/40 transition-colors hover:text-white/60">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 max-h-48 overflow-auto rounded-lg bg-black/20 p-3">
                  <pre className="text-xs whitespace-pre-wrap text-red-400">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg px-4 py-2 text-white transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to trigger error boundary
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
