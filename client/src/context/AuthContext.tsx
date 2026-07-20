import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../utils/types';
import { authApi } from '../services/auth';
import { tokenStore } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On boot, if we have a token, try to restore the session.
  useEffect(() => {
    let active = true;
    async function restore() {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await authApi.login({ email, password })),
      register: async (name, email, password) =>
        setUser(await authApi.register({ name, email, password })),
      logout: () => {
        authApi.logout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
