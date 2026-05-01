import React, { type ReactNode, type ReactElement } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to backend
    this.logErrorToBackend(error, errorInfo);
  }

  private async logErrorToBackend(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const response = await fetch('/api/v1/logs/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error_type: error.name || 'Error',
          error_message: error.message,
          stack_trace: error.stack,
          component_stack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to log error to backend');
      }
    } catch (err) {
      console.error('Failed to send error to backend:', err);
    }
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div 
          className="flex items-center justify-center min-h-screen bg-red-50"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-title"
          aria-describedby="error-description"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 
              id="error-title"
              className="text-2xl font-bold text-red-600 mb-4"
            >
              Oops! Something went wrong
            </h1>
            <p 
              id="error-description"
              className="text-gray-600 mb-4"
              role="status"
            >
              We're sorry for the inconvenience. Our team has been notified of this error.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-4 bg-red-100 rounded text-sm">
                <summary 
                  className="cursor-pointer font-semibold text-red-800"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      (e.currentTarget as HTMLElement).click();
                    }
                  }}
                >
                  Error Details
                </summary>
                <pre 
                  className="mt-2 text-xs overflow-auto max-h-48 text-red-800"
                  aria-label="Technical error details"
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Reload the page to recover from this error"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as ReactElement;
  }
}

export default ErrorBoundary;
