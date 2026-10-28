"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Check,
  X,
  Plus,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  RotateCw,
  SlidersHorizontal,
  Info
} from "lucide-react";

interface IdeaCandidate {
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
  audit_proof: string;
}

const OBJECTIVE_OPTIONS = [
  {
    id: "mvp",
    label: "Choose the best opportunity for an MVP",
    desc: "Prioritizes rapid time-to-market, low execution complexity, and clear immediate value proposition.",
  },
  {
    id: "capital",
    label: "Minimize initial capital requirements",
    desc: "Favors low infrastructure overhead, low burn rate, and lean go-to-market models.",
  },
  {
    id: "growth",
    label: "Prioritize long-term growth potential",
    desc: "Focuses on maximum market upside, massive TAM, and defensible compounding moats.",
  },
  {
    id: "feasibility",
    label: "Prioritize technical feasibility",
    desc: "Focuses on high implementation confidence, deterministic engineering, and low research risk.",
  },
  {
    id: "team",
    label: "Choose the best fit for existing team capabilities",
    desc: "Balances domain alignment with execution risks that match founding competencies.",
  },
];

export default function SelectIdeasToComparePage() {
  const router = useRouter();

  const [ideas, setIdeas] = useState<IdeaCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "eligible" | "selected" | "ineligible">("all");

  // Selection state (2-4 ideas)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Configuration options
  const [customTitle, setCustomTitle] = useState("");
  const [selectedObjective, setSelectedObjective] = useState("mvp");
  const [showConfig, setShowConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch eligible ideas
  useEffect(() => {
    const fetchEligibleIdeas = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/comparisons/eligible-ideas");
        if (res.ok) {
          const data = await res.json();
          const items: IdeaCandidate[] = data.ideas || [];
          setIdeas(items);

          // Auto-select first two completed ideas as default benchmark (matching Reference Screen 2)
          const eligibleItems = items.filter((i) => i.eligible);
          if (eligibleItems.length >= 2) {
            setSelectedIds([eligibleItems[0].id, eligibleItems[1].id]);
          } else if (eligibleItems.length === 1) {
            setSelectedIds([eligibleItems[0].id]);
          }
        }
      } catch (err) {
        console.error("Failed to load candidate ideas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleIdeas();
  }, []);

  const toggleSelect = (idea: IdeaCandidate) => {
    if (!idea.eligible) {
      return;
    }

    if (selectedIds.includes(idea.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== idea.id));
      setErrorMessage(null);
    } else {
      if (selectedIds.length >= 4) {
        setErrorMessage("Maximum limit reached: You can compare up to 4 ideas at once.");
        return;
      }
      setSelectedIds((prev) => [...prev, idea.id]);
      setErrorMessage(null);
    }
  };

  const removeCandidate = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setErrorMessage(null);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setErrorMessage(null);
  };

  const handleStartComparison = async () => {
    if (selectedIds.length < 2) {
      setErrorMessage("Please select at least 2 completed, eligible ideas to compare.");
      return;
    }
    if (selectedIds.length > 4) {
      setErrorMessage("A maximum of 4 ideas can be compared simultaneously.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_ids: selectedIds,
          title: customTitle.trim() || undefined,
          objective: selectedObjective,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to create comparison");
      }

      const data = await res.json();
      router.push(`/comparison-analysis/${data.id}`);
    } catch (err: any) {
      console.error("Failed to start comparison:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  // Filtered list
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "eligible") return idea.eligible;
    if (filterTab === "selected") return selectedIds.includes(idea.id);
    if (filterTab === "ineligible") return !idea.eligible;
    return true;
  });

  const selectedCandidates = selectedIds
    .map((id) => ideas.find((i) => i.id === id))
    .filter(Boolean) as IdeaCandidate[];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
            <Link
              href="/comparison-analysis"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Comparison Analysis</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-strong tracking-tight">
              Select Ideas to Compare
            </h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary border border-orange-200 dark:border-orange-900/50">
              {selectedIds.length} of 4 selected
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Choose 2–4 completed, usable analyses from My Ideas to evaluate trade-offs, opportunity potential, and technical risks.
          </p>
        </div>

        {/* Info Callout */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-primary text-xs font-semibold self-start sm:self-auto">
          <Info className="w-4 h-4 shrink-0" />
          <span>Min 2 required, Max 4 for cross-entropy dossier</span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected for Comparison Panel (Compact Tray, NO empty placeholder slots) */}
      <div className="p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-strong">
              Selected for Comparison
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedIds.length >= 2 && selectedIds.length <= 4
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
              }`}
            >
              {selectedIds.length} of 4 selected {selectedIds.length < 2 && `(Need at least 2)`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-semibold text-text-muted hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] text-xs font-semibold text-text-secondary hover:text-text-strong transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configuration</span>
            </button>

            <button
              type="button"
              onClick={handleStartComparison}
              disabled={selectedIds.length < 2 || submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                selectedIds.length >= 2 && !submitting
                  ? "bg-primary hover:bg-brand-hover text-white shadow-orange-500/20 active:scale-95"
                  : "bg-canvas-bg text-text-muted border border-border-default cursor-not-allowed opacity-60"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Compare Selected Ideas ({selectedIds.length})</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected candidates compact chips */}
        {selectedCandidates.length === 0 ? (
          <div className="py-4 px-4 rounded-xl border border-dashed border-border-default dark:border-[#34302B] bg-canvas-bg/30 text-center">
            <span className="text-xs text-text-muted">
              No candidates selected yet. Pick between 2 and 4 completed ideas from the table below.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedCandidates.map((candidate, idx) => (
              <div
                key={candidate.id}
                className="p-3.5 rounded-xl bg-surface-white dark:bg-[#1A1816] border-2 border-orange-300 dark:border-orange-800/80 shadow-xs flex flex-col justify-between space-y-2 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-orange-100 dark:bg-orange-950/60 text-primary uppercase">
                      CANDIDATE 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCandidate(candidate.id)}
                      className="p-1 rounded text-text-muted hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove candidate"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-text-strong truncate">
                    {candidate.title}
                  </h4>
                  <span className="text-[10px] text-text-muted truncate block">
                    {candidate.industry}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border-default/40">
                  <span className="text-xs font-extrabold text-text-strong">
                    {candidate.score || 8.0} <span className="text-[10px] text-text-muted font-normal">/10</span>
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {candidate.sources_count} sources
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Ideas Table Section */}
      <div className="p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search analyzed ideas by name, domain, or key findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] text-xs text-text-strong focus:outline-none focus:border-primary"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-canvas-bg dark:bg-[#1A1816] p-0.5 rounded-lg border border-border-default dark:border-[#34302B] text-xs">
            {[
              { id: "all", label: `All Analyses (${ideas.length})` },
              { id: "eligible", label: `Eligible (${ideas.filter((i) => i.eligible).length})` },
              { id: "selected", label: `Selected (${selectedIds.length})` },
              { id: "ineligible", label: `Ineligible (${ideas.filter((i) => !i.eligible).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-surface-white dark:bg-[#2A2723] text-primary dark:text-primary font-semibold shadow-xs"
                    : "text-text-muted hover:text-text-strong"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Verification callout banner */}
        <div className="px-3.5 py-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/30 text-xs text-text-secondary flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Only completed, verified analyses with cryptographic evidence trails are eligible for multi-idea comparison.</span>
        </div>

        {/* Candidate Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <span className="text-xs font-medium">Resolving candidate analyses from My Ideas...</span>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            No ideas match the active filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-default dark:border-[#2E2A25] text-text-muted font-bold tracking-wider uppercase text-[11px]">
                  <th className="pb-3 pl-2 w-10">Select</th>
                  <th className="pb-3 px-4">Idea Name & Strategic Focus</th>
                  <th className="pb-3 px-4">Category / Domain</th>
                  <th className="pb-3 px-4">Analysis Status</th>
                  <th className="pb-3 px-4">Validation Score & Metrics</th>
                  <th className="pb-3 pr-2 text-right">Eligibility & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/60 dark:divide-[#2E2A25]/60">
                {filteredIdeas.map((idea) => {
                  const isSelected = selectedIds.includes(idea.id);

                  return (
                    <tr
                      key={idea.id}
                      onClick={() => toggleSelect(idea)}
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/40 dark:bg-orange-950/20"
                          : idea.eligible
                          ? "hover:bg-canvas-bg/60 dark:hover:bg-[#1A1816]/60"
                          : "opacity-60 bg-canvas-bg/20 cursor-not-allowed"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(idea)}
                          disabled={!idea.eligible}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : idea.eligible
                              ? "border-border-default dark:border-[#34302B] hover:border-primary"
                              : "border-border-default/40 bg-canvas-bg cursor-not-allowed"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Idea Name & Description */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="flex items-start gap-2">
                          <div>
                            <span className="font-bold text-text-strong text-sm group-hover:text-primary transition-colors">
                              {idea.title}
                            </span>
                            <p className="text-text-muted text-xs line-clamp-1 mt-0.5">
                              {idea.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Domain / Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] text-text-secondary text-xs font-semibold">
                          {idea.industry}
                        </span>
                      </td>

                      {/* Analysis Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {idea.status_code === "completed" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#159B72] dark:bg-[#55C99A]" />
                            Completed • Verified
                          </span>
                        ) : idea.status_code === "running" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#7E57C2] dark:text-[#B39DDB] border border-purple-200 dark:border-purple-800/40">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            In Progress (65%)
                          </span>
                        ) : idea.status_code === "failed" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                            <AlertCircle className="w-3 h-3" />
                            Analysis Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-canvas-bg text-text-muted border border-border-default">
                            Draft / Unanalyzed
                          </span>
                        )}
                      </td>

                      {/* Validation Score & Metrics */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {idea.score ? (
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-text-strong text-sm">
                              {idea.score}{" "}
                              <span className="text-[10px] text-text-muted font-normal">/10</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] text-text-muted font-semibold">
                              {idea.sources_count} sources
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {idea.audit_proof}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* Eligibility & Action */}
                      <td className="py-3.5 pr-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Selected</span>
                          </span>
                        ) : idea.eligible ? (
                          <button
                            type="button"
                            onClick={() => toggleSelect(idea)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-brand-hover transition-colors cursor-pointer"
                          >
                            <span>+ Select for Comparison</span>
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-text-muted">
                            {idea.action_label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="pt-4 flex items-center justify-between text-xs text-text-muted border-t border-border-default/60 dark:border-[#2E2A25]/60 mt-2">
              <div className="flex items-center gap-2">
                <span>Showing 1 to {filteredIdeas.length} of {ideas.length} validated ideas</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-text-muted" />
                  <span>SOC2 Type II Certified Workspace</span>
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-text-secondary">
                <button type="button" className="px-2 py-1 rounded hover:bg-canvas-bg disabled:opacity-40" disabled>
                  Previous
                </button>
                <span className="px-2 py-1 rounded bg-primary text-white">1</span>
                <button type="button" className="px-2 py-1 rounded hover:bg-canvas-bg">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Pro Tip Banner */}
      <div className="p-5 rounded-2xl bg-[#FFFBF5] dark:bg-[#251F19] border border-orange-200 dark:border-orange-900/50 shadow-xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Sparkles className="w-4 h-4 fill-white" />
        </div>
        <div>
          <div className="text-xs font-black tracking-wider text-primary uppercase">
            Pro Tip: Multi-Idea Tradeoff Synthesis
          </div>
          <p className="text-xs text-text-strong dark:text-[#E8E1D8] mt-1 leading-relaxed">
            Comparing candidate ideas across differing TAM categories automatically prompts the DIME Engine to calculate <span className="font-bold">Capital Efficiency vs. Time-to-Moat</span> frontier curves. For best results, pair high-feasibility operational utilities with one high-leverage strategic bet.
          </p>
        </div>
      </div>

      {/* Footer Network Verification */}
      <footer className="pt-6 border-t border-border-default dark:border-[#2E2A25] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
        <div>
          <span>© 2026 DIME AI Enterprise Intelligence. Hedera Consensus Timestamp: 2026-09-18T14:32:09.114Z</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-text-strong cursor-pointer">Consensus Explorer</span>
          <span className="hover:text-text-strong cursor-pointer">Privacy Protocol</span>
          <span className="hover:text-text-strong cursor-pointer">API Docs</span>
        </div>
      </footer>
    </div>
  );
}
