import React from "react";
import { Lightbulb, CheckCircle2, Database, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiStats {
  totalIdeas: number;
  completedAnalyses: number;
  evidenceItems: number;
  indexedSources: number;
}

export function KpiCards({ stats, isLoading }: { stats?: KpiStats; isLoading: boolean }) {
  const cards = [
    {
      title: "Total ideas",
      value: stats?.totalIdeas || 0,
      icon: Lightbulb,
      color: "text-dime-orange",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Completed analyses",
      value: stats?.completedAnalyses || 0,
      icon: CheckCircle2,
      color: "text-dime-green",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Evidence items",
      value: stats?.evidenceItems || 0,
      icon: Database,
      color: "text-dime-purple",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Indexed sources",
      value: stats?.indexedSources || 0,
      icon: Globe,
      color: "text-dime-cyan",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between"
        >
          <div>
            {isLoading ? (
              <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md mb-1" />
            ) : (
              <div className="text-3xl font-bold text-dime-navy dark:text-white mb-1 tracking-tight">
                {card.value.toLocaleString()}
              </div>
            )}
            <div className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              {card.title}
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.bg)}>
            <card.icon className={cn("w-6 h-6", card.color)} strokeWidth={2} />
          </div>
        </div>
      ))}
    </div>
  );
}
