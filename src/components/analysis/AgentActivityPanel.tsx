"use client";

import React, { useEffect, useRef } from "react";
import { Bot, TerminalSquare, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface AgentActivity {
  id: string;
  agent_name: string;
  action: string;
  details: any;
  status: string;
  timestamp: string;
}

interface PanelProps {
  activities: AgentActivity[];
}

export default function AgentActivityPanel({ activities }: PanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  return (
    <div className="bg-white dark:bg-[#201E1B] border border-slate-200/80 dark:border-[#34302B] rounded-2xl shadow-xs flex flex-col h-[420px] transition-colors">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2E2A25] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-dime-orange border border-orange-100 dark:border-orange-900/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F4F0E9]">AI Activity</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Live agent execution stream</p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-stone-100 dark:bg-[#26231F] border border-slate-200/60 dark:border-[#34302B] px-2.5 py-0.5 rounded-full">
          {activities.length} {activities.length === 1 ? "event" : "events"}
        </span>
      </div>
      
      <div ref={scrollRef} className="p-5 flex-1 overflow-y-auto space-y-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-[#9A9085] py-8">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-[#26231F] flex items-center justify-center mb-3 text-slate-400">
              <TerminalSquare className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Initializing AI agents...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Autonomous orchestration events will appear here in real time.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mt-0.5 shrink-0">
                {activity.status === "ERROR" ? (
                  <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-red-200/60 dark:border-red-900/40">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                ) : activity.status === "COMPLETED" ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-dime-orange border border-orange-200/60 dark:border-orange-900/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-[#F4F0E9] text-sm truncate">
                    {activity.agent_name.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-[#9A9085] shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-[#C1B8AD] text-xs sm:text-sm leading-relaxed">{activity.action}</p>
                {activity.details && Object.keys(activity.details).length > 0 && (
                  <div className="mt-2 bg-stone-50 dark:bg-[#1A1816] p-3 rounded-lg border border-slate-200/70 dark:border-[#34302B] text-xs font-mono text-slate-600 dark:text-[#C1B8AD] overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
