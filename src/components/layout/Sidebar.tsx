"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DimeLogo } from "@/components/brand/DimeLogo";

interface NavItem {
  label: string;
  icon: string;
  href: string;
  fillWhenActive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: "space_dashboard",
    href: "/dashboard",
  },
  {
    label: "Validate Idea",
    icon: "fact_check",
    href: "/ideas/new",
  },
  {
    label: "Market Intelligence",
    icon: "insights",
    href: "/market-analysis",
    fillWhenActive: true,
  },
  {
    label: "Competition",
    icon: "leaderboard",
    href: "/competition",
  },
  {
    label: "Research & Evidence",
    icon: "library_books",
    href: "/research",
  },
  {
    label: "Opportunity Matrix",
    icon: "radar",
    href: "/opportunity-matrix",
  },
];

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
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

  const isItemActive = (itemHref: string) => {
    if (itemHref === "/ideas/new") {
      return (
        pathname === "/ideas/new" ||
        pathname.startsWith("/ideas/new/") ||
        pathname.includes("/analysis")
      );
    }
    if (itemHref === "/market-analysis") {
      return (
        pathname === "/market-analysis" ||
        pathname.startsWith("/market-analysis/")
      );
    }
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  const isMyIdeasActive =
    pathname === "/ideas" ||
    (pathname.startsWith("/ideas/") &&
      !pathname.startsWith("/ideas/new") &&
      !pathname.includes("/analysis"));

  const isNotesActive = pathname === "/notes" || pathname.startsWith("/notes/");
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

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
        className={`fixed lg:static inset-y-0 left-0 z-40 h-full shrink-0 bg-surface-white border-r border-border-default flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-[width,padding] duration-300 ease-in-out ${
          isOpen
            ? "w-[268px] p-4 translate-x-0"
            : "w-[72px] py-4 px-2 -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Section: Brand & Primary CTA */}
        <div className="flex flex-col gap-3.5">
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
                  <span className="text-[18px] font-black tracking-tight text-text-strong leading-none">
                    DIME
                  </span>
                  <span className="text-[11px] font-medium text-text-secondary leading-tight mt-0.5">
                    Product Intelligence
                  </span>
                </div>
              )}
            </div>

            {/* 21st.dev / shadcn style Sidebar Toggle Button (shown only when expanded; when collapsed, button moves to navbar) */}
            {isOpen && (
              <button
                type="button"
                id="sidebar-toggle-btn"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg border border-border-default bg-surface-white hover:bg-canvas-bg hover:border-slate-300 text-text-secondary hover:text-text-strong shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-90 transition-all duration-150 shrink-0 flex items-center justify-center cursor-pointer group"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
              </button>
            )}
          </div>

          {/* Main Navigation Links - positioned lower for balanced visual rhythm and seamless alignment */}
          <nav className="mt-5 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  title={!isOpen ? item.label : undefined}
                  className={`group relative flex items-center rounded-lg transition-colors ${
                    isOpen
                      ? "gap-3 px-3 py-2"
                      : "w-10 h-10 mx-auto justify-center"
                  } ${
                    active
                      ? "bg-primary text-on-primary font-body-semibold text-body-semibold shadow-sm"
                      : "text-text-secondary font-label-md text-label-md hover:bg-canvas-bg hover:text-text-strong"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      active ? "text-white" : ""
                    }`}
                    style={
                      active && item.fillWhenActive
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {item.icon}
                  </span>
                  {isOpen ? (
                    <span className="truncate">{item.label}</span>
                  ) : (
                    /* Floating modern tooltip for icon-rail mode */
                    <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Workspace Links Section */}
          <div className={`border-t border-border-default ${isOpen ? "pt-2.5" : "pt-2"}`}>
            {isOpen ? (
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Workspace
              </div>
            ) : (
              <div className="w-8 h-px bg-border-default mx-auto mb-2" />
            )}
            <div className="flex flex-col gap-1">
              <Link
                href="/ideas"
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                title={!isOpen ? `My Ideas (${ideaCount})` : undefined}
                className={`group relative flex items-center rounded-lg transition-colors ${
                  isOpen
                    ? "justify-between px-3 py-2"
                    : "w-10 h-10 mx-auto justify-center"
                } ${
                  isMyIdeasActive
                    ? "bg-primary text-on-primary font-body-semibold text-body-semibold shadow-sm"
                    : "text-text-secondary font-label-md text-label-md hover:bg-canvas-bg hover:text-text-strong"
                }`}
              >
                <div
                  className={`flex items-center ${
                    isOpen ? "gap-3" : "justify-center relative"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    lightbulb
                  </span>
                  {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                  )}
                  {isOpen && <span>My Ideas</span>}
                </div>
                {isOpen ? (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-semibold rounded border ${
                      isMyIdeasActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-canvas-bg text-text-secondary border-border-default"
                    }`}
                  >
                    {ideaCount}
                  </span>
                ) : (
                  <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    My Ideas ({ideaCount})
                  </span>
                )}
              </Link>

              <Link
                href="/notes"
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                title={!isOpen ? "Notes" : undefined}
                className={`group relative flex items-center rounded-lg transition-colors ${
                  isOpen
                    ? "gap-3 px-3 py-2"
                    : "w-10 h-10 mx-auto justify-center"
                } ${
                  isNotesActive
                    ? "bg-primary text-on-primary font-body-semibold text-body-semibold shadow-sm"
                    : "text-text-secondary font-label-md text-label-md hover:bg-canvas-bg hover:text-text-strong"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  note_stack
                </span>
                {isOpen ? (
                  <span>Notes</span>
                ) : (
                  <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    Notes
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Profile / Settings Footer */}
        <div
          className={`border-t border-border-default flex flex-col gap-1 ${
            isOpen ? "pt-2.5" : "pt-2"
          }`}
        >
          <Link
            href="/settings"
            onClick={() => {
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            title={!isOpen ? "Settings" : undefined}
            className={`group relative flex items-center rounded-lg transition-colors ${
              isOpen
                ? "gap-3 px-3 py-2"
                : "w-10 h-10 mx-auto justify-center"
            } ${
              isSettingsActive
                ? "bg-primary text-on-primary font-body-semibold text-body-semibold shadow-sm"
                : "text-text-secondary font-label-md text-label-md hover:bg-canvas-bg hover:text-text-strong"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
            {isOpen ? (
              <span>Settings</span>
            ) : (
              <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                Settings
              </span>
            )}
          </Link>

          {isOpen ? (
            <div className="mt-1.5 p-2 rounded-lg bg-canvas-bg border border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-caption text-caption text-text-secondary">
                  Credit Balance
                </span>
              </div>
              <span className="font-body-semibold text-body-semibold text-text-strong">
                4,850 ops
              </span>
            </div>
          ) : (
            <div
              title="Credit Balance: 4,850 ops"
              className="mt-1.5 w-10 h-10 mx-auto rounded-lg bg-canvas-bg border border-border-default flex flex-col items-center justify-center gap-0.5 cursor-default group relative"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-text-strong tracking-tighter leading-none">
                4.8k
              </span>
              <span className="fixed pointer-events-none z-50 left-[76px] px-2.5 py-1 text-xs font-medium text-white bg-text-strong rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                Credit: 4,850 ops
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
