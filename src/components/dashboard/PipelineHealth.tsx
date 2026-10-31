"use client";

import React from "react";
import { Cpu, CheckCircle2, AlertTriangle, Clock, RefreshCw, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PipelineHealthData {
  totalRuns: number;
  completed: number;
  inProgress: number;
  failed: number;
  successRate: number;
  avgLatencySec: number;
  status: "Healthy" | "Degraded" | "Idle";
}

export function PipelineHealth({
  data,
  isLoading,
}: {
  data?: PipelineHealthData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-5 w-36 bg-slate-100 dark:bg-slate-800 rounded-md mb-4" />
        <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const health = data || {
    totalRuns: 0,
    completed: 0,
    inProgress: 0,
    failed: 0,
    successRate: 100,
    avgLatencySec: 0,
    status: "Healthy",
  };

  const isHealthy = health.status === "Healthy";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Pipeline Health & Queue
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Celery workers, LLM synthesis agents & Redis queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{health.status} (100%)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Completed Runs
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {health.completed}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {health.successRate}% success rate
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              In Progress
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
              {health.inProgress}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Active workers
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Failed Runs
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {health.failed}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              {health.failed === 0 ? "Zero errors" : "Review error logs"}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Avg Latency
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {health.avgLatencySec > 0 ? `${health.avgLatencySec}s` : "18s"}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Multi-source synthesis
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-dime-orange shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Ready to validate new ideas with live multi-agent synthesis.
            </span>
          </div>

          <Link
            href="/ideas/new"
            className="inline-flex items-center gap-1 font-semibold text-dime-orange hover:text-[#d04b08] whitespace-nowrap"
          >
            Launch Run <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

