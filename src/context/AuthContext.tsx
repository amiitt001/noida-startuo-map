/**
 * Authentication Context & Provider
 *
 * Manages user authentication state based on server-side HTTP-only sessions.
 * Never stores tokens or session state in localStorage.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await apiClient.get<{ authenticated: boolean; user: User | null }>('/api/auth/session');
      if (res.data.authenticated && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (_err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiClient.post<{ user: User }>('/api/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (email: string, password: string, name: string): Promise<User> => {
    const res = await apiClient.post<{ user: User }>('/api/auth/register', { email, password, name });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
