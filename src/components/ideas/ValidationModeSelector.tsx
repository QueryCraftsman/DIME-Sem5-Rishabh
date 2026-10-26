"use client";

import React from "react";
import { Sparkles, ClipboardList, MessageSquare, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValidationMode = "describe" | "structured" | "builder";

interface ValidationModeSelectorProps {
  selectedMode: ValidationMode;
  onSelectMode: (mode: ValidationMode) => void;
}

export function ValidationModeSelector({
  selectedMode,
  onSelectMode,
}: ValidationModeSelectorProps) {
  const modes = [
    {
      id: "describe" as const,
      title: "Describe Your Idea",
      badge: "Recommended",
      badgeColor: "bg-orange-50 text-dime-orange border border-orange-200 dark:bg-orange-950/40 dark:border-orange-800/40",
      icon: Sparkles,
      iconColor: "text-dime-orange bg-orange-50 dark:bg-orange-950/30",
      description: "Explain your idea in your own words. No complicated form required.",
      actionText: "Start with Your Idea",
    },
    {
      id: "structured" as const,
      title: "Structured Form",
      badge: null,
      icon: ClipboardList,
      iconColor: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30",
      description: "Enter detailed information about your idea using our guided form.",
      actionText: "Open Form",
    },
    {
      id: "builder" as const,
      title: "AI Idea Builder",
      badge: "Interactive",
      badgeColor: "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/40",
      icon: MessageSquare,
      iconColor: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30",
      description: "Answer a few simple questions and let DIME help you develop your idea.",
      actionText: "Build with AI",
    },
  ];

  return (
    <div className="w-full mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                "relative text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dime-orange",
                isSelected
                  ? "bg-white dark:bg-slate-900 border-dime-orange shadow-[0_4px_20px_rgba(249,115,22,0.12)] ring-1 ring-dime-orange"
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              )}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", mode.iconColor)}>
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div className="flex items-center gap-2">
                    {mode.badge && (
                      <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap", mode.badgeColor)}>
                        {mode.badge}
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-dime-orange text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={cn(
                  "text-[16px] font-bold tracking-tight mb-1.5 transition-colors",
                  isSelected ? "text-dime-navy dark:text-white" : "text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                  {mode.title}
                </h3>

                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {/* Action text footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className={cn(
                  "text-[12px] font-semibold flex items-center gap-1.5 transition-colors",
                  isSelected ? "text-dime-orange" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                )}>
                  {mode.actionText}
                  <ArrowRight className={cn(
                    "w-3.5 h-3.5 transition-transform duration-150",
                    isSelected ? "translate-x-0.5" : "group-hover:translate-x-0.5"
                  )} />
                </span>

                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isSelected ? "bg-dime-orange animate-pulse" : "bg-transparent"
                )} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
