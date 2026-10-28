"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Zap,
  Trash2,
  Edit2,
  Copy,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Target
} from "lucide-react";
import { IdeaSelectionDrawer } from "@/components/comparison/IdeaSelectionDrawer";
import { PreComparisonModal } from "@/components/comparison/PreComparisonModal";
import { ComparisonProcessingModal } from "@/components/comparison/ComparisonProcessingModal";

interface CandidateItem {
  id: string;
  idea_id: string;
  candidate_position: number;
  idea_title: string;
  idea_domain?: string;
  analysis_score?: number;
  sources_count: number;
}

interface ComparisonReportItem {
  id: string;
  report_number: number;
  title: string;
  description?: string;
  objective: string;
  status: string;
  methodology_version: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  candidates: CandidateItem[];
}

interface Stats {
  total_comparisons: number;
  evaluated_ideas: number;
  completed_comparisons: number;
  evidence_coverage_rate: string;
  avg_synthesis_speed: string;
}

export default function ComparisonAnalysisDashboard() {
  const router = useRouter();

  const [reports, setReports] = useState<ComparisonReportItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_comparisons: 0,
    evaluated_ideas: 0,
    completed_comparisons: 0,
    evidence_coverage_rate: "100%",
    avg_synthesis_speed: "3.8s",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "draft">("all");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "candidates">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Workflow Dialog States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreComparisonOpen, setIsPreComparisonOpen] = useState(false);
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);

  // Candidate selection preserved in page state across drawer open/close
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [executionParams, setExecutionParams] = useState<{
    idea_ids: string[];
    title: string;
    objective: string;
  } | null>(null);

  // Actions menu state
  const [editingReport, setEditingReport] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Restore preferred view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dime_comparison_view_mode");
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    } catch {
      // Fallback to default "grid"
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("dime_comparison_view_mode", mode);
    } catch {}
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/comparisons");
      if (res.ok) {
        const data = await res.json();
        const repList: ComparisonReportItem[] = data.reports || [];
        setReports(repList);

        if (data.statistics) {
          setStats(data.statistics);
        }
      }
    } catch (err) {
      console.error("Failed to load comparisons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Selection handlers
  const handleSelectCandidate = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemoveCandidate = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleProceedToReview = () => {
    setIsDrawerOpen(false);
    setIsPreComparisonOpen(true);
  };

  const handleBackToSelection = () => {
    setIsPreComparisonOpen(false);
    setIsDrawerOpen(true);
  };

  const handleExecuteComparison = (params: { title: string; objective: string }) => {
    setIsPreComparisonOpen(false);
    setExecutionParams({
      idea_ids: selectedIds,
      title: params.title,
      objective: params.objective,
    });
    setIsProcessingOpen(true);
  };

  const handleProcessingSuccess = (reportId: string) => {
    setIsProcessingOpen(false);
    setSelectedIds([]);
    router.push(`/comparison-analysis/${reportId}`);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || !newTitle.trim()) return;

    try {
      const res = await fetch(`/api/comparisons/${editingReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === editingReport.id ? { ...r, title: newTitle.trim() } : r
          )
        );
        setEditingReport(null);
        setNewTitle("");
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comparison report?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/comparisons/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        setStats((prev) => ({
          ...prev,
          total_comparisons: Math.max(0, prev.total_comparisons - 1),
        }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (report: ComparisonReportItem) => {
    const ideaIds = report.candidates.map((c) => c.idea_id);
    if (ideaIds.length < 2) return;

    try {
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_ids: ideaIds,
          title: `${report.title} (Copy)`,
          objective: report.objective,
          description: report.description,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/comparison-analysis/${data.id}`);
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  // Filter & Sort
  const filteredReports = useMemo(() => {
    return reports
      .filter((rep) => {
        const term = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !term ||
          rep.title.toLowerCase().includes(term) ||
          (rep.description && rep.description.toLowerCase().includes(term)) ||
          rep.candidates.some((c) => c.idea_title.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        if (statusFilter === "completed") return rep.status.toUpperCase() === "COMPLETED";
        if (statusFilter === "draft") return rep.status.toUpperCase() === "DRAFT";
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "candidates") return b.candidates_count - a.candidates_count;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, searchQuery, statusFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* =========================================================================
          SECTION 1: PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Decision Intelligence
            </span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs font-medium text-text-muted">
              Evidence-Backed Multi-Vector Synthesis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-strong tracking-tight mt-1">
            Comparison Analysis
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Compare candidate ideas side-by-side across market demand, novelty moats, feasibility, and downside execution risk.
          </p>
        </div>

        {/* Primary CTA: Opens Idea Selection Drawer */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Compare Ideas</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: PRIMARY KPI CARDS (Immediately Below Page Header)
          Order: 1. Total Comparisons, 2. Evaluated Ideas, 3. Evidence Coverage, 4. Avg Synthesis Speed
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Comparisons */}
        <div className="p-4 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-xs font-semibold">Total Comparisons</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-strong">
              {stats.total_comparisons}
            </span>
            <span className="text-xs text-text-muted">dossiers</span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Persisted in pipeline
          </span>
        </div>

        {/* KPI 2: Evaluated Ideas */}
        <div className="p-4 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-xs font-semibold">Evaluated Ideas</span>
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-strong">
              {stats.evaluated_ideas}
            </span>
            <span className="text-xs text-text-muted">hypotheses</span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Unique candidate ideas
          </span>
        </div>

        {/* KPI 3: Evidence Coverage */}
        <div className="p-4 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-xs font-semibold">Evidence Coverage</span>
            <ShieldCheck className="w-4 h-4 text-[#159B72]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-strong">
              {stats.evidence_coverage_rate || "--"}
            </span>
            <span className="text-xs text-[#159B72] font-semibold">verified</span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Multi-source verified
          </span>
        </div>

        {/* KPI 4: Average Synthesis Speed */}
        <div className="p-4 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-1.5">
            <span className="text-xs font-semibold">Average Synthesis Speed</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-strong">
              {stats.avg_synthesis_speed || "--"}
            </span>
            <span className="text-xs text-text-muted">latency</span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Deterministic execution
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ALL COMPARISON REPORTS (Grid View & List View)
          ========================================================================= */}
      {reports.length === 0 && !loading ? (
        /* Deliberate Empty State when user has zero comparison reports */
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-white dark:bg-[#201E1B] border-2 border-dashed border-border-default dark:border-[#2E2A25] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-primary mx-auto flex items-center justify-center shadow-xs">
            <Layers className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-text-strong">
              No Comparison Dossiers Yet
            </h3>
            <p className="text-xs text-text-secondary">
              Select 2 to 4 completed, validated ideas from your pipeline to evaluate cross-vector trade-offs, feasibility, and market risks side by side.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Compare Candidate Ideas</span>
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
          {/* Header Controls: Title, Search, Filters, Sort, and View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-text-strong">
                  All Comparison Reports
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-text-muted">
                  {reports.length}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Browse, filter, and review previously synthesized candidate dossiers.
              </p>
            </div>

            {/* Search, Filter, Sort Controls & View Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search dossiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 h-8 pl-8 pr-3 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-xs text-text-strong focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-surface-white dark:bg-[#25221E] text-text-strong shadow-2xs font-bold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    statusFilter === "completed"
                      ? "bg-surface-white dark:bg-[#25221E] text-primary shadow-2xs font-bold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
                className="h-8 px-2.5 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-xs text-text-strong font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="recent">Newest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="candidates">Candidate Count</option>
              </select>

              {/* View Switcher Toggle (Grid View vs List View) */}
              <div className="flex items-center bg-canvas-bg dark:bg-[#161412] p-1 rounded-lg border border-border-default dark:border-[#2E2A25]">
                <button
                  id="comparison-view-mode-grid"
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-surface-white dark:bg-[#25221E] text-text-strong shadow-2xs"
                      : "text-text-muted hover:text-text-strong"
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="comparison-view-mode-list"
                  type="button"
                  onClick={() => handleViewModeChange("list")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-surface-white dark:bg-[#25221E] text-text-strong shadow-2xs"
                      : "text-text-muted hover:text-text-strong"
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body: Loading, Empty, Grid View, or List View */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-text-muted">Loading comparison dossiers...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-16 text-center space-y-1">
              <FileText className="w-8 h-8 text-text-muted mx-auto stroke-[1.5]" />
              <p className="text-xs font-bold text-text-strong">No comparison reports match</p>
              <p className="text-[11px] text-text-muted">Try clearing your search query or status filter.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* =========================================================================
               A. GRID VIEW (Card Layout)
               ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs hover:border-slate-300 dark:hover:border-[#3E3830] transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top: Report ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-text-muted">
                        #CR-000{report.report_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status.toUpperCase() === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40"
                            : "bg-zinc-100 dark:bg-zinc-800 text-text-muted border border-border-default"
                        }`}
                      >
                        {report.status.toUpperCase() === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{report.status}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Link
                        href={`/comparison-analysis/${report.id}`}
                        className="text-base font-bold text-text-strong group-hover:text-primary transition-colors line-clamp-1 block"
                        title={report.title}
                      >
                        {report.title}
                      </Link>
                      {report.description ? (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                      ) : (
                        <p className="text-xs text-text-muted mt-1 italic">
                          Multi-vector evaluation across {report.candidates_count} candidate ideas.
                        </p>
                      )}
                    </div>

                    {/* Decision Objective */}
                    {report.objective && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-[11px] text-text-secondary max-w-full">
                        <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium">{report.objective}</span>
                      </div>
                    )}

                    {/* Compared Candidates Preview (up to 3 + more indicator) */}
                    <div className="pt-2 border-t border-border-default/60 dark:border-[#2E2A25]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                        <span>Compared Candidates</span>
                        <span>{report.candidates_count} total</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.candidates.slice(0, 3).map((cand) => (
                          <span
                            key={cand.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-[11px] font-semibold text-text-strong truncate max-w-[145px]"
                            title={cand.idea_title}
                          >
                            <span className="truncate">{cand.idea_title}</span>
                            {cand.analysis_score && (
                              <span className="text-[10px] font-extrabold text-[#159B72]">
                                {cand.analysis_score}
                              </span>
                            )}
                          </span>
                        ))}
                        {report.candidates.length > 3 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/50 text-[10px] font-bold">
                            +{report.candidates.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Date & Actions */}
                  <div className="pt-3 border-t border-border-default/60 dark:border-[#2E2A25]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(report.updated_at || report.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReport({ id: report.id, title: report.title });
                          setNewTitle(report.title);
                        }}
                        className="p-1 text-text-muted hover:text-text-strong rounded cursor-pointer"
                        title="Rename report"
                        aria-label="Rename report"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(report)}
                        className="p-1 text-text-muted hover:text-text-strong rounded cursor-pointer"
                        title="Duplicate comparison"
                        aria-label="Duplicate comparison"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        disabled={isDeleting === report.id}
                        className="p-1 text-text-muted hover:text-red-600 rounded cursor-pointer"
                        title="Delete report"
                        aria-label="Delete report"
                      >
                        {isDeleting === report.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link
                        href={`/comparison-analysis/${report.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-brand-hover text-white text-xs font-bold shadow-2xs transition-colors ml-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =========================================================================
               B. LIST VIEW (Table Layout)
               ========================================================================= */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-default dark:border-[#2E2A25] text-text-muted text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3">Report & ID</th>
                    <th className="py-3 px-3">Compared Candidates</th>
                    <th className="py-3 px-3">Decision Objective</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60 dark:divide-[#2E2A25]/60">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-canvas-bg/50 dark:hover:bg-[#1A1816]/50 transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <Link
                          href={`/comparison-analysis/${report.id}`}
                          className="font-bold text-text-strong hover:text-primary transition-colors block leading-snug"
                        >
                          {report.title}
                        </Link>
                        <span className="text-[10px] text-text-muted block mt-0.5 font-mono">
                          #CR-000{report.report_number} • {report.candidates_count} hypotheses
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {report.candidates.map((cand) => (
                            <span
                              key={cand.id}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-[10px] font-semibold text-text-strong truncate max-w-[140px]"
                            >
                              <span className="truncate">{cand.idea_title}</span>
                              {cand.analysis_score && (
                                <span className="text-[9px] font-extrabold text-[#159B72]">
                                  {cand.analysis_score}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-text-secondary truncate max-w-[180px]">
                        {report.objective}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            report.status.toUpperCase() === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40"
                              : "bg-zinc-100 dark:bg-zinc-800 text-text-muted border border-border-default"
                          }`}
                        >
                          {report.status.toUpperCase() === "COMPLETED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{report.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                        {new Date(report.updated_at || report.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/comparison-analysis/${report.id}`}
                            className="px-2.5 py-1 rounded-md bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-[11px] font-bold text-text-strong hover:text-primary hover:border-primary transition-colors"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingReport({ id: report.id, title: report.title });
                              setNewTitle(report.title);
                            }}
                            className="p-1 text-text-muted hover:text-text-strong rounded cursor-pointer"
                            title="Rename report"
                            aria-label="Rename report"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(report)}
                            className="p-1 text-text-muted hover:text-text-strong rounded cursor-pointer"
                            title="Duplicate comparison"
                            aria-label="Duplicate comparison"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(report.id)}
                            disabled={isDeleting === report.id}
                            className="p-1 text-text-muted hover:text-red-600 rounded cursor-pointer"
                            title="Delete report"
                            aria-label="Delete report"
                          >
                            {isDeleting === report.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          RENAME MODAL
          ========================================================================= */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setEditingReport(null)}
          />
          <div className="relative w-full max-w-sm bg-surface-white dark:bg-[#1C1A17] border border-border-default dark:border-[#2E2A25] rounded-2xl shadow-xl p-5 space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-text-strong">
              Rename Comparison Dossier
            </h3>
            <form onSubmit={handleRename} className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-8 px-3 rounded-lg bg-canvas-bg dark:bg-[#161412] border border-border-default dark:border-[#2E2A25] text-xs text-text-strong focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text-strong cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-brand-hover cursor-pointer disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKFLOW DIALOGS & DRAWERS
          ========================================================================= */}
      <IdeaSelectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedIds={selectedIds}
        onSelectCandidate={handleSelectCandidate}
        onRemoveCandidate={handleRemoveCandidate}
        onClearSelection={handleClearSelection}
        onProceedToReview={handleProceedToReview}
      />

      <PreComparisonModal
        isOpen={isPreComparisonOpen}
        onClose={() => setIsPreComparisonOpen(false)}
        onBackToSelection={handleBackToSelection}
        selectedIds={selectedIds}
        onExecuteComparison={handleExecuteComparison}
      />

      <ComparisonProcessingModal
        isOpen={isProcessingOpen}
        executionParams={executionParams}
        onSuccess={handleProcessingSuccess}
        onError={(err) => console.error("Comparison execution error:", err)}
        onClose={() => setIsProcessingOpen(false)}
      />
    </div>
  );
}
