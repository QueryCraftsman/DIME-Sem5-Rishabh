"use client";

import React from "react";
import { Play, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationActionsProps {
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onAnalyze: () => void;
  onSaveDraft: () => void;
  isValid: boolean;
}

export function ValidationActions({ isSubmitting, isSavingDraft, onAnalyze, onSaveDraft, isValid }: ValidationActionsProps) {
  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSavingDraft || isSubmitting}
        className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
      >
        {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save as Draft
      </button>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={isSubmitting}
        className={cn(
          "h-11 px-6 rounded-lg text-[14px] font-semibold flex items-center gap-2 transition-all shadow-sm bg-dime-orange text-white hover:bg-[#E65000] hover:shadow",
          isSubmitting && "opacity-70 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Initializing Pipeline...
          </>
        ) : (
          <>
            Analyze My Idea
            <Play className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
