'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Route protection guard for authenticated pages.
 * Displays a clean loading state while authentication initializes,
 * redirects unauthenticated users to /login, and renders children when authenticated.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While restoring auth state from localStorage, display a clean loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-600">Verifying session...</p>
      </div>
    );
  }

  // If not authenticated, render nothing while redirect takes effect
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
