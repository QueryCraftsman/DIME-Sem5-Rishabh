"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Cpu,
  BookOpen,
  AlertTriangle,
  Compass,
  FileCheck2,
  FileText,
  Activity,
  History,
  StickyNote
} from "lucide-react";

export type WorkspaceTabId = 
  | "overview"
  | "market"
  | "competition"
  | "technical"
  | "research"
  | "risks"
  | "opportunity"
  | "evidence"
  | "report"
  | "activity"
  | "history"
  | "notes";

export interface TabBadgeInfo {
  marketSources?: number;
  competitionDirect?: number;
  technicalLabel?: string;
  researchPapers?: number;
  risksCount?: number;
  evidenceCount?: number;
  historyCount?: number;
}

interface IdeaWorkspaceTabsProps {
  activeTab: WorkspaceTabId;
  basePath?: string;
  onTabChange?: (tab: WorkspaceTabId) => void;
  badges?: TabBadgeInfo;
}

export function IdeaWorkspaceTabs({
  activeTab,
  basePath,
  onTabChange,
  badges = {},
}: IdeaWorkspaceTabsProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const tabs: Array<{
    id: WorkspaceTabId;
    label: string;
    shortLabel?: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "market",
      label: "Market",
      icon: <TrendingUp className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.marketSources !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{badges.marketSources} sources</span>
          <span className="inline sm:hidden">{badges.marketSources}</span>
        </span>
      ) : undefined,
    },
    {
      id: "competition",
      label: "Competition",
      icon: <BarChart3 className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.competitionDirect !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{badges.competitionDirect} direct</span>
          <span className="inline sm:hidden">{badges.competitionDirect}</span>
        </span>
      ) : undefined,
    },
    {
      id: "technical",
      label: "Technical",
      icon: <Cpu className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.technicalLabel ? (
        <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 whitespace-nowrap">
          {badges.technicalLabel}
        </span>
      ) : undefined,
    },
    {
      id: "research",
      label: "Research",
      icon: <BookOpen className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.researchPapers !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{badges.researchPapers} papers</span>
          <span className="inline sm:hidden">{badges.researchPapers}</span>
        </span>
      ) : undefined,
    },
    {
      id: "risks",
      label: "Risks & Recommendations",
      shortLabel: "Risks & Recs",
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.risksCount !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-400 shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">{badges.risksCount} risks</span>
          <span className="inline sm:hidden">{badges.risksCount}</span>
        </span>
      ) : undefined,
    },
    {
      id: "opportunity",
      label: "Opportunity",
      icon: <Compass className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "evidence",
      label: "Evidence",
      icon: <FileCheck2 className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.evidenceCount !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
          {badges.evidenceCount}
        </span>
      ) : undefined,
    },
    {
      id: "report",
      label: "Detailed Report",
      shortLabel: "Report",
      icon: <FileText className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "activity",
      label: "Agent Activity",
      shortLabel: "Activity",
      icon: <Activity className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "history",
      label: "Analysis History",
      shortLabel: "History",
      icon: <History className="w-3.5 h-3.5 shrink-0" />,
      badge: badges.historyCount !== undefined ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium leading-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
          <span className="hidden sm:inline">{badges.historyCount} runs</span>
          <span className="inline sm:hidden">{badges.historyCount}</span>
        </span>
      ) : undefined,
    },
    {
      id: "notes",
      label: "Notes",
      icon: <StickyNote className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  // Check scroll bounds
  const updateScrollBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  // Update scroll bounds on mount, resize, and scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollBounds();

    const handleScroll = () => updateScrollBounds();
    el.addEventListener("scroll", handleScroll, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateScrollBounds());
      ro.observe(el);
    }

    window.addEventListener("resize", updateScrollBounds);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [updateScrollBounds]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl && containerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      const timer = setTimeout(updateScrollBounds, 350);
      return () => clearTimeout(timer);
    }
  }, [activeTab, updateScrollBounds]);

  // Click scroll buttons
  const handleScrollClick = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.6, 220);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Horizontal mouse wheel support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const canScroll =
        (e.deltaY > 0 && scrollLeft < scrollWidth - clientWidth - 2) ||
        (e.deltaY < 0 && scrollLeft > 2);
      if (canScroll) {
        el.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  // Drag-to-scroll for mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    if (Math.abs(walk) > 8) {
      hasDragged.current = true;
    }
    el.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      hasDragged.current = false;
    }, 80);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (onTabChange) onTabChange(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
    if (basePath) {
      const nextHref = nextTab.id === "overview" ? basePath : `${basePath}/${nextTab.id}`;
      router.push(nextHref);
    }
  };

  return (
    <div className="relative w-full min-w-0 border-b border-border-default mt-2 group select-none">
      {/* 1. Left Gradient Mask & Scroll Button */}
      <div 
        className={`absolute left-0 top-0 bottom-0 z-20 flex items-center pr-6 pl-0.5 bg-gradient-to-r from-canvas-bg via-canvas-bg/95 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => handleScrollClick("left")}
          aria-label="Scroll tabs left"
          className="pointer-events-auto h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Scrollable Tab Strip */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Idea Workspace Navigation"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex items-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-0.5 w-full min-w-0 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const tabHref = basePath
            ? tab.id === "overview"
              ? basePath
              : `${basePath}/${tab.id}`
            : undefined;

          const tabContent = (
            <>
              {/* Optional Tab Icon */}
              <span className={`transition-colors ${isActive ? "text-primary" : "text-text-muted"}`}>
                {tab.icon}
              </span>

              {/* Responsive Tab Label */}
              <span>
                {tab.shortLabel ? (
                  <>
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">{tab.shortLabel}</span>
                  </>
                ) : (
                  tab.label
                )}
              </span>

              {/* Status dot for active market tab */}
              {isActive && tab.id === "market" && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}

              {/* Tab Badge */}
              {tab.badge}
            </>
          );

          const className = `pb-3 pt-2 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap border-b-2 outline-none shrink-0 relative ${
            isActive
              ? "text-primary border-primary font-semibold cursor-default"
              : "text-text-secondary hover:text-text-strong border-transparent hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
          }`;

          if (tabHref) {
            return (
              <Link
                key={tab.id}
                href={tabHref}
                prefetch={true}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                role="tab"
                id={`workspace-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`workspace-tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onClick={(e) => {
                  if (hasDragged.current) {
                    e.preventDefault();
                    return;
                  }
                  if (onTabChange) {
                    onTabChange(tab.id);
                  }
                }}
                className={className}
              >
                {tabContent}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              id={`workspace-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`workspace-tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => {
                if (hasDragged.current) return;
                if (onTabChange) onTabChange(tab.id);
              }}
              className={className}
            >
              {tabContent}
            </button>
          );
        })}
      </div>

      {/* 3. Right Gradient Mask & Scroll Button */}
      <div 
        className={`absolute right-0 top-0 bottom-0 z-20 flex items-center pl-6 pr-0.5 justify-end bg-gradient-to-l from-canvas-bg via-canvas-bg/95 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => handleScrollClick("right")}
          aria-label="Scroll tabs right"
          className="pointer-events-auto h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
