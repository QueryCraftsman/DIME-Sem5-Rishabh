"use client";

import React from "react";
import { Lightbulb, CheckCircle2, Database, BookOpen, Clock, Activity, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiStats {
  totalIdeas: number;
  completedAnalyses: number;
  inProgressAnalyses?: number;
  failedAnalyses?: number;
  evidenceItems: number;
  researchSourcesUsed?: number;
  globalIndexedSources?: number;
  indexedSources?: number;
  avgValidationScore?: number;
  ideasAwaitingValidation?: number;
}

export function KpiCards({ stats, isLoading }: { stats?: KpiStats; isLoading: boolean }) {
  const sourcesCount = stats?.researchSourcesUsed ?? stats?.indexedSources ?? 0;
  const inProgressCount = stats?.inProgressAnalyses ?? 0;
  const avgScore = stats?.avgValidationScore ?? 0;
  const awaitingCount = stats?.ideasAwaitingValidation ?? Math.max(0, (stats?.totalIdeas ?? 0) - (stats?.completedAnalyses ?? 0));

  const primaryCards = [
    {
      title: "Total Ideas",
      subtitle: "Portfolio concepts",
      value: stats?.totalIdeas || 0,
      icon: Lightbulb,
      color: "text-dime-orange",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "hover:border-orange-200 dark:hover:border-orange-800/40",
    },
    {
      title: "Completed Analyses",
      subtitle: "Full research runs",
      value: stats?.completedAnalyses || 0,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "hover:border-emerald-200 dark:hover:border-emerald-800/40",
    },
    {
      title: "Active In Pipeline",
      subtitle: inProgressCount > 0 ? "Queued or processing" : "All jobs settled",
      value: inProgressCount,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "hover:border-blue-200 dark:hover:border-blue-800/40",
    },
    {
      title: "Verified Evidence",
      subtitle: "Citations extracted",
      value: stats?.evidenceItems || 0,
      icon: Database,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "hover:border-purple-200 dark:hover:border-purple-800/40",
    },
  ];

  return (
    <div className="space-y-3">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryCards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all duration-200",
              card.border
            )}
          >
            <div>
              {isLoading ? (
                <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md mb-1" />
              ) : (
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight">
                  {card.value.toLocaleString()}
                </div>
              )}
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {card.title}
              </div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {card.subtitle}
              </div>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", card.bg)}>
              <card.icon className={cn("w-6 h-6", card.color)} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Intelligence Strip */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <span className="font-medium">Research Sources Used:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : sourcesCount.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Award className="w-4 h-4 text-dime-orange" />
            <span className="font-medium">Avg Portfolio Score:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : avgScore > 0 ? `${avgScore} / 100` : "Pending Analysis"}
            </span>
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">Awaiting Full Run:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : awaitingCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Real-time research pipeline active</span>
        </div>
      </div>
    </div>
  );
}
