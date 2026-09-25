'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_STORAGE_KEYS } from '@/utils/constants';
import { loginUser } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication from localStorage on mount
  useEffect(() => {
    // Schedule in microtask to prevent synchronous cascading render warnings
    queueMicrotask(() => {
      try {
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  /**
   * Log in user with credentials.
   * Updates state, writes to localStorage, and returns the result.
   */
  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);

    // Save to localStorage
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));

    // Update Context State
    setToken(data.token);
    setUser(data.user);

    return data;
  }, []);

  /**
   * Log out user.
   * Clears state, cleans localStorage, and redirects to /login.
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing localStorage on logout:', error);
    }

    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for consuming AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
