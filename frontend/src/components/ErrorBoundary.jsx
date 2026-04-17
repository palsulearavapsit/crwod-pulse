import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — catches React rendering errors and shows a recovery UI.
 * Wrap individual pages so one crash doesn't white-screen the whole app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Send to analytics in production
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', { description: error.message, fatal: false });
    }
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-200"
        >
          <div className="glass-panel max-w-md w-full p-10 rounded-3xl text-center border border-rose-500/30 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 mb-6">
              <AlertTriangle size={32} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              An unexpected error occurred in this section of the app.
              Your session data is safe.
            </p>
            <code className="block text-xs text-rose-400 bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 mb-8 text-left break-all">
              {this.state.error?.message}
            </code>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              aria-label="Try reloading the page section"
            >
              <RefreshCw size={18} aria-hidden="true" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
