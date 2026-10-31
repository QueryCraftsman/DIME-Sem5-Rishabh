import React from "react";
import { CheckCircle2, Bookmark, AlertCircle, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  type: "saved" | "insight" | "alert" | "analysis";
  timeAgo: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "saved":
      return <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dime-blue" />;
    case "insight":
      return <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dime-green" />;
    case "alert":
      return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dime-red" />;
    case "analysis":
    default:
      return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dime-purple" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "saved":
      return "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40";
    case "insight":
      return "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
    case "alert":
      return "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40";
    case "analysis":
    default:
      return "bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40";
  }
};

export function RecentActivity({ activities, isLoading }: { activities?: ActivityItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs h-full flex flex-col p-5 sm:p-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs h-full flex flex-col">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-dime-orange" />
          <span>Recent Activity</span>
          {activities && activities.length > 0 && (
            <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {activities.length} events
            </span>
          )}
        </h2>
      </div>

      <div className="p-4 sm:p-5 flex-1 relative">
        {!activities || activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
            <Clock className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No recent activity.</p>
            <p className="text-xs text-slate-400 mt-1">Actions taken across ideas and analyses will appear here.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3.5 sm:left-4 top-3.5 bottom-3.5 w-px bg-slate-200 dark:bg-slate-800" />
            
            <div className="flex flex-col gap-3.5 sm:gap-4 relative z-10">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 sm:gap-3.5 items-start group">
                  <div className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border shrink-0 z-10 bg-white dark:bg-slate-900 shadow-2xs transition-transform group-hover:scale-105",
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="pt-0.5 flex-1 min-w-0">
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">
                      {activity.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5" title={activity.subtitle}>
                      {activity.subtitle}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {activity.timeAgo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
