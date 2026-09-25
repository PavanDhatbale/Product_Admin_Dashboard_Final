'use client';

import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger button */}
        <button
          onClick={onMenuClick}
          aria-label="Open mobile menu"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            Product Catalog
          </h1>
        </div>
      </div>

      {/* Right side: Authenticated user details & logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.firstName || 'User'}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-400">@{user?.username}</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign Out"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
