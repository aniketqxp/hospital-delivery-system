import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { profile, signOut } = useAuth();
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

      <main className="shell-main">
        {children}
      </main>
    </div>
  );
}
