"use client";

import React, { useState } from "react";
import { Sliders, ShieldCheck, TrendingUp, ArrowUpRight, BarChart2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BenchmarkIdeaItem {
  id: string;
  analysisId: string;
  title: string;
  industry: string;
  feasibility: number;
  marketPain: number;
  novelty: number;
  moat: number;
  opportunity: number;
  risk: number;
}

export function PortfolioValidationBenchmark({
  data,
  isLoading,
}: {
  data?: BenchmarkIdeaItem[];
  isLoading: boolean;
}) {
  const [activeMetric, setActiveMetric] = useState<"pillars" | "risk">("pillars");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-56 bg-slate-100 dark:bg-slate-800 rounded-md mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = data || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-dime-orange flex items-center justify-center ring-1 ring-orange-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Validation Strategic Pillar Breakdown
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Comparative analysis across Feasibility, Market Pain, Novelty & Moat
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveMetric("pillars")}
            className={cn(
              "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
              activeMetric === "pillars"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Core Pillars
          </button>
          <button
            onClick={() => setActiveMetric("risk")}
            className={cn(
              "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
              activeMetric === "risk"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Risk vs Opportunity
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Complete validation runs to view comparative pillar benchmarks.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-2.5"
            >
              {/* Row Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                      {item.industry}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-dime-orange transition-colors">
                    {item.title}
                  </h3>
                </div>

                {item.analysisId ? (
                  <Link
                    href={`/ideas/${item.id}/analysis/${item.analysisId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-dime-orange hover:text-[#d04b08] whitespace-nowrap pt-0.5"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                ) : null}
              </div>

              {/* Metric View 1: 4 Core Pillars */}
              {activeMetric === "pillars" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  {/* Feasibility */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Feasibility</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.feasibility}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.feasibility}%` }}
                      />
                    </div>
                  </div>

                  {/* Market Pain */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Market Pain</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.marketPain}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${item.marketPain}%` }}
                      />
                    </div>
                  </div>

                  {/* Novelty */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Novelty</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.novelty}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, item.novelty * 2.5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Moat Density */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Moat Density</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.moat}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${item.moat}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Metric View 2: Risk vs Opportunity */}
              {activeMetric === "risk" && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Opportunity Score</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.opportunity}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, item.opportunity * 2.5)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Risk Index</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{item.risk}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                        style={{ width: `${item.risk}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Legend Footer */}
      <div className="p-3 bg-slate-50/60 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Feasibility</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Market Pain</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Novelty</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Moat (Low Sat.)</span>
          </span>
        </div>

        <span className="hidden sm:inline text-slate-400">
          Ranked by latest completed run
        </span>
      </div>
    </div>
  );
}

