import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Error Boundary Caught]', error, errorInfo);
    // @ts-ignore
    if (typeof gtag === 'function') {
      // @ts-ignore
      gtag('event', 'exception', {
        'description': error.message,
        'fatal': false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="glass-panel p-10 rounded-3xl max-w-md border border-rose-500/20">
             <h2 className="text-2xl font-black text-rose-400 mb-4">Something went wrong.</h2>
             <p className="text-slate-400 mb-6 text-sm">We've logged the issue and or ops team is on it.</p>
             <button 
               onClick={() => window.location.reload()}
               className="bg-brand-600 text-slate-950 font-black px-8 py-3 rounded-xl"
             >
               Refresh Page
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
