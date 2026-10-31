"use client";

import React from "react";
import { TrendingUp, Activity, FileText, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MarketSignalItem {
  id: string;
  analysisId: string;
  ideaId: string;
  ideaTitle: string;
  industry: string;
  title: string;
  description: string;
  trend: "Rising Demand" | "Emerging Trend" | "Stable Signal";
  trendColor: string;
  confidence: number;
  evidenceCount: number;
  sourceCount: number;
  latestObservation: string;
  viewUrl: string;
}

export function MarketSignals({
  signals,
  isLoading,
}: {
  signals?: MarketSignalItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs h-full flex flex-col p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-36 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const activeSignals = signals || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-dime-orange flex items-center justify-center ring-1 ring-orange-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Market Signals
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Extracted from verified research citations
            </p>
          </div>
        </div>

        {activeSignals.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Citations
          </span>
        )}
      </div>

      {/* Signals List */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[520px]">
        {activeSignals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-dime-orange" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No market signals yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
              Complete a validation run on any idea to discover customer demand momentum and market pain points.
            </p>
            <Link
              href="/ideas/new"
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dime-orange bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 rounded-lg transition-colors"
            >
              Start Analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          activeSignals.map((signal) => {
            const isRising = signal.trend === "Rising Demand";
            const isEmerging = signal.trend === "Emerging Trend";

            return (
              <div
                key={signal.id}
                className="group relative p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-sm transition-all duration-200 flex flex-col gap-2.5"
              >
                {/* Top: Category & Trend Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate max-w-[140px]">
                        {signal.industry}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title={signal.ideaTitle}>
                        {signal.ideaTitle}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-dime-orange transition-colors">
                      {signal.title}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shrink-0 border",
                      isRising && "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
                      isEmerging && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50",
                      !isRising && !isEmerging && "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50"
                    )}
                  >
                    {signal.trend}
                  </span>
                </div>

                {/* Quantitative Footprint */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-dime-orange" />
                      <span>{signal.confidence}%</span>
                      <span className="text-[10px] font-normal text-slate-400">conf.</span>
                    </div>

                    <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />

                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{signal.evidenceCount} citations</span>
                      <span className="text-[10px] text-slate-400">({signal.sourceCount} sources)</span>
                    </div>
                  </div>

                  {signal.analysisId ? (
                    <Link
                      href={signal.viewUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-dime-orange hover:text-[#d04b08] dark:hover:text-orange-400 transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
