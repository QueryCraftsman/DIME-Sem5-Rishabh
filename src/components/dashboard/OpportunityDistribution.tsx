"use client";

import React, { useState } from "react";
import { Target, Sparkles, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OpportunityMixItem {
  name: string;
  value: number;
  color?: string;
}

interface TierTheme {
  name: string;
  displayLabel: string;
  accent: string;
  gradientClass: string;
  lightBg: string;
  lightBgHover: string;
  borderClass: string;
  borderHoverClass: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
  description: string;
}

const TIER_THEMES: Record<string, TierTheme> = {
  "High Potential": {
    name: "High Potential",
    displayLabel: "High",
    accent: "#10b981", // Luminous Emerald
    gradientClass: "from-emerald-400 via-teal-400 to-emerald-500",
    lightBg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    lightBgHover: "bg-emerald-100/70 dark:bg-emerald-950/40",
    borderClass: "border-emerald-200/80 dark:border-emerald-800/40",
    borderHoverClass: "border-emerald-400 dark:border-emerald-500 ring-1 ring-emerald-400/30",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    glowColor: "rgba(16, 185, 129, 0.4)",
    description: "High viability, ready for execution",
  },
  "Promising": {
    name: "Promising",
    displayLabel: "Promising",
    accent: "#f59e0b", // Warm Sunlit Amber
    gradientClass: "from-amber-300 via-amber-400 to-amber-500",
    lightBg: "bg-amber-50/70 dark:bg-amber-950/20",
    lightBgHover: "bg-amber-100/70 dark:bg-amber-950/40",
    borderClass: "border-amber-200/80 dark:border-amber-800/40",
    borderHoverClass: "border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/30",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    badgeText: "text-amber-800 dark:text-amber-300",
    glowColor: "rgba(245, 158, 11, 0.4)",
    description: "Solid traction signals, needs tuning",
  },
  "Needs Validation": {
    name: "Needs Validation",
    displayLabel: "Validation",
    accent: "#38bdf8", // Luminous Sky Blue
    gradientClass: "from-sky-300 via-sky-400 to-blue-400",
    lightBg: "bg-sky-50/70 dark:bg-sky-950/20",
    lightBgHover: "bg-sky-100/70 dark:bg-sky-950/40",
    borderClass: "border-sky-200/80 dark:border-sky-800/40",
    borderHoverClass: "border-sky-400 dark:border-sky-500 ring-1 ring-sky-400/30",
    badgeBg: "bg-sky-100 dark:bg-sky-900/50",
    badgeText: "text-sky-800 dark:text-sky-300",
    glowColor: "rgba(56, 189, 248, 0.4)",
    description: "Discovery phase, gathering evidence",
  },
};

const getTheme = (name: string): TierTheme => {
  if (name.toLowerCase().includes("high")) return TIER_THEMES["High Potential"];
  if (name.toLowerCase().includes("promis")) return TIER_THEMES["Promising"];
  return TIER_THEMES["Needs Validation"];
};

export function OpportunityDistribution({ mix, isLoading }: { mix?: OpportunityMixItem[]; isLoading: boolean }) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#201E1B] border border-slate-200/80 dark:border-[#34302B] rounded-2xl shadow-xs h-full flex flex-col p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-44 bg-slate-100 dark:bg-stone-800 rounded-md" />
          <div className="h-5 w-20 bg-slate-100 dark:bg-stone-800 rounded-full" />
        </div>
        <div className="h-6 w-full bg-slate-100 dark:bg-stone-800 rounded-full mb-6" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-slate-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-20 bg-slate-100 dark:bg-stone-800 rounded-xl" />
          <div className="h-20 bg-slate-100 dark:bg-stone-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const total = mix?.reduce((acc, curr) => acc + curr.value, 0) || 0;

  // Active hovered theme or default
  const activeHoveredItem = mix?.find((m) => m.name === hoveredTier);
  const activeHoveredTheme = hoveredTier ? getTheme(hoveredTier) : null;
  const activePercentage =
    activeHoveredItem && total > 0 ? Math.round((activeHoveredItem.value / total) * 100) : null;

  return (
    <div className="bg-white dark:bg-[#201E1B] border border-slate-200/80 dark:border-[#34302B] rounded-2xl shadow-xs h-full flex flex-col transition-colors overflow-hidden">
      {/* Header (Single line, perfectly balanced) */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2E2A25] flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F4F0E9] flex items-center gap-2.5 whitespace-nowrap min-w-0">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-dime-orange flex items-center justify-center ring-1 ring-orange-500/20 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <span className="truncate">Opportunity Distribution</span>
        </h2>
        
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-stone-800/80 border border-slate-200/60 dark:border-stone-700/60 text-[11px] font-medium text-slate-600 dark:text-stone-300 shrink-0">
          <Sparkles className="w-3 h-3 text-dime-orange shrink-0" />
          <span>{total} Ideas</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {total === 0 ? (
          <div className="flex flex-col items-center text-center text-slate-500 py-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-stone-800/80 flex items-center justify-center mb-3">
              <Compass className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No ideas scored yet</p>
            <p className="text-xs text-slate-400 mt-1">Run validation analyses to calculate portfolio distribution.</p>
          </div>
        ) : (
          <>
            {/* Interactive Tooltip / Status Prompt Banner */}
            <div className="h-6 mb-2 flex items-center justify-between text-xs px-0.5">
              {hoveredTier && activeHoveredTheme ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 truncate">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{ backgroundColor: activeHoveredTheme.accent }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeHoveredTheme.name}:
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {activeHoveredItem?.value} {activeHoveredItem?.value === 1 ? "idea" : "ideas"} ({activePercentage}%)
                  </span>
                  <span className="text-slate-400 hidden xl:inline">
                    — {activeHoveredTheme.description}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">
                  Hover over any tier or segment for interactive details
                </span>
              )}
            </div>

            {/* Interactive Progress Bar */}
            <div className="relative flex h-5 w-full rounded-full p-0.5 bg-slate-100/90 dark:bg-stone-900/90 border border-slate-200/80 dark:border-stone-800/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] gap-1 mb-5">
              {mix?.map((item) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                if (percentage === 0) return null;
                const theme = getTheme(item.name);
                const isHovered = hoveredTier === item.name;
                const isOtherHovered = hoveredTier !== null && !isHovered;

                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredTier(item.name)}
                    onMouseLeave={() => setHoveredTier(null)}
                    style={{ width: `${percentage}%` }}
                    className={cn(
                      "relative h-full rounded-full bg-gradient-to-r transition-all duration-300 cursor-pointer",
                      theme.gradientClass,
                      isHovered
                        ? "scale-y-125 shadow-md ring-2 ring-white/80 dark:ring-stone-900/90 z-10"
                        : isOtherHovered
                        ? "opacity-35 scale-95"
                        : "opacity-100 hover:brightness-105"
                    )}
                    title={`${item.name}: ${item.value} (${Math.round(percentage)}%)`}
                  >
                    {/* Top gloss highlight */}
                    <div className="absolute inset-x-1 top-0 h-1/2 rounded-t-full bg-white/30 pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {/* Interactive Tier Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {mix?.map((item) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const theme = getTheme(item.name);
                const isHovered = hoveredTier === item.name;
                const isOtherHovered = hoveredTier !== null && !isHovered;

                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredTier(item.name)}
                    onMouseLeave={() => setHoveredTier(null)}
                    className={cn(
                      "relative flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 cursor-pointer select-none",
                      theme.lightBg,
                      theme.borderClass,
                      isHovered
                        ? cn(theme.lightBgHover, theme.borderHoverClass, "scale-[1.03] shadow-md -translate-y-0.5 z-10")
                        : isOtherHovered
                        ? "opacity-45 grayscale-[20%]"
                        : "hover:border-slate-300 dark:hover:border-stone-700 hover:shadow-xs"
                    )}
                  >
                    {/* Top Row: Dot + Label */}
                    <div className="flex items-center gap-1.5 mb-2 min-w-0">
                      <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.accent }}
                        />
                        {isHovered && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{ backgroundColor: theme.accent }}
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {theme.displayLabel}
                      </span>
                    </div>

                    {/* Bottom Row: Number count + Percentage Badge */}
                    <div className="flex items-baseline justify-between gap-1 mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                          {item.value}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {item.value === 1 ? "idea" : "ideas"}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-colors",
                          theme.badgeBg,
                          theme.badgeText
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
