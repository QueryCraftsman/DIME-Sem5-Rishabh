"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { PanelLeftOpen } from "lucide-react";

export function TopNavbar({
  toggleSidebar,
  isSidebarOpen = true,
}: {
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
}) {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const displayName = session?.user?.name || "Alex Morgan";
  const displayRole = "Product Lead";

  return (
    <header className="sticky top-0 z-20 w-full bg-surface-white border-b border-border-default shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-16">
        {/* Left side: Mobile Toggle & Desktop Expand Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="mobile-sidebar-toggle-btn"
            onClick={toggleSidebar}
            suppressHydrationWarning
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-strong hover:bg-canvas-bg transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Desktop 21st.dev/shadcn sidebar button shown in navbar when left panel is hidden/collapsed */}
          {!isSidebarOpen && (
            <button
              type="button"
              id="navbar-sidebar-toggle-btn"
              onClick={toggleSidebar}
              suppressHydrationWarning
              className="hidden lg:flex h-8 w-8 rounded-lg border border-border-default bg-surface-white hover:bg-canvas-bg hover:border-slate-300 text-text-secondary hover:text-text-strong shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-90 transition-all duration-150 items-center justify-center cursor-pointer group shrink-0"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
            </button>
          )}
        </div>

        {/* Center: Search & Engine Indicator (Middle of the navbar) */}
        <div className="flex items-center justify-center gap-4 lg:gap-6 flex-1 max-w-2xl mx-auto px-4">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              search
            </span>
            <input
              className="w-full h-10 pl-9 pr-12 rounded-lg border border-border-default bg-surface-white text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="Search ideas, markets or datasets... ⌘K"
              type="text"
              suppressHydrationWarning
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary bg-canvas-bg border border-border-default rounded">
              ⌘K
            </kbd>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-success-soft border border-green-200 text-success-green shrink-0">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
            <span className="font-label-sm text-label-sm">Engine v3.4 Active</span>
          </div>
        </div>

        {/* Right side: Actions, Notifications, Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            className="p-2 rounded-lg text-text-secondary hover:text-text-strong hover:bg-canvas-bg transition-colors"
            title="Toggle theme"
            type="button"
            onClick={toggleTheme}
            suppressHydrationWarning
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <button
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-strong hover:bg-canvas-bg transition-colors"
            title="Notifications"
            type="button"
            suppressHydrationWarning
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          <div className="h-6 w-px bg-border-default mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-1">
            <img
              className="w-8 h-8 rounded-full border border-border-default object-cover"
              alt="Alex Morgan"
              src={
                session?.user?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAaVbH1YbOqCTKSmmtUgrYPcKELo-8-KiUHwLz0jXRAK1JUaNMcCDUnuV5qV5X3PfoIaBRG5gCKwKV2I9u70lI206V8w_oIxYda4YLLJBcWcXo2jQkKNTdqZItGoG5agy2IPmjpZyjIik4tym8--CWma6NE2uBK2cXhFSgPIZoE1R9pKlXoVfRFP6WAvdlS9Fy6cIrZxKmefUhzFe-_CygpHw6NoD_8HY2snqC8VhIRAMCCHOuwc_h4XA"
              }
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-body-semibold text-body-semibold text-text-strong">
                {displayName}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                {displayRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

