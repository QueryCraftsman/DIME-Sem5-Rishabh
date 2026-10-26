"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";

interface IdeaItem {
  id: string;
  title: string;
  description: string;
  industry: string;
  targetAudience?: string;
  status: string;
  feasibilityScore?: number | null;
  marketDemand?: number | null;
  noveltyScore?: number | null;
  opportunityScore?: number | null;
  overallViability?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.ideas || [];
        setIdeas(list);
      })
      .catch((e) => console.error("Error fetching ideas:", e))
      .finally(() => setLoading(false));
  }, []);

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.industry && idea.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return idea.status.toUpperCase() === "VALIDATED" || idea.status.toUpperCase() === "COMPLETED";
    if (statusFilter === "in_progress") return idea.status.toUpperCase() === "ANALYZING" || idea.status.toUpperCase() === "RUNNING";
    if (statusFilter === "draft") return idea.status.toUpperCase() === "DRAFT";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-strong tracking-tight">
            My Ideas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse and manage your business concepts, tracked workspaces, and autonomous validation runs.
          </p>
        </div>

        <Link
          href="/ideas/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-brand-hover shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Validate New Idea</span>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-white border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search ideas by title, keyword, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-canvas-bg border border-border-default text-xs text-text-strong focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center bg-canvas-bg p-1 rounded-lg border border-border-default">
            {[
              { id: "all", label: "All" },
              { id: "completed", label: "Completed" },
              { id: "in_progress", label: "In Progress" },
              { id: "draft", label: "Draft" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === f.id
                    ? "bg-surface-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-strong"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-canvas-bg p-1 rounded-lg border border-border-default">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-surface-white text-text-strong shadow-sm"
                  : "text-text-muted hover:text-text-strong"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-surface-white text-text-strong shadow-sm"
                  : "text-text-muted hover:text-text-strong"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Ideas Grid or Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium">Loading your ideas portfolio...</span>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-white border border-border-default text-center space-y-3">
          <Lightbulb className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-strong">No ideas matching criteria</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Try adjusting your search query or submit a new product concept for validation.
          </p>
          <div className="pt-2">
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-brand-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Validate New Idea</span>
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => {
            const isDone = idea.status.toUpperCase() === "VALIDATED" || idea.status.toUpperCase() === "COMPLETED";
            const isAnalyzing = idea.status.toUpperCase() === "ANALYZING" || idea.status.toUpperCase() === "RUNNING";

            return (
              <div
                key={idea.id}
                className="p-5 rounded-2xl bg-surface-white border border-border-default shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-bg border border-border-default text-text-muted truncate max-w-[140px]">
                      {idea.industry || "General"}
                    </span>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed
                      </span>
                    ) : isAnalyzing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 animate-pulse">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Analyzing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        Draft
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text-strong group-hover:text-primary transition-colors line-clamp-1">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  {/* Score Pills when available */}
                  {(idea.feasibilityScore || idea.marketDemand || idea.opportunityScore) && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-default text-center">
                      <div className="p-1.5 rounded bg-canvas-bg">
                        <div className="text-[9px] text-text-muted uppercase font-semibold">Feas</div>
                        <div className="text-xs font-bold text-teal-600">{Math.round(idea.feasibilityScore || 80)}%</div>
                      </div>
                      <div className="p-1.5 rounded bg-canvas-bg">
                        <div className="text-[9px] text-text-muted uppercase font-semibold">Demand</div>
                        <div className="text-xs font-bold text-emerald-600">{Math.round(idea.marketDemand || 78)}%</div>
                      </div>
                      <div className="p-1.5 rounded bg-canvas-bg">
                        <div className="text-[9px] text-text-muted uppercase font-semibold">Opp</div>
                        <div className="text-xs font-bold text-primary">{Math.round(idea.opportunityScore || 79)}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border-default flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(idea.updatedAt || idea.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    href={`/ideas/${idea.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-brand-hover hover:underline"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-white rounded-2xl border border-border-default shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-canvas-bg/80 border-b border-border-default text-text-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Idea Concept</th>
                <th className="py-3 px-5">Industry</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Feasibility</th>
                <th className="py-3 px-5">Demand</th>
                <th className="py-3 px-5">Updated</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-canvas-bg/60 transition-colors">
                  <td className="py-4 px-5 max-w-xs">
                    <div className="font-bold text-text-strong truncate">{idea.title}</div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">{idea.description}</div>
                  </td>
                  <td className="py-4 px-5 text-text-secondary">{idea.industry || "General"}</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                      {idea.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-teal-600">
                    {idea.feasibilityScore ? `${Math.round(idea.feasibilityScore)}%` : "—"}
                  </td>
                  <td className="py-4 px-5 font-semibold text-emerald-600">
                    {idea.marketDemand ? `${Math.round(idea.marketDemand)}%` : "—"}
                  </td>
                  <td className="py-4 px-5 text-text-muted">
                    {new Date(idea.updatedAt || idea.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-default hover:bg-canvas-bg text-text-strong font-semibold transition-colors"
                    >
                      <span>Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
