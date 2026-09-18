import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearTokens, ensureFreshToken, setTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Boot: restore the session from storage.
   * - access token missing but refresh token present -> refresh first (token expiry handling)
   * - `redirect: false` so a stale token on a public page never bounces the visitor
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await ensureFreshToken();
        if (!ok) {
          clearTokens();
          if (!cancelled) setUser(null);
          return;
        }
        const me = await api('/auth/me', { redirect: false });
        if (!cancelled) setUser(me);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', auth: false, body: { email, password } });
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await api('/auth/signup', { method: 'POST', auth: false, body: payload });
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => api('/auth/me', { redirect: false }).then(setUser), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthed: !!user,
      isAdmin: user?.role === 'admin',
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, loading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
