"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Users,
  ShoppingBag,
  Bot,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "AI Planner",
    href: "/ai-planner",
    icon: Bot,
  },
  {
    label: "Budget",
    href: "/budget",
    icon: DollarSign,
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: ShoppingBag,
  },
  {
    label: "Guests",
    href: "/guests",
    icon: Users,
  },
  {
    label: "Creative Studio",
    href: "/creative-studio",
    icon: Palette,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            EventVerse <span className="text-violet-600">AI</span>
          </span>
        )}
      </div>

      {/* Quick create */}
      <div className="px-3 py-3">
        <Link href="/events/new">
          <Button
            variant="gradient"
            size="sm"
            className={cn("w-full", collapsed && "px-0 justify-center")}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>New Event</span>}
          </Button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                {user.full_name}
              </div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-500" />
        )}
      </button>
    </aside>
  );
}
