"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  PanelLeftClose, 
  LayoutDashboard, 
  Sparkles, 
  Lightbulb, 
  Compass, 
  StickyNote, 
  Settings2 
} from "lucide-react";
import { DimeLogo } from "@/components/brand/DimeLogo";

interface NavItem {
  label: string;
  iconType: "dashboard" | "validate" | "ideas" | "matrix" | "notes" | "settings";
  href: string;
  badge?: number | string;
}

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [ideaCount, setIdeaCount] = useState<number>(12);

  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setIdeaCount(data.length);
        } else if (data?.ideas && Array.isArray(data.ideas)) {
          setIdeaCount(data.ideas.length);
        }
      })
      .catch(() => {});
  }, []);

  const isMainActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/ideas/new") {
      return (
        pathname === "/ideas/new" ||
        pathname.startsWith("/ideas/new/") ||
        pathname === "/validate" ||
        pathname.startsWith("/validate/")
      );
    }
    if (href === "/ideas") {
      return (
        pathname === "/ideas" ||
        (pathname.startsWith("/ideas/") && !pathname.startsWith("/ideas/new"))
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isWorkspaceActive = (href: string) => {
    if (href === "/opportunity-matrix") {
      return (
        pathname === "/opportunity-matrix" ||
        pathname.startsWith("/opportunity-matrix/") ||
        pathname === "/opportunities" ||
        pathname.startsWith("/opportunities/")
      );
    }
    if (href === "/notes") {
      return pathname === "/notes" || pathname.startsWith("/notes/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      iconType: "dashboard",
      href: "/dashboard",
    },
    {
      label: "Validate Idea",
      iconType: "validate",
      href: "/ideas/new",
    },
    {
      label: "My Ideas",
      iconType: "ideas",
      href: "/ideas",
      badge: ideaCount,
    },
  ];

  const workspaceNavItems: NavItem[] = [
    {
      label: "Opportunity Matrix",
      iconType: "matrix",
      href: "/opportunity-matrix",
    },
    {
      label: "Notes",
      iconType: "notes",
      href: "/notes",
    },
  ];

  const renderNavIcon = (iconType: NavItem["iconType"], active: boolean) => {
    const getIcon = () => {
      switch (iconType) {
        case "dashboard":
          return <LayoutDashboard className="w-4 h-4" />;
        case "validate":
          return <Sparkles className="w-4 h-4" />;
        case "ideas":
          return <Lightbulb className="w-4 h-4" />;
        case "matrix":
          return <Compass className="w-4 h-4" />;
        case "notes":
          return <StickyNote className="w-4 h-4" />;
        case "settings":
          return <Settings2 className="w-4 h-4" />;
        default:
          return <LayoutDashboard className="w-4 h-4" />;
      }
    };

    return (
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
          active
            ? "bg-white/20 text-white shadow-xs"
            : "bg-[#EFEAE2]/60 dark:bg-[#201E1B] text-[#776E65] dark:text-[#9A9085] group-hover:text-[#171717] dark:group-hover:text-[#F4F0E9] group-hover:bg-white dark:group-hover:bg-[#26231F] border border-transparent group-hover:border-[#E8E1D8] dark:group-hover:border-[#34302B] group-hover:shadow-xs group-hover:scale-105"
        }`}
      >
        {getIcon()}
      </div>
    );
  };

  const displayName = session?.user?.name || "Vivek Chaurasiya";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      {/* SIDE NAVIGATION BAR (268px expanded / 72px collapsed icon rail) */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 h-full shrink-0 bg-[#F8F5F0] dark:bg-[#1A1816] border-r border-[#E8E1D8] dark:border-[#2E2A25] flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-[width,padding,transform] duration-300 ease-in-out ${
          isOpen
            ? "w-[268px] p-4 translate-x-0"
            : "w-[72px] py-4 px-2 -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Section: Brand & Primary Navigation */}
        <div className="flex flex-col gap-3">
          {/* Brand Header & Toggle Button */}
          <div
            className={`h-10 flex items-center ${
              isOpen ? "justify-between px-1" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/dashboard"
                className="group flex items-center justify-center shrink-0"
                title="DIME"
              >
                <DimeLogo size="md" />
              </Link>
              {isOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[18px] font-black tracking-tight text-[#171717] dark:text-[#F4F0E9] leading-none">
                    DIME
                  </span>
                  <span className="text-[11px] font-medium text-[#898078] dark:text-[#9A9085] leading-tight mt-0.5">
                    Product Intelligence
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Toggle Button (shown when expanded) */}
            {isOpen && (
              <button
                type="button"
                id="sidebar-toggle-btn"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg border border-[#E8E1D8] dark:border-[#34302B] bg-[#FDFBF8] dark:bg-[#201E1B] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] text-[#776E65] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] shadow-xs active:scale-95 transition-all duration-150 shrink-0 flex items-center justify-center cursor-pointer group"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
              </button>
            )}
          </div>

          {/* MAIN Section */}
          <div className="mt-4 flex flex-col gap-1">
            {isOpen && (
              <div className="px-3 pb-1 text-[11px] font-bold text-[#898078] dark:text-[#9A9085] uppercase tracking-wider">
                Main
              </div>
            )}
            {mainNavItems.map((item) => {
              const active = isMainActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  title={!isOpen ? item.label : undefined}
                  className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                    isOpen
                      ? "justify-between px-3 py-2"
                      : "w-10 h-10 mx-auto justify-center"
                  } ${
                    active
                      ? "bg-primary text-white font-semibold shadow-xs shadow-orange-500/20"
                      : "text-[#514B45] dark:text-[#C1B8AD] font-medium hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] hover:text-[#171717] dark:hover:text-[#F4F0E9]"
                  }`}
                >
                  <div className={`flex items-center ${isOpen ? "gap-2.5" : "justify-center relative"}`}>
                    {renderNavIcon(item.iconType, active)}
                    {!isOpen && item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-[#F8F5F0] dark:ring-[#1A1816]" />
                    )}
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </div>

                  {isOpen && item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                        active
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-[#EFEAE2] dark:bg-[#26231F] text-[#514B45] dark:text-[#C1B8AD] border-[#E8E1D8] dark:border-[#34302B]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {!isOpen && (
                    <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                      {item.label} {item.badge !== undefined ? `(${item.badge})` : ""}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* WORKSPACE Section */}
          <div className={`border-t border-[#E8E1D8]/80 dark:border-[#2E2A25] ${isOpen ? "pt-2.5" : "pt-2"}`}>
            {isOpen ? (
              <div className="px-3 pb-1 text-[11px] font-bold text-[#898078] dark:text-[#9A9085] uppercase tracking-wider">
                Workspace
              </div>
            ) : (
              <div className="w-8 h-px bg-[#E8E1D8] dark:bg-[#2E2A25] mx-auto mb-2" />
            )}
            <div className="flex flex-col gap-1">
              {workspaceNavItems.map((item) => {
                const active = isWorkspaceActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    title={!isOpen ? item.label : undefined}
                    className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                      isOpen
                        ? "gap-2.5 px-3 py-2"
                        : "w-10 h-10 mx-auto justify-center"
                    } ${
                      active
                        ? "bg-primary text-white font-semibold shadow-xs shadow-orange-500/20"
                        : "text-[#514B45] dark:text-[#C1B8AD] font-medium hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] hover:text-[#171717] dark:hover:text-[#F4F0E9]"
                    }`}
                  >
                    {renderNavIcon(item.iconType, active)}
                    {isOpen ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom SYSTEM / SETTINGS & FOOTER Section */}
        <div
          className={`border-t border-[#E8E1D8]/80 dark:border-[#2E2A25] flex flex-col gap-1.5 ${
            isOpen ? "pt-2.5" : "pt-2"
          }`}
        >
          {isOpen && (
            <div className="px-3 pb-0.5 text-[11px] font-bold text-[#898078] dark:text-[#9A9085] uppercase tracking-wider">
              System
            </div>
          )}

          <Link
            href="/settings"
            onClick={() => {
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            title={!isOpen ? "Settings" : undefined}
            className={`group relative flex items-center rounded-xl transition-all duration-150 ${
              isOpen
                ? "gap-2.5 px-3 py-2"
                : "w-10 h-10 mx-auto justify-center"
            } ${
              isSettingsActive
                ? "bg-primary text-white font-semibold shadow-xs shadow-orange-500/20"
                : "text-[#514B45] dark:text-[#C1B8AD] font-medium hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] hover:text-[#171717] dark:hover:text-[#F4F0E9]"
            }`}
          >
            {renderNavIcon("settings", isSettingsActive)}
            {isOpen ? (
              <span>Settings</span>
            ) : (
              <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                Settings
              </span>
            )}
          </Link>

          {/* Credit Balance */}
          {isOpen ? (
            <div className="mt-1 p-2.5 rounded-xl bg-[#FDFBF8] dark:bg-[#201E1B] border border-[#E8E1D8] dark:border-[#34302B] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-[#69645F] dark:text-[#9A9085]">
                  Credit Balance
                </span>
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#171717] dark:text-[#F4F0E9]">
                4,850 ops
              </span>
            </div>
          ) : (
            <div
              title="Credit Balance: 4,850 ops"
              className="mt-1 w-10 h-10 mx-auto rounded-xl bg-[#FDFBF8] dark:bg-[#201E1B] border border-[#E8E1D8] dark:border-[#34302B] flex flex-col items-center justify-center gap-0.5 cursor-default group relative shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-[#171717] dark:text-[#F4F0E9] tracking-tighter leading-none">
                4.8k
              </span>
              <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                Credit: 4,850 ops
              </span>
            </div>
          )}

          {/* User Profile Footer */}
          {isOpen ? (
            <div className="mt-1 pt-2.5 border-t border-[#E8E1D8] dark:border-[#2E2A25] flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-[#2D1A10] text-primary dark:text-[#F97316] font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200/80 dark:border-orange-900/40 shadow-xs">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#171717] dark:text-[#F4F0E9] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#898078] dark:text-[#9A9085] truncate max-w-[170px]">
                  {session?.user?.email || "vivekchaurasiya943@gmail.com"}
                </span>
              </div>
            </div>
          ) : (
            <div
              title={displayName}
              className="mt-1 w-8 h-8 mx-auto rounded-full bg-orange-100 dark:bg-[#2D1A10] text-primary dark:text-[#F97316] font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200/80 dark:border-orange-900/40 shadow-xs cursor-default group relative"
            >
              {userInitials}
              <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                {displayName}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
