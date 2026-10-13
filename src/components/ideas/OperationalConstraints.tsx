"use client";

import React from "react";

export interface OperationalConstraintsState {
  budget: string;
  teamSize: string;
  timeline: string;
  preferredTechnologies: string;
}

interface OperationalConstraintsProps {
  data: OperationalConstraintsState;
  onChange: (data: Partial<OperationalConstraintsState>) => void;
}

export function OperationalConstraints({ data, onChange }: OperationalConstraintsProps) {
  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-orange-50 text-dime-orange flex items-center justify-center text-[12px] font-bold">3</span>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Operational Constraints</h2>
        </div>
        <span className="text-[11px] text-slate-500">Optional calibration benchmarks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Budget */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">Target Budget</label>
          <input
            type="text"
            value={data.budget}
            onChange={(e) => onChange({ budget: e.target.value })}
            placeholder="e.g. $15k - $50k"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:border-dime-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Initial Team Size */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">Initial Team Size</label>
          <input
            type="text"
            value={data.teamSize}
            onChange={(e) => onChange({ teamSize: e.target.value })}
            placeholder="e.g. 2 engineers, 1 designer"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:border-dime-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Timeline to MVP */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">Timeline to MVP</label>
          <input
            type="text"
            value={data.timeline}
            onChange={(e) => onChange({ timeline: e.target.value })}
            placeholder="e.g. 3 months"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:border-dime-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Preferred Technologies */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">Preferred Technologies</label>
          <input
            type="text"
            value={data.preferredTechnologies}
            onChange={(e) => onChange({ preferredTechnologies: e.target.value })}
            placeholder="e.g. Next.js, Python, OpenAI, Pinecone"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:border-dime-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
