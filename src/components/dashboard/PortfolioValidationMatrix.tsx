"use client";

import React, { useState } from "react";
import { Compass, Sparkles, ArrowUpRight, TrendingUp, Layers, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MatrixIdeaPoint {
  id: string;
  analysisId?: string | null;
  title: string;
  industry: string;
  feasibility: number;
  attractiveness: number;
  novelty: number;
  marketPain: number;
  quadrant: string;
  status: string;
  evidenceCount: number;
}

export function PortfolioValidationMatrix({
  data,
  isLoading,
}: {
  data?: MatrixIdeaPoint[];
  isLoading: boolean;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<MatrixIdeaPoint | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-52 bg-slate-100 dark:bg-slate-800 rounded-md mb-4" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const points = data || [];

  // Compute portfolio averages
  const avgFeasibility = points.length > 0
    ? Math.round(points.reduce((acc, p) => acc + p.feasibility, 0) / points.length)
    : 0;

  const avgAttractiveness = points.length > 0
    ? Math.round(points.reduce((acc, p) => acc + p.attractiveness, 0) / points.length)
    : 0;

  const highViabilityCount = points.filter((p) => p.feasibility >= 55 && p.attractiveness >= 50).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-dime-orange flex items-center justify-center ring-1 ring-orange-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Portfolio Viability Matrix
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Technical Feasibility vs. Market Attractiveness across all portfolio concepts
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>High Viability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
            <span>Moonshot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span>Incremental</span>
          </div>
        </div>
      </div>

      {/* Main Matrix Graphic Canvas */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="relative w-full h-[270px] bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 p-4 select-none overflow-hidden">
          {/* Quadrant Background Labels */}
          <div className="absolute top-2.5 left-3 text-[10px] font-bold uppercase tracking-wider text-purple-600/70 dark:text-purple-400/60 pointer-events-none">
            Moonshot (High R&D)
          </div>
          <div className="absolute top-2.5 right-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/70 text-right pointer-events-none">
            Scale Priority (Strong Moat)
          </div>
          <div className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pointer-events-none">
            Discovery / Re-evaluate
          </div>
          <div className="absolute bottom-2.5 right-3 text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/60 text-right pointer-events-none">
            Quick Win / Incremental
          </div>

          {/* Crosshair Dividers (50% thresholds) */}
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-slate-300/80 dark:border-slate-700/80 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-slate-300/80 dark:border-slate-700/80 pointer-events-none" />

          {/* Points Container */}
          <div className="relative w-full h-full">
            {points.map((p) => {
              // Convert (feasibility, attractiveness) 0..100 to CSS percentages with padding safety
              const leftPercent = 8 + (p.feasibility / 100) * 84;
              const bottomPercent = 8 + (p.attractiveness / 100) * 84;

              const isHigh = p.feasibility >= 55 && p.attractiveness >= 50;
              const isMoonshot = p.feasibility < 55 && p.attractiveness >= 50;
              const isHovered = hoveredPoint?.id === p.id;

              const pointColor = isHigh ? "bg-emerald-500" : isMoonshot ? "bg-purple-500" : "bg-amber-500";

              return (
                <div
                  key={p.id}
                  style={{
                    left: `${leftPercent}%`,
                    bottom: `${bottomPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="absolute -translate-x-1/2 translate-y-1/2 cursor-pointer z-10 transition-transform duration-150 hover:scale-150"
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={cn(
                        "w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm transition-all",
                        pointColor,
                        isHovered && "ring-4 ring-orange-500/40 animate-pulse scale-125"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 z-20 max-w-[280px] p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">
                <span>{hoveredPoint.industry}</span>
                <span>•</span>
                <span>{hoveredPoint.quadrant}</span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 truncate" title={hoveredPoint.title}>
                {hoveredPoint.title}
              </h4>

              <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400">Feasibility:</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-1.5">
                    {hoveredPoint.feasibility}/100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Attractiveness:</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-1.5">
                    {hoveredPoint.attractiveness}/100
                  </span>
                </div>
              </div>

              {hoveredPoint.analysisId ? (
                <Link
                  href={`/ideas/${hoveredPoint.id}/analysis/${hoveredPoint.analysisId}`}
                  className="inline-flex items-center gap-1 font-semibold text-dime-orange hover:text-[#d04b08] text-[11px]"
                >
                  <span>Open Analysis Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Validation pending</span>
              )}
            </div>
          )}
        </div>

        {/* Matrix Benchmark Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Mean Feasibility:</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{avgFeasibility}/100</span>
            </div>

            <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Mean Attractiveness:</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{avgAttractiveness}/100</span>
            </div>

            <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">High-Moat Scale Ideas:</span>{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{highViabilityCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Hover any point to inspect validation coordinates
          </div>
        </div>
      </div>
    </div>
  );
}

