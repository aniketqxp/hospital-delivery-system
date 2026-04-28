import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wash flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-subtle uppercase tracking-widest" style={{ marginBottom: '0.625rem' }}>
            Hospital Delivery System
          </p>
          <h1 className="text-lg font-bold text-ink">Sign in</h1>
        </div>

        {/* Card */}
        <div className="bg-canvas border border-line rounded-lg" style={{ padding: '2rem 2rem', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger border border-danger-bg rounded-md bg-danger-bg px-4 py-3" style={{ marginTop: '1.25rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ marginTop: '1.75rem', paddingBlock: '0.625rem' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
