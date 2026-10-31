"use client";

import React from "react";
import { ShieldAlert, ArrowRight, HelpCircle, CheckCircle } from "lucide-react";
import type { ResearchGapsData } from "@/types/market-analysis";

interface ResearchGapsProps {
  data?: ResearchGapsData;
}

export function ResearchGaps({ data }: ResearchGapsProps) {
  if (!data) return null;

  const { totalGaps, highPriorityCount, gaps } = data;

  return (
    <div id="sec-gaps" className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              Research Gaps & Identified Unknowns
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
              {highPriorityCount} High Priority
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Key empirical uncertainties and unverified assumptions requiring primary field validation.
          </p>
        </div>

        <span className="text-xs font-mono text-text-secondary self-start sm:self-auto">
          {totalGaps} items tracked
        </span>
      </div>

      {/* Gaps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-strong">
                  {gap.area}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    gap.priority === "High"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : gap.priority === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {gap.priority} Priority
                </span>
              </div>

              {/* Research Question */}
              <div className="flex items-start gap-2 mt-2 text-xs text-text-strong font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{gap.question}</span>
              </div>

              {/* Current Status */}
              <p className="text-[11px] text-text-secondary mt-2 pl-5">
                <span className="font-semibold text-slate-600">Current Status: </span>
                {gap.currentStatus}
              </p>
            </div>

            {/* Recommended Next Action */}
            <div className="pt-2.5 border-t border-slate-200/60 flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Next Action: </span>
                <span>{gap.recommendedNextStep}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

