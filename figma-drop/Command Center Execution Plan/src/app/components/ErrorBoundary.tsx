import React from 'react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Name shown in error UI to help locate the failing boundary */
  name?: string;
}

/**
 * ERROR BOUNDARY
 * 
 * Catches render-time errors from child components.
 * Shows a minimal, Apple-grade error state with diagnostic info.
 * If a specific route/chunk fails to load, only that section breaks.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`,
      error,
      errorInfo,
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { error } = this.state;
      const isDynamicImport = error?.message?.includes('dynamically imported module')
        || error?.message?.includes('Failed to fetch');

      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: surfaces.solid.base,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.white,
            fontFamily: fonts.primary,
            padding: '32px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '12px',
                color: colors.status.amber.bright,
              }}
            >
              {isDynamicImport ? 'Module Load Error' : 'Something went wrong'}
              {this.props.name && (
                <span style={{ opacity: 0.5 }}> in {this.props.name}</span>
              )}
            </div>

            <div
              style={{
                fontSize: '12px',
                opacity: 0.6,
                fontFamily: fonts.mono,
                lineHeight: 1.6,
                marginBottom: '24px',
                wordBreak: 'break-word',
              }}
            >
              {error?.message || 'Unknown error'}
            </div>

            {isDynamicImport && (
              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.4,
                  marginBottom: '24px',
                  lineHeight: 1.5,
                }}
              >
                This usually means Vite's module cache is stale.
                <br />
                A reload should fix it.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: radius.sm,
                  padding: '10px 20px',
                  color: colors.neutral.white,
                  fontFamily: fonts.primary,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: colors.accent.cyan.primary,
                  border: 'none',
                  borderRadius: radius.sm,
                  padding: '10px 20px',
                  color: colors.neutral.black,
                  fontFamily: fonts.primary,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Hard Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}