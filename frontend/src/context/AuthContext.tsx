import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('studyflow_access_token');
        const storedUser = localStorage.getItem('studyflow_user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession({
            access_token: storedToken,
            refresh_token: localStorage.getItem('studyflow_refresh_token') || '',
          });

          // Verify session with backend
          try {
            const res = await api.me();
            if (res.user) {
              setUser(res.user);
              localStorage.setItem('studyflow_user', JSON.stringify(res.user));
            }
          } catch {
            // Token expired or backend down — clear auth
            localStorage.removeItem('studyflow_access_token');
            localStorage.removeItem('studyflow_refresh_token');
            localStorage.removeItem('studyflow_user');
            setUser(null);
            setSession(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setSession(res.session);
    localStorage.setItem('studyflow_access_token', res.session.access_token);
    localStorage.setItem('studyflow_refresh_token', res.session.refresh_token);
    localStorage.setItem('studyflow_user', JSON.stringify(res.user));
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    const res = await api.signup({ email, password, fullName });
    if (res.session && res.user) {
      setUser(res.user);
      setSession(res.session);
      localStorage.setItem('studyflow_access_token', res.session.access_token);
      localStorage.setItem('studyflow_refresh_token', res.session.refresh_token);
      localStorage.setItem('studyflow_user', JSON.stringify(res.user));
    }
    return { requiresEmailConfirmation: res.requiresEmailConfirmation };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setSession(null);
  };

  const forgotPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const res = await api.forgotPassword(email, redirectTo);
    return res.message;
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
