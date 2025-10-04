'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  message?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  timestamp: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ErrorBoundary.generateErrorId(),
      timestamp: new Date().toISOString()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    try {
      return {
        hasError: true,
        error: error,
        errorId: ErrorBoundary.generateErrorId(),
        timestamp: new Date().toISOString()
      };
    } catch (errorGenError) {
      console.error('Error generating error state:', errorGenError);
      return {
        hasError: true,
        error: error,
        errorId: `error-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  static generateErrorId(): string {
    try {
      // Use crypto.randomUUID if available (modern browsers)
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      
      // Fallback to Math.random with timestamp (client-side)
      if (typeof window !== 'undefined') {
        return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Server-side fallback
      return `error-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    } catch (error) {
      console.error('Error generating error ID:', error);
      // Ultimate fallback
      return `error-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      // Update state with error info
      this.setState({ errorInfo: errorInfo });
      
      // Use the current state values for logging
      const { errorId, timestamp } = this.state;
      
      // Log error details
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.error('Timestamp:', timestamp);

      // Send error to logging service (if available)
      this.logErrorToService(error, errorInfo, errorId, timestamp);

      // Call optional callback
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } catch (loggingError) {
      console.error('Error in componentDidCatch:', loggingError);
    }
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo, errorId: string, timestamp: string) {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Boundary Report');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Error ID:', errorId);
        console.error('Timestamp:', timestamp);
        console.groupEnd();
      }

      // In production, you might want to send this to a service like Sentry, LogRocket, etc.
      // Example with Sentry (uncomment if using Sentry):
      /*
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: {
            errorBoundary: {
              errorId,
              timestamp,
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }
      */

      // Send to custom logging endpoint
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        const errorData = {
          error: error.message || 'Unknown error',
          stack: error.stack || 'No stack trace',
          componentStack: errorInfo.componentStack || 'No component stack',
          errorId: errorId || 'no-error-id',
          timestamp: timestamp || new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        };

        fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        }).catch((fetchError) => {
          console.error('Failed to send error to logging service:', fetchError);
        });
      }
    } catch (loggingError) {
      console.error('Error in logErrorToService:', loggingError);
    }
  }

  handleReset = () => {
    try {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        timestamp: '',
      });
    } catch (resetError) {
      console.error('Error resetting error boundary:', resetError);
      // Force page reload as fallback
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  handleReload = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (reloadError) {
      console.error('Error reloading page:', reloadError);
      // Fallback: try to navigate to current page
      if (typeof window !== 'undefined') {
        window.location.href = window.location.href;
      }
    }
  };

  handleGoHome = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (navigateError) {
      console.error('Error navigating to home:', navigateError);
      // Fallback: try to replace current history
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', '/');
        window.location.reload();
      }
    }
  };

  handleReportError = () => {
    try {
      const { errorId, timestamp, error, errorInfo } = this.state;
      
      if (!errorId || !timestamp) {
        console.error('Cannot report error: missing errorId or timestamp');
        alert('Unable to report error: missing error details');
        return;
      }
      
      const subject = `Error Report - ${errorId}`;
      const body = `Error Details:
ID: ${errorId}
Time: ${new Date(timestamp).toLocaleString()}
Message: ${error?.message || 'No error message'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'Unknown'}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}

Please describe what you were doing when this error occurred:`;
      
      const mailtoLink = `mailto:support@faskesq.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      if (typeof window !== 'undefined') {
        window.location.href = mailtoLink;
      } else {
        console.log('Mailto link (server-side):', mailtoLink);
      }
    } catch (reportError) {
      console.error('Error reporting error:', reportError);
      alert('Failed to report error. Please contact support manually.');
    }
  };

  render() {
    try {
      if (this.state.hasError) {
        // Destructure state for cleaner code
        const { error, errorId, timestamp } = this.state;

        // Validate required state values
        if (!errorId || !timestamp) {
          console.error('Invalid error boundary state:', this.state);
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-red-600 mb-2">Application Error</h1>
                <p className="text-gray-600">An unexpected error occurred.</p>
              </div>
            </div>
          );
        }

        // Custom error UI if provided
        if (this.props.fallback) {
          try {
            return this.props.fallback;
          } catch (fallbackError) {
            console.error('Error rendering custom fallback:', fallbackError);
            // Continue with default UI
          }
        }

        // Default error UI
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {this.props.title || 'Terjadi Kesalahan'}
                </h1>
                <p className="text-gray-600 mb-4">
                  {this.props.message || 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
                </p>

                {/* Error details for debugging */}
                {process.env.NODE_ENV === 'development' && error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-left">
                    <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                    <p className="text-xs text-red-600 mb-2">{error.message}</p>
                    <p className="text-xs text-gray-500">Error ID: {errorId}</p>
                    <p className="text-xs text-gray-500">Time: {new Date(timestamp).toLocaleString()}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReload}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                </div>

                {/* Reset button for testing */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={this.handleReset}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Reset Error Boundary (Dev Only)
                    </button>
                  </div>
                )}

                {/* Report error */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={this.handleReportError}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Laporkan Masalah
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return this.props.children;
    } catch (renderError) {
      console.error('Critical error in ErrorBoundary render:', renderError);
      // Ultimate fallback
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Critical Error</h1>
            <p className="text-gray-600 mb-4">The application encountered a critical error.</p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
  }
}

// HOC untuk membungkus komponen dengan error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => {
    try {
      return (
        <ErrorBoundary {...errorBoundaryProps}>
          <Component {...props} />
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('withErrorBoundary HOC error:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Component Error</h1>
            <p className="text-gray-600">Unable to render component.</p>
          </div>
        </div>
      );
    }
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;