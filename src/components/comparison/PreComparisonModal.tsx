"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";

export interface PreviewCandidate {
  idea_id: string;
  title: string;
  industry: string;
  score: number;
  confidence: string;
  evidence_count: number;
}

export interface PreviewData {
  candidates: PreviewCandidate[];
  eligible: boolean;
  candidate_count: number;
  methodology: string;
  objective: string;
  comparability_status: string;
  warnings: string[];
  estimated_duration?: string;
}

export const OBJECTIVE_OPTIONS = [
  {
    id: "mvp",
    label: "Choose the best opportunity for an MVP",
    desc: "Prioritizes rapid time-to-market, low execution complexity, and clear immediate value proposition.",
  },
  {
    id: "capital",
    label: "Minimize initial capital requirements",
    desc: "Favors low infrastructure overhead, lean burn rate, and capital-efficient go-to-market distribution.",
  },
  {
    id: "growth",
    label: "Prioritize long-term growth potential",
    desc: "Focuses on maximum market upside, expanding TAM, and defensible compounding competitive moats.",
  },
  {
    id: "feasibility",
    label: "Prioritize technical feasibility",
    desc: "Focuses on high implementation confidence, deterministic architectures, and low research risk.",
  },
  {
    id: "team",
    label: "Choose the best fit for existing team capabilities",
    desc: "Balances domain alignment with execution risks that match founding technical competencies.",
  },
];

interface PreComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSelection: () => void;
  selectedIds: string[];
  onExecuteComparison: (params: { title: string; objective: string }) => void;
}

export function PreComparisonModal({
  isOpen,
  onClose,
  onBackToSelection,
  selectedIds,
  onExecuteComparison,
}: PreComparisonModalProps) {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedObjective, setSelectedObjective] = useState("mvp");
  const [customTitle, setCustomTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || selectedIds.length < 2) return;

    let mounted = true;
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/comparisons/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea_ids: selectedIds,
            objective: selectedObjective,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to generate preflight comparison preview");
        }

        const data: PreviewData = await res.json();
        if (mounted) {
          setPreviewData(data);

          // Auto-generate title if currently blank
          if (!customTitle) {
            const titles = data.candidates.map((c) => c.title);
            if (titles.length === 2) {
              setCustomTitle(`${titles[0]} vs ${titles[1]} Feasibility Audit`);
            } else if (titles.length > 2) {
              setCustomTitle(`${titles[0]} Strategic Trade-Off Dossier`);
            }
          }
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Preview error:", err);
          setError(err.message || "Unable to preflight comparison");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPreview();
    return () => {
      mounted = false;
    };
  }, [isOpen, selectedIds, selectedObjective]);

  if (!isOpen) return null;

  const handleRun = () => {
    onExecuteComparison({
      title: customTitle.trim(),
      objective: selectedObjective,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-surface-white dark:bg-[#1C1A17] border border-border-default dark:border-[#2E2A25] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border-default dark:border-[#2E2A25] bg-canvas-bg/50 dark:bg-[#161412]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-strong">
                Pre-Comparison Configuration & Review
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Verify comparability, refine decision weights, and configure dossier title.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg dark:hover:bg-[#25221E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && !previewData ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm font-bold text-text-strong">
                Validating Candidate Comparability...
              </p>
              <p className="text-xs text-text-muted">
                Aligning normalized metric vectors across candidate hypotheses.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Selected Candidates Summary */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Selected Candidates ({previewData?.candidate_count || selectedIds.length})
                  </span>
                  <button
                    type="button"
                    onClick={onBackToSelection}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Selection</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewData?.candidates.map((cand, idx) => (
                    <div
                      key={cand.idea_id}
                      className="p-3.5 rounded-xl border border-border-default dark:border-[#2E2A25] bg-canvas-bg/60 dark:bg-[#161412]/60 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
                            {cand.industry}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-text-strong truncate">
                          {cand.title}
                        </h4>
                        <span className="text-[11px] text-text-muted mt-0.5 block">
                          {cand.evidence_count} evidence sources cited
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-text-strong block">
                          {cand.score} <span className="text-[10px] text-text-muted font-normal">/10</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40">
                          {cand.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-strong block">
                  Dossier Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Q4 2026 Developer Tooling Trade-Off"
                  className="w-full h-9 px-3 rounded-xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] text-xs text-text-strong font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Decision Objective Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-strong block">
                  Primary Decision Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OBJECTIVE_OPTIONS.map((obj) => {
                    const isSelected = selectedObjective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => setSelectedObjective(obj.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-orange-50/50 dark:bg-orange-950/30 ring-1 ring-primary/30"
                            : "border-border-default dark:border-[#2E2A25] bg-canvas-bg/40 dark:bg-[#161412]/40 hover:border-border-default/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-text-strong">
                            {obj.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2">
                          {obj.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparability & Evidence Freshness */}
              <div className="p-3.5 rounded-xl border border-border-default dark:border-[#2E2A25] bg-canvas-bg/40 dark:bg-[#161412]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-text-strong">
                      Cross-Candidate Comparability
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      previewData?.comparability_status === "Fully Comparable"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                    }`}
                  >
                    {previewData?.comparability_status || "Fully Comparable"}
                  </span>
                </div>

                {previewData?.warnings && previewData.warnings.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {previewData.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400"
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted">
                    Candidate metrics are normalized on a uniform 0–10 scale with synchronized temporal bounds.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default dark:border-[#2E2A25] bg-canvas-bg/60 dark:bg-[#161412]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSelection}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-strong transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Candidates</span>
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={loading || selectedIds.length < 2 || !customTitle.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
