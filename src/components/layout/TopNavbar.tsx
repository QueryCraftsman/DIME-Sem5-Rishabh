"use client";

import React from "react";
import { Search, Bell, Menu, Activity } from "lucide-react";
import { useSession } from "next-auth/react";

export function TopNavbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="h-[76px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          suppressHydrationWarning
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="hidden md:flex max-w-md w-full relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-dime-orange transition-colors" />
          <input 
            type="text" 
            placeholder="Search ideas, markets or datasets..." 
            className="w-full h-10 pl-10 pr-4 bg-slate-100 hover:bg-slate-200 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:bg-slate-900 border border-transparent focus:border-dime-orange rounded-xl text-[14px] text-dime-navy dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 h-5 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Engine Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
            Engine v3.4 Active
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-dime-orange ring-2 ring-white dark:ring-slate-900" />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
          <div className="hidden sm:block">
            <div className="text-[13px] font-semibold text-dime-navy dark:text-white leading-tight">
              {session?.user?.name || "User"}
            </div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
              {session?.user?.email || "user@example.com"}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-dime-orange to-dime-purple flex items-center justify-center text-white font-medium text-sm border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (session?.user?.name || "U")[0].toUpperCase()
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
