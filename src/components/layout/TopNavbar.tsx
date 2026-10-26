"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu, PanelLeftOpen } from "lucide-react";
import { DimeLogo } from "@/components/brand/DimeLogo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationPopover } from "@/components/layout/NotificationPopover";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

const GlobalSearchModal = dynamic(
  () => import("@/components/layout/GlobalSearchModal").then((mod) => mod.GlobalSearchModal),
  { ssr: false }
);

export function TopNavbar({
  toggleSidebar,
  isSidebarOpen = true,
}: {
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-md border-b border-[#EAE4DC] dark:border-[#2E2A25] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200">
      <div className="flex justify-between items-center w-full px-3.5 sm:px-6 h-16">
        {/* Left side: Mobile Toggle & Desktop Expand Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="mobile-sidebar-toggle-btn"
            onClick={toggleSidebar}
            suppressHydrationWarning
            className="lg:hidden p-2 rounded-xl text-[#776E65] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] transition-colors cursor-pointer shrink-0"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile brand icon */}
          <Link
            href="/dashboard"
            className="lg:hidden flex items-center justify-center shrink-0"
            title="DIME"
          >
            <DimeLogo size="sm" />
          </Link>

          {/* Desktop sidebar expand button shown in navbar when left panel is collapsed */}
          {!isSidebarOpen && (
            <button
              type="button"
              id="navbar-sidebar-toggle-btn"
              onClick={toggleSidebar}
              suppressHydrationWarning
              className="hidden lg:flex h-8 w-8 rounded-lg border border-[#EAE4DC] dark:border-[#34302B] bg-white dark:bg-[#201E1B] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] text-[#776E65] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] shadow-xs active:scale-95 transition-all duration-150 items-center justify-center cursor-pointer group shrink-0"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
            </button>
          )}
        </div>

        {/* Center: Search & Engine Indicator (Middle of the navbar) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 flex-1 max-w-2xl mx-auto px-2 sm:px-4 min-w-0">
          <div className="w-full max-w-md min-w-0">
            <GlobalSearchModal />
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#1D342A] border border-green-200/80 dark:border-emerald-800/40 text-[#159B72] dark:text-[#55C99A] shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#159B72] dark:bg-[#55C99A] animate-pulse" />
            <span className="text-xs font-semibold">Engine v3.4 Active</span>
          </div>
        </div>

        {/* Right side: Actions, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Animated Premium Theme Toggle */}
          <ThemeToggle />

          {/* Real-time Notification Popover */}
          <NotificationPopover />

          <div className="h-6 w-px bg-[#EAE4DC] dark:bg-[#2E2A25] mx-0.5 hidden sm:block" />

          {/* Interactive Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

