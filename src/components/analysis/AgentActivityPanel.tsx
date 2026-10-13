"use client";

import React, { useEffect, useRef } from "react";
import { Bot, TerminalSquare, AlertCircle, CheckCircle } from "lucide-react";

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <Bot className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-slate-900">AI Activity</h2>
      </div>
      
      <div ref={scrollRef} className="p-6 flex-1 overflow-y-auto space-y-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <TerminalSquare className="w-10 h-10 mb-3 opacity-20" />
            <p>Initializing AI agents...</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mt-1">
                {activity.status === "ERROR" ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : activity.status === "COMPLETED" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-sm">
                    {activity.agent_name.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{activity.action}</p>
                {activity.details && Object.keys(activity.details).length > 0 && (
                  <div className="mt-2 bg-slate-50 p-3 rounded-md border border-slate-100 text-xs font-mono text-slate-500 overflow-x-auto">
                    {JSON.stringify(activity.details, null, 2)}
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
