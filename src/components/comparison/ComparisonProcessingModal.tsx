"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";

interface ComparisonProcessingModalProps {
  isOpen: boolean;
  onSuccess: (reportId: string) => void;
  onError: (error: string) => void;
  executionParams: {
    idea_ids: string[];
    title: string;
    objective: string;
  } | null;
  onClose: () => void;
}

const STAGES = [
  { id: 1, label: "Validating candidate eligibility & authorization" },
  { id: 2, label: "Loading analytical scores & citation provenance" },
  { id: 3, label: "Normalizing multi-vector metric dimensions" },
  { id: 4, label: "Synthesizing Pareto trade-offs & objective recommendation" },
  { id: 5, label: "Persisting comparison dossier to database" },
];

export function ComparisonProcessingModal({
  isOpen,
  onSuccess,
  onError,
  executionParams,
  onClose,
}: ComparisonProcessingModalProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !executionParams) return;

    let isMounted = true;
    setCurrentStage(1);
    setErrorMessage(null);

    // Natural milestone progression based on realistic execution timing
    const stageTimers: NodeJS.Timeout[] = [];
    stageTimers.push(setTimeout(() => isMounted && setCurrentStage(2), 500));
    stageTimers.push(setTimeout(() => isMounted && setCurrentStage(3), 1100));
    stageTimers.push(setTimeout(() => isMounted && setCurrentStage(4), 1800));
    stageTimers.push(setTimeout(() => isMounted && setCurrentStage(5), 2500));

    const execute = async () => {
      try {
        const res = await fetch("/api/comparisons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea_ids: executionParams.idea_ids,
            title: executionParams.title || undefined,
            objective: executionParams.objective,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.detail || "Comparison evaluation failed");
        }

        const data = await res.json();
        if (isMounted) {
          setCurrentStage(5);
          setTimeout(() => {
            if (isMounted) {
              onSuccess(data.id);
            }
          }, 400);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Execution failed:", err);
          setErrorMessage(err.message || "Failed to complete comparison");
          onError(err.message);
        }
      }
    };

    execute();

    return () => {
      isMounted = false;
      stageTimers.forEach(clearTimeout);
    };
  }, [isOpen, executionParams, onSuccess, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface-white dark:bg-[#1C1A17] border border-border-default dark:border-[#2E2A25] rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 text-center">
        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-strong">
                Comparison Failed
              </h3>
              <p className="text-xs text-text-secondary mt-1">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-canvas-bg dark:bg-[#25221E] border border-border-default text-xs font-bold text-text-strong hover:bg-surface-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-primary mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-text-strong">
                Evaluating Comparison Analysis
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Executing multi-vector Pareto normalization across selected candidates.
              </p>
            </div>

            {/* Stages Checklist */}
            <div className="p-3.5 rounded-xl bg-canvas-bg/60 dark:bg-[#161412]/60 border border-border-default dark:border-[#2E2A25] text-left space-y-2.5">
              {STAGES.map((st) => {
                const isDone = currentStage > st.id;
                const isCurrent = currentStage === st.id;

                return (
                  <div
                    key={st.id}
                    className={`flex items-center gap-2.5 text-xs transition-colors ${
                      isDone
                        ? "text-[#159B72] dark:text-[#55C99A] font-semibold"
                        : isCurrent
                        ? "text-primary font-bold"
                        : "text-text-muted opacity-60"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 shrink-0 rounded-full border border-border-default flex items-center justify-center text-[10px]">
                        {st.id}
                      </div>
                    )}
                    <span className="truncate">{st.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>Typical processing duration: 2.5–4.5 seconds</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
