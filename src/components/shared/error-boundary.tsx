import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    document.title = 'Error | Admin';
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex h-screen flex-col items-center justify-center gap-4 p-8'>
          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-4xl font-bold'>Something went wrong</h1>
            <p className='text-muted-foreground max-w-md text-center'>
              An unexpected error occurred. Please try refreshing the page.
            </p>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className='bg-muted max-w-lg overflow-auto rounded-md p-4 text-sm'>
              {this.state.error.message}
            </pre>
          )}
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={this.handleReset}
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium'
            >
              Try again
            </button>
            <button
              type='button'
              onClick={() => window.location.reload()}
              className='bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium'
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
