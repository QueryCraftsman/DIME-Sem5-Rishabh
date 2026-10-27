"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

interface PipelineProps {
  stage: string;
  status: string;
  progress: number;
}

// These MUST match the actual backend stage names from workflow/nodes.py
const STAGES = [
  { id: "INITIALIZING", label: "System Initialization" },
  { id: "IDEA_UNDERSTANDING", label: "Idea Understanding" },
  { id: "QUERY_PLANNING", label: "Query Planning" },
  { id: "ACQUIRING", label: "Evidence Acquisition" },
  { id: "PROCESSING", label: "Normalization & Indexing" },
  { id: "PLANNING", label: "Research Planning" },
  { id: "RESEARCHING", label: "Market Research" },
  { id: "ANALYZING_COMPETITION", label: "Competition Analysis" },
  { id: "SYNTHESIZING", label: "Evidence Synthesis" },
  { id: "SCORING", label: "Scoring" },
  { id: "COMPLETED", label: "Final Report" },
];

export default function AnalysisPipeline({ stage, status, progress }: PipelineProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === stage);
  const isFailed = status === "FAILED" || status === "failed";
  const isCompleted = status === "COMPLETED" || status === "completed";

  return (
    <div className="p-5 sm:p-6 flex flex-col h-full bg-white dark:bg-[#201E1B] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F4F0E9]">Analysis Pipeline</h2>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#26231F] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#34302B]">
          {isCompleted
            ? "Complete"
            : isFailed
            ? "Interrupted"
            : `${Math.max(currentIndex + 1, 1)} / ${STAGES.length}`}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-[#9A9085] mb-5">
        {isCompleted
          ? "All autonomous evaluation stages finished"
          : isFailed
          ? "Pipeline encountered an issue"
          : "Sequential multi-agent intelligence progression"}
      </p>

      <div className="flex-1 relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200/80 dark:bg-[#34302B] z-0"></div>

        <ul className="relative z-10 space-y-4">
          {STAGES.map((s, idx) => {
            const stepCompleted = isCompleted || idx < currentIndex;
            const isCurrent = idx === currentIndex && !isCompleted && !isFailed;
            const stepFailed = isFailed && idx === currentIndex;

            let Icon = Circle;
            let iconColor = "text-slate-300 dark:text-slate-600";
            let textColor = "text-slate-400 dark:text-slate-500";
            let badgeBg = "bg-white dark:bg-[#201E1B]";

            if (stepCompleted) {
              Icon = CheckCircle2;
              iconColor = "text-emerald-600 dark:text-emerald-400";
              textColor = "text-slate-800 dark:text-[#F4F0E9] font-medium";
            } else if (stepFailed) {
              Icon = XCircle;
              iconColor = "text-rose-600 dark:text-rose-400";
              textColor = "text-rose-700 dark:text-rose-400 font-semibold";
            } else if (isCurrent) {
              Icon = Loader2;
              iconColor = "text-dime-orange animate-spin";
              textColor = "text-dime-orange dark:text-orange-400 font-semibold";
              badgeBg = "bg-orange-50/70 dark:bg-orange-950/30";
            }

            return (
              <li key={s.id} className="flex items-start gap-3">
                <div className={`mt-0.5 p-0.5 ${badgeBg} rounded-full z-10 transition-colors`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] tracking-tight ${textColor}`}>
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-mono font-bold text-dime-orange shrink-0">
                        {progress}%
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <div className="mt-1.5 h-1.5 w-full bg-stone-100 dark:bg-[#26231F] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div
                        className="h-full bg-dime-orange transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
