import React from "react";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OpportunityMixItem {
  name: string;
  value: number;
  color: string;
}

export function OpportunityDistribution({ mix, isLoading }: { mix?: OpportunityMixItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-6" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
    );
  }

  const total = mix?.reduce((acc, curr) => acc + curr.value, 0) || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dime-navy dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-dime-blue" />
          Opportunity Distribution
        </h2>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        {total === 0 ? (
          <div className="flex flex-col items-center text-center text-slate-500 py-4">
            <Target className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium px-4">No data available to calculate distribution.</p>
          </div>
        ) : (
          <>
            <div className="flex h-6 rounded-full overflow-hidden mb-8 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
              {mix?.map((item) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div
                    key={item.name}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full transition-all duration-500 hover:brightness-110"
                    title={`${item.name}: ${item.value}`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {mix?.map((item) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-0 sm:pl-5">
                      <span className="text-[24px] font-bold text-dime-navy dark:text-white leading-none">
                        {item.value}
                      </span>
                      <span className="text-[12px] font-medium text-slate-400">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
