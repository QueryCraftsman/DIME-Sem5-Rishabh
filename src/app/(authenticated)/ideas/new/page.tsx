import React from "react";
import { IdeaValidationForm } from "@/components/ideas/IdeaValidationForm";

export default function ValidateIdeaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-[28px] md:text-[32px] font-bold text-slate-900 dark:text-white mb-3">
            Validate a New Idea
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Submit your idea for DIME enterprise-grade validation. Our autonomous agents will search the market, analyze competitors, and assess technical feasibility.
          </p>
        </div>

        <IdeaValidationForm />
      </div>
    </div>
  );
}
