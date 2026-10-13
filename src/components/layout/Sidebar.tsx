"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Database, 
  Target, 
  Folder, 
  FileText, 
  Settings,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Validate Idea",
    icon: Lightbulb,
    href: "/ideas/new", // Assuming new validation triggers idea creation flow
  },
  {
    label: "Market Intelligence",
    icon: TrendingUp,
    href: "/market-analysis",
  },
  {
    label: "Competition",
    icon: Users,
    href: "/competition",
  },
  {
    label: "Research & Evidence",
    icon: Database,
    href: "/research",
  },
  {
    label: "Opportunity Matrix",
    icon: Target,
    href: "/opportunity-matrix",
  },
];

const WORKSPACE_ITEMS = [
  {
    label: "My Ideas",
    icon: Folder,
    href: "/ideas",
  },
  {
    label: "Notes",
    icon: FileText,
    href: "/notes",
  },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    
    return (
      <Link 
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors font-medium text-[14px]",
          isActive 
            ? "bg-dime-orange text-white" 
            : "text-slate-700 hover:bg-orange-50 hover:text-dime-orange dark:text-slate-300 dark:hover:bg-slate-800"
        )}
      >
        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
        <span className={cn("transition-opacity duration-200", !isOpen && "lg:hidden")}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0",
        isOpen ? "w-[268px] translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-[80px]"
      )}
    >
      {/* Logo Area */}
      <div className="h-[76px] flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dime-orange flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          <span className={cn("text-xl font-bold tracking-tight text-dime-navy dark:text-white transition-opacity", !isOpen && "lg:hidden")}>
            DIME
          </span>
        </Link>
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        <div>
          <h3 className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity", !isOpen && "lg:hidden")}>
            Workspace
          </h3>
          <nav className="flex flex-col gap-1">
            {WORKSPACE_ITEMS.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors font-medium text-[14px] text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span className={cn("transition-opacity", !isOpen && "lg:hidden")}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
