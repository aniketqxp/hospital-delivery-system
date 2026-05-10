import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { profile, profileError, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="shell-wrap">
      <header className="shell-header">
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-ink)' }}>
            {profile?.hospitalName ?? 'Hospital Delivery System'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-subtle hover:text-ink transition-colors duration-100"
          style={{ paddingInline: '0', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </header>

      {profileError && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderBottom: '1px solid var(--color-line)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
          }}
        >
          {profileError}
        </div>
      )}

      <main className="shell-main">
        {children}
      </main>
    </div>
  );
}
