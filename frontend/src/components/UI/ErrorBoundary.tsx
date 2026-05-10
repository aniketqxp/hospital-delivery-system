import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Render error caught by ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-wash)',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'var(--color-canvas)',
            border: '1px solid var(--color-line)',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-subtle)', marginBottom: '1.5rem' }}>
            The app hit an unexpected error. You can try recovering, or reload the page.
          </p>
          <pre
            style={{
              fontSize: 'var(--text-2xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-danger)',
              backgroundColor: 'var(--color-danger-bg)',
              padding: '0.75rem',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '8rem',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </pre>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={this.handleReset} className="btn-primary">
              Try again
            </button>
            <button onClick={this.handleReload} className="btn-secondary">
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
