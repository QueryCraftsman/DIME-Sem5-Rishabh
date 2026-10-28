"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Search,
  Check,
  Plus,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";

export interface IdeaCandidate {
  id: string;
  title: string;
  description: string;
  industry: string;
  status_display: string;
  status_code: "completed" | "running" | "failed" | "draft";
  eligible: boolean;
  reason_codes: string[];
  action_label: string;
  score?: number | null;
  sources_count: number;
  created_at?: string;
}

interface IdeaSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSelectCandidate: (id: string) => void;
  onRemoveCandidate: (id: string) => void;
  onClearSelection: () => void;
  onProceedToReview: () => void;
}

export function IdeaSelectionDrawer({
  isOpen,
  onClose,
  selectedIds,
  onSelectCandidate,
  onRemoveCandidate,
  onClearSelection,
  onProceedToReview,
}: IdeaSelectionDrawerProps) {
  const [ideas, setIdeas] = useState<IdeaCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "eligible" | "selected" | "ineligible">("all");
  const [limitError, setLimitError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch candidate ideas when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/comparisons/eligible-ideas");
        if (res.ok && mounted) {
          const data = await res.json();
          setIdeas(data.ideas || []);
        }
      } catch (err) {
        console.error("Failed to load eligible ideas:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIdeas();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const toggleCandidate = (idea: IdeaCandidate) => {
    if (!idea.eligible) return;

    if (selectedIds.includes(idea.id)) {
      onRemoveCandidate(idea.id);
      setLimitError(null);
    } else {
      if (selectedIds.length >= 4) {
        setLimitError("Maximum limit reached: You can compare up to 4 ideas simultaneously.");
        return;
      }
      onSelectCandidate(idea.id);
      setLimitError(null);
    }
  };

  // Filtered candidate list
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.industry.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeTab === "eligible") return idea.eligible;
      if (activeTab === "selected") return selectedIds.includes(idea.id);
      if (activeTab === "ineligible") return !idea.eligible;
      return true;
    });
  }, [ideas, searchQuery, activeTab, selectedIds]);

  // Selected ideas metadata
  const selectedCandidates = useMemo(() => {
    return selectedIds
      .map((id) => ideas.find((i) => i.id === id))
      .filter(Boolean) as IdeaCandidate[];
  }, [selectedIds, ideas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-surface-white dark:bg-[#1C1A17] border-l border-border-default dark:border-[#2E2A25] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-default dark:border-[#2E2A25] bg-canvas-bg/50 dark:bg-[#161412]/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-extrabold text-text-strong">
                Select Ideas to Compare
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Choose 2 to 4 completed analyses to evaluate cross-vector trade-offs.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg dark:hover:bg-[#25221E] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Candidates Tray (NO empty placeholder slots) */}
        <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-strong">
                Selected Candidates ({selectedIds.length}/4)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedIds.length >= 2 && selectedIds.length <= 4
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                }`}
              >
                {selectedIds.length < 2
                  ? `Need ${2 - selectedIds.length} more`
                  : "Ready for comparison"}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[11px] font-semibold text-text-muted hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedCandidates.length === 0 ? (
            <div className="py-2.5 px-3 rounded-xl border border-dashed border-orange-200 dark:border-orange-900/40 bg-surface-white/60 dark:bg-[#1C1A17]/60 text-center">
              <span className="text-xs text-text-muted">
                No candidates selected yet. Pick 2 to 4 completed analyses below.
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCandidates.map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-white dark:bg-[#24211D] border border-orange-200 dark:border-orange-900/50 shadow-2xs text-xs font-bold text-text-strong animate-in zoom-in-95 duration-150"
                >
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-extrabold">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[160px] sm:max-w-[200px]">
                    {candidate.title}
                  </span>
                  {candidate.score && (
                    <span className="text-[10px] font-extrabold text-[#159B72] dark:text-[#55C99A] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/40">
                      {candidate.score}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveCandidate(candidate.id)}
                    className="p-0.5 rounded text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove candidate"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {limitError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{limitError}</span>
            </div>
          )}
        </div>

        {/* Search & Filter Tabs */}
        <div className="p-4 border-b border-border-default dark:border-[#2E2A25] space-y-3 bg-surface-white dark:bg-[#1C1A17]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search candidate ideas by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-xs text-text-strong placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-strong p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 border-b border-border-default dark:border-[#2E2A25] pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-canvas-bg dark:bg-[#25221E] text-text-strong font-bold"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              All Analyses ({ideas.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("eligible")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === "eligible"
                  ? "bg-canvas-bg dark:bg-[#25221E] text-primary font-bold"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Eligible ({ideas.filter((i) => i.eligible).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("selected")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === "selected"
                  ? "bg-canvas-bg dark:bg-[#25221E] text-text-strong font-bold"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Selected ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ineligible")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === "ineligible"
                  ? "bg-canvas-bg dark:bg-[#25221E] text-text-strong font-bold"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Ineligible ({ideas.filter((i) => !i.eligible).length})
            </button>
          </div>
        </div>

        {/* Ideas Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-text-muted">Loading candidate ideas from pipeline...</span>
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
              <Layers className="w-8 h-8 text-text-muted stroke-[1.5]" />
              <p className="text-sm font-bold text-text-strong">No candidate ideas found</p>
              <p className="text-xs text-text-muted max-w-xs">
                {searchQuery
                  ? "No ideas match your search criteria. Try modifying your search term."
                  : "Validate an idea in My Ideas first to make it eligible for comparison."}
              </p>
            </div>
          ) : (
            filteredIdeas.map((idea) => {
              const isSelected = selectedIds.includes(idea.id);

              return (
                <div
                  key={idea.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-orange-50/40 dark:bg-orange-950/20 shadow-xs ring-1 ring-primary/20"
                      : idea.eligible
                      ? "border-border-default dark:border-[#2E2A25] bg-surface-white dark:bg-[#201E1B] hover:border-orange-300 dark:hover:border-orange-900/60"
                      : "border-border-default/60 dark:border-[#2E2A25]/60 bg-canvas-bg/60 dark:bg-[#161412]/60 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                          {idea.industry}
                        </span>

                        {/* Status Badge */}
                        {idea.eligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed Analysis</span>
                          </span>
                        ) : idea.status_code === "running" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Analysis In Progress</span>
                          </span>
                        ) : idea.status_code === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                            <AlertCircle className="w-3 h-3" />
                            <span>Analysis Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-text-muted border border-border-default dark:border-[#34302B]">
                            <span>Needs Validation</span>
                          </span>
                        )}

                        {idea.sources_count > 0 && (
                          <span className="text-[10px] text-text-muted">
                            • {idea.sources_count} sources
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-text-strong leading-snug">
                        {idea.title}
                      </h4>
                      {idea.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {idea.description}
                        </p>
                      )}

                      {/* Ineligibility notice if applicable */}
                      {!idea.eligible && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>
                            {idea.reason_codes.includes("ANALYSIS_IN_PROGRESS")
                              ? "Analysis currently running. Complete analysis to enable comparison."
                              : idea.reason_codes.includes("ANALYSIS_FAILED")
                              ? "Validation attempt failed. Retry analysis in My Ideas before comparing."
                              : "Idea has not been analyzed yet. Run full analysis to unlock comparison."}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Score & Selection Control */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {idea.score !== null && idea.score !== undefined && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-text-muted block">
                            Score
                          </span>
                          <span className="text-base font-extrabold text-text-strong">
                            {idea.score}{" "}
                            <span className="text-[10px] text-text-muted font-normal">/10</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/my-ideas/${idea.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-canvas-bg dark:hover:bg-[#25221E] transition-colors"
                          title="View original analysis"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleCandidate(idea)}
                          disabled={!idea.eligible}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white shadow-xs"
                              : idea.eligible
                              ? "bg-canvas-bg dark:bg-[#25221E] border border-border-default dark:border-[#34302B] text-text-strong hover:border-primary hover:text-primary"
                              : "bg-canvas-bg dark:bg-[#161412] text-text-muted border border-border-default/40 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </>
                          ) : idea.eligible ? (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select</span>
                            </>
                          ) : (
                            <span>Ineligible</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-default dark:border-[#2E2A25] bg-canvas-bg/60 dark:bg-[#161412]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-strong transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onProceedToReview}
            disabled={selectedIds.length < 2 || selectedIds.length > 4}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
              selectedIds.length >= 2 && selectedIds.length <= 4
                ? "bg-primary hover:bg-brand-hover text-white shadow-orange-500/20 active:scale-95"
                : "bg-canvas-bg text-text-muted border border-border-default cursor-not-allowed opacity-60"
            }`}
          >
            <span>Continue to Review ({selectedIds.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
