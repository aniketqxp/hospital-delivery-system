import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  hospitalId: string;
  hospitalName: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('hospital_id, hospitals(name)')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    hospitalId: data.hospital_id,
    hospitalName: (data.hospitals as any)?.name ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          fetchProfile(currentUser.id)
            .then((p) => {
              if (!p) {
                setProfile(null);
                setProfileError(
                  'Your account is not linked to a hospital. Contact your administrator.'
                );
              } else {
                setProfile(p);
                setProfileError(null);
              }
            })
            .catch((err) => {
              setProfile(null);
              setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
            });
        } else {
          setProfile(null);
          setProfileError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, profileError, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
