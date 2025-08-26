'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthApi } from '@/lib/features/auth/api';
import type { User } from '@/lib/features/auth/types';

export type AuthContextState = {
  user: User | null;
  loading: boolean;
  error?: string;
  login: (payload: { email?: string; username?: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const refreshMe = useCallback(async () => {
    try {
      setLoading(true);
      const me = await AuthApi.me();
      setUser(me);
      // unauthenticated on boot is normal → no error message
      setError(undefined);
    } catch {
      setUser(null);
      setError(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (payload: { email?: string; username?: string; password: string }) => {
      try {
        setError(undefined);
        await AuthApi.login(payload);
        await refreshMe();
        return true;
      } catch (e: any) {
        setError(e?.detail || 'Invalid credentials');
        return false;
      }
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, refreshMe }),
    [user, loading, error, login, logout, refreshMe]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
