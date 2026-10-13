"use client";

import React from "react";
import { TrendingUp, BarChart2, Cpu, Library, ShieldCheck, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatWeAnalyzePanel() {
  const vectors = [
    {
      title: "Market Intelligence",
      badge: "Demand & Pain",
      badgeColor: "text-[#28A2B8] bg-[#EEF9FA] dark:text-[#52C8DC] dark:bg-[#28A2B8]/10",
      icon: TrendingUp,
      iconColor: "text-[#28A2B8] border-[#A8E2EC] bg-white dark:bg-slate-800 dark:border-[#28A2B8]/30",
      desc: "Demand signals, user pain points, sentiment, and momentum trends retrieved from live search and discussions.",
    },
    {
      title: "Competition",
      badge: "Feature Matrix",
      badgeColor: "text-dime-orange bg-orange-50 dark:text-orange-400 dark:bg-dime-orange/10",
      icon: BarChart2,
      iconColor: "text-dime-orange border-orange-200 bg-white dark:bg-slate-800 dark:border-dime-orange/30",
      desc: "Existing commercial products, active GitHub repositories, feature matrix overlap, and white-space gaps.",
    },
    {
      title: "Technical Feasibility",
      badge: "Stack & Depth",
      badgeColor: "text-[#8B5CF6] bg-[#F5F3FF] dark:text-[#A78BFA] dark:bg-[#8B5CF6]/10",
      icon: Cpu,
      iconColor: "text-[#8B5CF6] border-[#DDD6FE] bg-white dark:bg-slate-800 dark:border-[#8B5CF6]/30",
      desc: "Technology maturity, complexity benchmarks, API availability, and architectural dependency mapping.",
    },
    {
      title: "Research & Evidence",
      badge: "Citations",
      badgeColor: "text-[#10B981] bg-[#ECFDF5] dark:text-[#34D399] dark:bg-[#10B981]/10",
      icon: Library,
      iconColor: "text-[#10B981] border-[#A7F3D0] bg-white dark:bg-slate-800 dark:border-[#10B981]/30",
      desc: "Relevant technical and academic papers, developer documentation, and benchmark datasets with direct citations.",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="p-6 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <Brain className="w-5 h-5 text-dime-orange" />
          <h3 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
            What We Analyze
          </h3>
        </div>
        <div className="w-12 h-0.5 bg-slate-100 dark:bg-slate-800 my-4" />
        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
          DIME multi-agent engine extracts validated findings across 4 core vectors:
        </p>
      </div>
      
      {/* Cards List */}
      <div className="px-5 pb-2 space-y-3">
        {vectors.map((vec, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border", vec.iconColor)}>
                <vec.icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                    {vec.title}
                  </h4>
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap", vec.badgeColor)}>
                    {vec.badge}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
                  {vec.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guarantee Footer */}
      <div className="p-5 pt-3">
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-[18px] h-[18px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" strokeWidth={2.5} />
          <div>
            <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-1">
              Zero Hallucination Guarantee
            </h4>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              All scores and recommendations are grounded in retrieved source citations with confidence metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
