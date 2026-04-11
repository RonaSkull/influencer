import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary捕获错误:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.title}>Algo deu errado!</h2>
            <p style={styles.message}>
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            
            {this.state.errorInfo && (
              <details style={styles.details}>
                <summary style={styles.summary}>Detalhes técnicos</summary>
                <pre style={styles.pre}>
                  {this.state.error?.stack || this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.actions}>
              <button style={styles.retryButton} onClick={this.handleReset}>
                🔄 Tentar novamente
              </button>
              <button 
                style={styles.homeButton}
                onClick={() => window.location.href = '/'}
              >
                🏠 Voltar ao início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    padding: '20px',
  } as React.CSSProperties,
  errorCard: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  errorIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  } as React.CSSProperties,
  title: {
    color: '#ef4444',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
  } as React.CSSProperties,
  message: {
    color: '#fca5a5',
    fontSize: '14px',
    marginBottom: '16px',
  } as React.CSSProperties,
  details: {
    textAlign: 'left' as const,
    marginBottom: '16px',
  } as React.CSSProperties,
  summary: {
    cursor: 'pointer',
    color: '#93c5fd',
    fontSize: '13px',
    marginBottom: '8px',
  } as React.CSSProperties,
  pre: {
    background: 'rgba(0,0,0,0.3)',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '11px',
    overflow: 'auto',
    maxHeight: '150px',
    color: '#cbd5e1',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  retryButton: {
    background: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  homeButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '10px 20px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
};

export default ErrorBoundary;