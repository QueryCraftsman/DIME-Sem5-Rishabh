import React from "react";
import { MultiModeIdeaValidation } from "@/components/ideas/MultiModeIdeaValidation";

export default function ValidateIdeaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Page Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-[28px] md:text-[32px] font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight">
            Validate a New Idea
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Describe your idea, complete a guided form, or develop your concept with AI. DIME will analyze the market, competition, and business opportunities.
          </p>
        </div>

        {/* Multi-Mode Idea Validation System */}
        <MultiModeIdeaValidation />
      </div>
    </div>
  );
}
