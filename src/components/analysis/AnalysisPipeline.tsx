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
    <div className="p-6 flex flex-col h-full bg-white">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Analysis Pipeline</h2>
      <p className="text-xs text-slate-400 mb-6">
        {isCompleted
          ? "Analysis complete"
          : isFailed
          ? "Analysis encountered an error"
          : `Stage ${Math.max(currentIndex + 1, 1)} of ${STAGES.length}`}
      </p>

      <div className="flex-1 relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

        <ul className="relative z-10 space-y-6">
          {STAGES.map((s, idx) => {
            const stepCompleted = isCompleted || idx < currentIndex;
            const isCurrent = idx === currentIndex && !isCompleted && !isFailed;
            const stepFailed = isFailed && idx === currentIndex;

            let Icon = Circle;
            let iconColor = "text-slate-300";
            let textColor = "text-slate-500";

            if (stepCompleted) {
              Icon = CheckCircle2;
              iconColor = "text-green-500";
              textColor = "text-slate-900";
            } else if (stepFailed) {
              Icon = XCircle;
              iconColor = "text-red-500";
              textColor = "text-red-700 font-medium";
            } else if (isCurrent) {
              Icon = Loader2;
              iconColor = "text-purple-500 animate-spin";
              textColor = "text-purple-700 font-medium";
            }

            return (
              <li key={s.id} className="flex items-start gap-4">
                <div className="mt-0.5 bg-white rounded-full">
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
                <div className="flex-1">
                  <span className={`text-[15px] tracking-tight ${textColor}`}>
                    {s.label}
                  </span>
                  {isCurrent && (
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
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
