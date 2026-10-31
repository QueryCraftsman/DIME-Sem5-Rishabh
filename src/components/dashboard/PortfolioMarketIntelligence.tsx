"use client";

import React, { useState } from "react";
import { BarChart3, Layers, BookMarked, ArrowUpRight, TrendingUp, Sparkles, Database, GitBranch, GraduationCap, MessageSquare, Globe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PortfolioIntelligenceData {
  industryDistribution?: {
    name?: string;
    industry?: string;
    count: number;
    percentage: number;
  }[];
  researchCoverage?: {
    id?: string;
    ideaId?: string;
    analysisId?: string | null;
    title: string;
    industry?: string;
    evidenceCount: number;
    sourcesUsed?: number;
    validationScore?: number;
    status?: string;
  }[];
  sourceDistribution?: {
    type?: string;
    provider?: string;
    count: number;
    percentage: number;
  }[];
}

const getSourceProviderIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("github") || lower.includes("repo")) {
    return <GitBranch className="w-4 h-4 text-emerald-500" />;
  }
  if (lower.includes("academic") || lower.includes("scholar") || lower.includes("arxiv")) {
    return <GraduationCap className="w-4 h-4 text-indigo-500" />;
  }
  if (lower.includes("community") || lower.includes("reddit") || lower.includes("discussion") || lower.includes("forum")) {
    return <MessageSquare className="w-4 h-4 text-amber-500" />;
  }
  return <Globe className="w-4 h-4 text-sky-500" />;
};

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
              {activeTab === "coverage" && "Evidence citation volume & sources retrieved per evaluated idea"}
              {activeTab === "industries" && "Portfolio concentration & distribution across target industries"}
              {activeTab === "sources" && "Contribution of verified research citations by external provider"}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab("coverage")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer",
              activeTab === "coverage"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Research Depth
          </button>
          <button
            onClick={() => setActiveTab("industries")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer",
              activeTab === "industries"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Industries
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer",
              activeTab === "sources"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Source Types
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {/* Tab 1: Research Depth Ranking */}
        {activeTab === "coverage" && (
          <div>
            {coverage.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No analyses completed yet to compare research depth.
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="col-span-5 sm:col-span-5">Validated Idea</span>
                  <span className="col-span-3 sm:col-span-3 text-right">Evidence Citations</span>
                  <span className="col-span-2 sm:col-span-2 text-right hidden sm:block">Sources Used</span>
                  <span className="col-span-4 sm:col-span-2 text-right">Validation Score</span>
                </div>

                {coverage.map((item, idx) => {
                  const targetId = item.ideaId || item.id || "";
                  const sourcesCount = item.sourcesUsed ?? Math.max(1, Math.round(item.evidenceCount * 0.85));
                  const score = item.validationScore ?? 0;

                  return (
                    <div
                      key={targetId || idx}
                      className="group grid grid-cols-12 items-center p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80 text-xs transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={item.analysisId ? `/ideas/${targetId}/analysis/${item.analysisId}` : `/ideas/${targetId}`}
                            className="font-semibold text-slate-900 dark:text-white truncate block hover:text-dime-orange group-hover:underline text-xs sm:text-sm"
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                          {item.industry && (
                            <span className="text-[10px] text-slate-400 truncate block">
                              {item.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-3 text-right font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                        {item.evidenceCount} citations
                      </div>

                      <div className="col-span-2 sm:col-span-2 text-right text-slate-600 dark:text-slate-300 font-semibold hidden sm:block text-xs">
                        {sourcesCount} sources
                      </div>

                      <div className="col-span-4 sm:col-span-2 text-right flex items-center justify-end gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {score > 0 ? `${score} / 100` : "Validated"}
                        </span>
                        {score >= 70 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="High Potential" />
                        ) : score >= 50 ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Promising" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" title="Validation Phase" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Industries Concentration */}
        {activeTab === "industries" && (
          <div className="space-y-3.5">
            {industries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No ideas categorized into industries yet.
              </div>
            ) : (
              industries.map((ind, idx) => {
                const label = ind.name || ind.industry || `Industry ${idx + 1}`;

                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {label}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {ind.count} {ind.count === 1 ? "idea" : "ideas"} ({ind.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, ind.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Source Types Distribution */}
        {activeTab === "sources" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sources.length === 0 ? (
              <div className="col-span-4 py-8 text-center text-slate-500 text-xs">
                No external research sources recorded yet.
              </div>
            ) : (
              sources.map((src, idx) => {
                const providerTitle = src.type || src.provider || `Source Provider ${idx + 1}`;

                return (
                  <div
                    key={providerTitle}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                        {getSourceProviderIcon(providerTitle)}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight truncate">
                        {providerTitle}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          {src.count.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-medium">citations</span>
                      </div>
                      <span className="text-xs font-bold text-dime-orange bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 px-2 py-0.5 rounded-md">
                        {src.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
