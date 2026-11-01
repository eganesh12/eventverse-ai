"use client";

import { Bell, Search, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 w-64">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search events, vendors..."
          className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"
          aria-label="Search"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-violet-600 rounded-full" />
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {user ? getInitials(user.full_name) : "??"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-slate-900 dark:text-white">
                {user?.full_name}
              </div>
              <div className="text-xs text-slate-500 capitalize">{user?.role?.replace("_", " ")}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.full_name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <div className="p-1">
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
