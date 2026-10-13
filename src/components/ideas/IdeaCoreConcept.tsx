"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoreConceptState {
  title: string;
  description: string;
  targetAudience: string;
}

interface IdeaCoreConceptProps {
  data: CoreConceptState;
  onChange: (data: Partial<CoreConceptState>) => void;
  errors: Record<string, string>;
}

export function IdeaCoreConcept({ data, onChange, errors }: IdeaCoreConceptProps) {
  const maxTitleLength = 80;
  const maxDescWords = 2000;
  
  const wordCount = data.description.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="w-5 h-5 rounded-md bg-orange-50 text-dime-orange flex items-center justify-center text-[12px] font-bold">1</span>
        <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Core Concept</h2>
      </div>

      {/* Idea Title */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">
            Idea Title <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Max 80 chars</span>
        </div>
        <input 
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={maxTitleLength}
          className={cn(
            "w-full h-11 px-3.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-colors",
            errors.title ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-dime-orange"
          )}
          placeholder="e.g. AI-powered interview preparation platform"
        />
        {errors.title ? (
          <p className="text-[11px] text-red-500">{errors.title}</p>
        ) : (
          <p className="text-[11px] text-slate-500">A concise working title for your validation workspace.</p>
        )}
      </div>

      {/* Idea Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">
            Idea Description <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-dime-orange font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Tip: More context yields higher confidence evidence
          </span>
        </div>
        <textarea 
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={6}
          className={cn(
            "w-full p-3.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-colors resize-none",
            errors.description ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-dime-orange"
          )}
          placeholder="Describe the problem, target users, proposed solution, and what makes the idea different..."
        />
        <div className="flex justify-between items-center text-[11px] text-slate-500">
          {errors.description ? (
            <span className="text-red-500">{errors.description}</span>
          ) : (
            <span>Include known competitors, initial hypotheses, or specific risks if available.</span>
          )}
          <span>{wordCount} / {maxDescWords} words</span>
        </div>
      </div>

      {/* Target Users */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">
          Target Users & Persona <span className="text-[14px] text-slate-400 font-normal">(Optional)</span>
        </label>
        <input 
          type="text"
          value={data.targetAudience}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
          className="w-full h-11 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-[14px] focus:border-dime-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
          placeholder="e.g. Senior Software Engineers, Bootcamp Graduates, Hiring Managers"
        />
      </div>
    </div>
  );
}
