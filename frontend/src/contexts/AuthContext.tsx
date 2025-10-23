'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/services/auth';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if there's a stored user
        const storedUser = AuthService.getStoredUser();
        if (storedUser && AuthService.isAuthenticated()) {
          // Map name fields if present
          const mappedUser = {
            ...storedUser,
            firstName: storedUser.field_first_name || storedUser.firstName,
            lastName: storedUser.field_last_name || storedUser.lastName,
          };
          setUser(mappedUser);
          // Verify with server in background
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            const mappedCurrentUser = {
              ...currentUser,
              firstName: currentUser.field_first_name || currentUser.firstName,
              lastName: currentUser.field_last_name || currentUser.lastName,
            };
            setUser(mappedCurrentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const user = await AuthService.login(credentials);
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      setUser(mappedUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const user = await AuthService.register(data);
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      setUser(mappedUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}