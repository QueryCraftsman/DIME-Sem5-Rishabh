"use client";

import React, { useState } from "react";
import { BarChart3, Layers, BookMarked, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PortfolioIntelligenceData {
  industryDistribution?: { name: string; count: number; percentage: number }[];
  researchCoverage?: {
    ideaId: string;
    title: string;
    evidenceCount: number;
    sourcesUsed: number;
    validationScore: number;
    status: string;
  }[];
  sourceDistribution?: { type: string; count: number; percentage: number }[];
}

export function PortfolioMarketIntelligence({
  data,
  isLoading,
}: {
  data?: PortfolioIntelligenceData;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"coverage" | "industries" | "sources">("coverage");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded-md mb-4" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const coverage = data?.researchCoverage || [];
  const industries = data?.industryDistribution || [];
  const sources = data?.sourceDistribution || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header with Switcher Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-dime-orange flex items-center justify-center ring-1 ring-orange-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Portfolio Market Intelligence
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cross-idea research coverage, industry concentration, and evidence depth
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab("coverage")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all",
              activeTab === "coverage"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Research Depth
          </button>
          <button
            onClick={() => setActiveTab("industries")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all",
              activeTab === "industries"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Industries
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all",
              activeTab === "sources"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Source Types
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {activeTab === "coverage" && (
          <div>
            {coverage.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No analyses completed yet to compare research depth.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="col-span-5 sm:col-span-6">Validated Idea</span>
                  <span className="col-span-3 sm:col-span-2 text-right">Evidence Citations</span>
                  <span className="col-span-2 text-right hidden sm:block">Sources Used</span>
                  <span className="col-span-4 sm:col-span-2 text-right">Validation Score</span>
                </div>

                {coverage.map((item, idx) => (
                  <div
                    key={item.ideaId}
                    className="group grid grid-cols-12 items-center p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80 text-xs transition-colors"
                  >
                    <div className="col-span-5 sm:col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <Link
                        href={`/ideas/${item.ideaId}`}
                        className="font-semibold text-slate-900 dark:text-white truncate hover:text-dime-orange group-hover:underline"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-semibold text-purple-600 dark:text-purple-400">
                      {item.evidenceCount} citations
                    </div>

                    <div className="col-span-2 text-right text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
                      {item.sourcesUsed} sources
                    </div>

                    <div className="col-span-4 sm:col-span-2 text-right flex items-center justify-end gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.validationScore > 0 ? `${item.validationScore} / 100` : "—"}
                      </span>
                      {item.validationScore >= 75 ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="High Potential" />
                      ) : item.validationScore >= 50 ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Promising" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-sky-500" title="Validation Phase" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "industries" && (
          <div className="space-y-3">
            {industries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No ideas categorized into industries yet.
              </div>
            ) : (
              industries.map((ind) => (
                <div key={ind.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ind.name}</span>
                    <span className="font-medium text-slate-500">
                      {ind.count} {ind.count === 1 ? "idea" : "ideas"} ({ind.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, ind.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "sources" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sources.map((src) => (
              <div
                key={src.type}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-2"
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {src.type}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {src.count}
                  </span>
                  <span className="text-xs font-semibold text-dime-orange">
                    {src.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

