"use client";

import React from "react";
import { GraduationCap, GitBranch, BookOpen, Globe, CheckCircle2, ShieldCheck, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchSourceHealthItem {
  id?: string;
  name?: string;
  provider?: string;
  type?: string;
  category?: string;
  status?: string;
  count?: number;
  uniqueSources?: number;
  acceptedEvidence?: number;
  evidenceAccepted?: number;
  latency?: string;
  icon?: string;
}

const getSourceIcon = (item: ResearchSourceHealthItem) => {
  const key = `${item.id || ""} ${item.name || ""} ${item.provider || ""}`.toLowerCase();
  if (key.includes("semantic")) {
    return <GraduationCap className="w-5 h-5 text-indigo-500" />;
  }
  if (key.includes("github")) {
    return <GitBranch className="w-5 h-5 text-emerald-500" />;
  }
  if (key.includes("arxiv") || key.includes("crossref") || key.includes("paper")) {
    return <BookOpen className="w-5 h-5 text-amber-500" />;
  }
  return <Globe className="w-5 h-5 text-sky-500" />;
};

export function ResearchSourceIntelligence({
  sources,
  isLoading,
}: {
  sources?: ResearchSourceHealthItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-5 w-44 bg-slate-100 dark:bg-slate-800 rounded-md mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = sources || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Research Source Intelligence
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Provider connectivity & verified evidence extraction
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Multi-Provider Active
        </span>
      </div>

      {/* Grid */}
      <div className="p-4 sm:p-5 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((src, idx) => {
          const providerName = src.name || src.provider || `Provider ${idx + 1}`;
          const providerType = src.type || src.category || "Research Source";
          const sourcesCount = src.count ?? src.uniqueSources ?? 0;
          const evidenceCount = src.acceptedEvidence ?? src.evidenceAccepted ?? 0;
          const statusText = src.status || "Active & Connected";

          return (
            <div
              key={src.id || providerName}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 shadow-2xs">
                    {getSourceIcon(src)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {providerName}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {providerType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{statusText}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {sourcesCount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                    sources indexed
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                  <Database className="w-3.5 h-3.5" />
                  <span>{evidenceCount.toLocaleString()} citations</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
