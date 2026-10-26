"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AnalysisTabsData } from "@/types/market-analysis";

interface AnalysisTabsProps {
  tabs: AnalysisTabsData;
  ideaId: string;
}

export function AnalysisTabs({ tabs, ideaId }: AnalysisTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <div className="relative border-b border-border-default mb-8 group select-none">
      {/* Left button */}
      <div 
        className={`absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-canvas-bg via-canvas-bg/90 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="pointer-events-auto w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-primary transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        <Link
          className="pb-3 text-sm font-medium text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent whitespace-nowrap"
          href={tabs.overviewHref || `/ideas/${ideaId}`}
        >
          Overview
        </Link>
        <div className="pb-3 text-sm font-semibold text-primary border-b-2 border-primary flex items-center gap-2 whitespace-nowrap cursor-default">
          <span>Market</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <Link
          className="pb-3 text-sm font-medium text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/competition?ideaId=${ideaId}`}
        >
          <span>Competition</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-canvas-bg border border-border-default text-text-muted">
            {tabs.competitionCount}
          </span>
        </Link>
        <Link
          className="pb-3 text-sm font-medium text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/ideas/${ideaId}#technical`}
        >
          <span>Technical</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {tabs.technicalLabel}
          </span>
        </Link>
        <Link
          className="pb-3 text-sm font-medium text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/research?ideaId=${ideaId}`}
        >
          <span>Research</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-canvas-bg border border-border-default text-text-muted">
            {tabs.researchCount}
          </span>
        </Link>
        <Link
          className="pb-3 text-sm font-medium text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/ideas/${ideaId}#risks`}
        >
          <span>Risks &amp; Recommendations</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-400">
            {tabs.risksCount} risks
          </span>
        </Link>
      </div>

      {/* Right button */}
      <div 
        className={`absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 justify-end bg-gradient-to-l from-canvas-bg via-canvas-bg/90 to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="pointer-events-auto w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-primary transition-all cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
