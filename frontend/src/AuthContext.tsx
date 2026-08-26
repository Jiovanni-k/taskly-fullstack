import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, session } from './api';
import type { AuthResponse, User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    session.clear();
    setUser(null);
  };

  useEffect(() => {
    const restore = async () => {
      if (!localStorage.getItem(session.tokenKey)) {
        setLoading(false);
        return;
      }
      try {
        setUser((await authApi.me()).user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    void restore();
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: ({ token, user: nextUser }: AuthResponse) => {
        session.save(token);
        setUser(nextUser);
      },
      logout,
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
