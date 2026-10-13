import React from "react";
import { Lightbulb } from "lucide-react";

export function ProTip({ insight, isLoading }: { insight?: string; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4 flex gap-3 animate-pulse">
        <div className="w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-800 shrink-0" />
        <div className="h-4 w-3/4 bg-orange-200 dark:bg-orange-800 rounded mt-0.5" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4 flex gap-3">
      <Lightbulb className="w-5 h-5 text-dime-orange shrink-0 mt-0.5" />
      <div>
        <h4 className="text-[13px] font-bold text-orange-900 dark:text-orange-300 mb-0.5 uppercase tracking-wider">
          Quick Insight
        </h4>
        <p className="text-[14px] text-orange-800 dark:text-orange-200 leading-snug">
          {insight}
        </p>
      </div>
    </div>
  );
}
