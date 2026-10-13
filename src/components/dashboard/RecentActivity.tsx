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
      return <Bookmark className="w-4 h-4 text-dime-blue" />;
    case "insight":
      return <CheckCircle2 className="w-4 h-4 text-dime-green" />;
    case "alert":
      return <AlertCircle className="w-4 h-4 text-dime-red" />;
    case "analysis":
    default:
      return <FileText className="w-4 h-4 text-dime-purple" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "saved":
      return "bg-dime-blue-soft border-dime-blue/20";
    case "insight":
      return "bg-dime-green-soft border-dime-green/20";
    case "alert":
      return "bg-dime-red-soft border-dime-red/20";
    case "analysis":
    default:
      return "bg-dime-purple-soft border-dime-purple/20";
  }
};

export function RecentActivity({ activities, isLoading }: { activities?: ActivityItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col p-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dime-navy dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-dime-orange" />
          Recent Activity
        </h2>
      </div>

      <div className="p-5 flex-1 relative">
        {!activities || activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8">
            <Clock className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No recent activity.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />
            
            <div className="flex flex-col gap-6 relative z-10">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border shrink-0 z-10 bg-white dark:bg-slate-900",
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="pt-1.5 flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-dime-navy dark:text-white leading-tight mb-0.5">
                      {activity.title}
                    </div>
                    <div className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-1 mb-1">
                      {activity.subtitle}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
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
