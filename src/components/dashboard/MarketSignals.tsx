import React from "react";
import { TrendingUp, Activity, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketTrend {
  id: string;
  category: string;
  label: string;
  growth: number;
  sample: number;
  tag: string;
  color: string;
}

export function MarketSignals({ trends, isLoading }: { trends?: MarketTrend[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col p-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
        <div className="space-y-4">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dime-navy dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-dime-purple" />
          Market Signals
        </h2>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {!trends || trends.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8">
            <TrendingUp className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-center px-4">No market signals yet.<br/>Analyze ideas to see trends.</p>
          </div>
        ) : (
          trends.map((trend) => (
            <div 
              key={trend.id} 
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                    {trend.category}
                  </div>
                  <div className="text-[14px] font-semibold text-dime-navy dark:text-white line-clamp-1">
                    {trend.label}
                  </div>
                </div>
                <span 
                  className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: `${trend.color}15`,
                    color: trend.color,
                    borderColor: `${trend.color}30`,
                    borderWidth: 1
                  }}
                >
                  {trend.tag}
                </span>
              </div>
              
              <div className="flex items-center gap-6 mt-1">
                <div>
                  <div className="text-[20px] font-bold tracking-tight text-dime-navy dark:text-white leading-none mb-1">
                    {trend.growth}%
                  </div>
                  <div className="text-[12px] font-medium text-slate-500">Demand momentum</div>
                </div>
                
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                
                <div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-[14px] mb-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {trend.sample}
                  </div>
                  <div className="text-[12px] font-medium text-slate-500">Sources analyzed</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
