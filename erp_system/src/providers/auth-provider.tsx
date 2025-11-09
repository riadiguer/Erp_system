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
    console.log('🔄 refreshMe called');
    try {
      setLoading(true);
      const me = await AuthApi.me();
      console.log('✅ AuthApi.me() response:', me);
      console.log('✅ Is user truthy?', !!me);
      console.log('✅ User object keys:', me ? Object.keys(me) : 'null');
      setUser(me);
      setError(undefined);
    } catch (error) {
      console.log('❌ AuthApi.me() failed:', error);
      setUser(null);
      setError(undefined);
    } finally {
      setLoading(false);
      console.log('✅ Loading set to false');
    }
  }, []);

  useEffect(() => {
    console.log('🚀 AuthProvider mounted, calling refreshMe');
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (payload: { email?: string; username?: string; password: string }) => {
      try {
        setError(undefined);
        await AuthApi.login(payload);
        await refreshMe();
        return true;
      } catch (e: unknown) {
        const errorMessage = e && typeof e === 'object' && 'detail' in e 
          ? String(e.detail) 
          : 'Invalid credentials';
        setError(errorMessage);
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

  const value = useMemo(() => {
    const authValue = { user, loading, error, login, logout, refreshMe };
    console.log('🔍 AuthContext value:', { 
      user: !!user, 
      userKeys: user ? Object.keys(user) : null,
      loading, 
      error 
    });
    return authValue;
  }, [user, loading, error, login, logout, refreshMe]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}