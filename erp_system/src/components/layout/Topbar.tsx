'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { LogOut, User, Building2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm sticky top-0 z-50">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            ERP Dashboard
          </h1>
          <div className="text-xs text-slate-500">Enterprise Resource Planning</div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative">
            {/* User info button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-slate-800">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-slate-500">
                  {user.roles?.join(', ') || 'User'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl z-20 overflow-hidden">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.roles?.join(', ') || 'User'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add profile navigation here
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      View Profile
                    </button>
                    
                    <div className="border-t border-slate-100 my-1" />
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick logout button for mobile */}
        <button
          onClick={handleLogout}
          className="sm:hidden p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}