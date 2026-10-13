"use client";

import React from "react";
import { Zap, Beaker, Library } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalysisDepthState {
  depth: "QUICK" | "STANDARD" | "DEEP";
}

interface AnalysisDepthSelectorProps {
  data: AnalysisDepthState;
  onChange: (data: Partial<AnalysisDepthState>) => void;
}

export function AnalysisDepthSelector({ data, onChange }: AnalysisDepthSelectorProps) {
  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="w-5 h-5 rounded-md bg-orange-50 text-dime-orange flex items-center justify-center text-[12px] font-bold">4</span>
        <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Analysis Depth</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Review */}
        <div
          onClick={() => onChange({ depth: "QUICK" })}
          className={cn(
            "p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5",
            data.depth === "QUICK"
              ? "border-dime-orange bg-orange-50/50 dark:bg-dime-orange/10 shadow-sm ring-1 ring-dime-orange"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              data.depth === "QUICK" ? "bg-orange-100 text-dime-orange" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">~2 mins</span>
          </div>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Quick Review</h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">Basic market viability check and initial competitor scan.</p>
        </div>

        {/* Standard Analysis */}
        <div
          onClick={() => onChange({ depth: "STANDARD" })}
          className={cn(
            "p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 relative overflow-hidden",
            data.depth === "STANDARD"
              ? "border-dime-orange bg-orange-50/50 dark:bg-dime-orange/10 shadow-sm ring-1 ring-dime-orange"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          )}
        >
          {data.depth === "STANDARD" && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
          )}
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              data.depth === "STANDARD" ? "bg-orange-100 text-dime-orange" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              <Beaker className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-dime-orange bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50 px-2 py-0.5 rounded-full">Recommended</span>
          </div>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-1 relative z-10">Standard Analysis</h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 relative z-10">Full validation suite with detailed market synthesis and scoring.</p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>~5-8 mins execution</span>
          </div>
        </div>

        {/* Deep Research */}
        <div
          onClick={() => onChange({ depth: "DEEP" })}
          className={cn(
            "p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5",
            data.depth === "DEEP"
              ? "border-dime-orange bg-orange-50/50 dark:bg-dime-orange/10 shadow-sm ring-1 ring-dime-orange"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              data.depth === "DEEP" ? "bg-orange-100 text-dime-orange" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              <Library className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">~25 mins</span>
          </div>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Deep Research</h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">Exhaustive patent searches, SEC filing scans, and technical validation.</p>
        </div>
      </div>
    </div>
  );
}
