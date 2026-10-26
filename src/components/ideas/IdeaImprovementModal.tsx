"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  improvedText: string;
  keyEnhancements: string[];
  onApply: (newText: string) => void;
}

export function IdeaImprovementModal({
  isOpen,
  onClose,
  originalText,
  improvedText,
  keyEnhancements,
  onApply,
}: IdeaImprovementModalProps) {
  const [editableText, setEditableText] = useState(improvedText);
  const [activeTab, setActiveTab] = useState<"side_by_side" | "editable">("side_by_side");

  React.useEffect(() => {
    setEditableText(improvedText);
  }, [improvedText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-dime-orange">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">
                AI Idea Improvement
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Compare your original concept with DIME&apos;s structured enhancement before applying.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("side_by_side")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  activeTab === "side_by_side"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("editable")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  activeTab === "editable"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Edit Suggestion
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhancements Banner */}
        {keyEnhancements && keyEnhancements.length > 0 && (
          <div className="px-6 py-3 bg-orange-50/70 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-dime-orange shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[12px] font-bold text-orange-900 dark:text-orange-200 mr-2">
                What Changed:
              </span>
              <span className="text-[12px] text-orange-800/90 dark:text-orange-300">
                {keyEnhancements.join(" • ")}
              </span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "side_by_side" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Original Card */}
              <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                    Original Draft
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {originalText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
                  {originalText}
                </div>
              </div>

              {/* Improved Card */}
              <div className="flex flex-col rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-dime-orange uppercase tracking-wider">
                      Structured Suggestion
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-dime-orange dark:bg-orange-950/60">
                      Enhanced
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {improvedText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap flex-1 font-normal">
                  {improvedText}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200 flex justify-between">
                <span>Fine-tune Suggestion Before Applying</span>
                <span className="text-slate-400 text-[11px] font-normal">You can freely edit the text below</span>
              </label>
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={10}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-dime-orange transition-colors"
                placeholder="Edit the improved version..."
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-[12px] text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Your original text will not be modified unless you select &ldquo;Apply Suggestion&rdquo;. You can always revert or keep typing.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Keep Original Draft
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onApply(editableText);
                onClose();
              }}
              className="h-10 px-5 rounded-xl bg-dime-orange hover:bg-orange-600 text-white text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Suggestion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
