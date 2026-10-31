"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Loader2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Compass,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type IdeaStatus = "Completed" | "In Progress" | "Draft" | "Failed";

interface RecentAnalysis {
  id: string;
  analysisId?: string | null;
  title: string;
  industry: string;
  status: IdeaStatus;
  novelty: string;
  market: string;
  competition: string;
  feasibility: string;
  scores: {
    novelty: number | null;
    market: number | null;
    competition: number | null;
    feasibility: number | null;
    opportunity: number | null;
    risk: number | null;
  };
  hasScores: boolean;
  updatedAt: string;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} min ago`;
  if (diff < day) return `${Math.max(1, Math.floor(diff / hour))} hours ago`;
  return `${Math.max(1, Math.floor(diff / day))} days ago`;
};

export function RecentAnalysesTable() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "in_progress" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const tabs = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "in_progress", label: "In Progress" },
    { id: "draft", label: "Draft" },
  ] as const;

  useEffect(() => {
    let mounted = true;
    const fetchData = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          filter: activeTab,
          page: page.toString(),
          search: searchQuery,
        });

        const res = await fetch(`/api/dashboard/recent-analyses?${queryParams.toString()}`);
        if (res.status === 401) {
          if (interval) clearInterval(interval);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        if (mounted) {
          setData(result.items || []);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.total || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted && !isSilent) setLoading(false);
      }
    };
    
    fetchData(false);
    
    // Poll relaxed every 15s in background only when tab is visible
    let interval: NodeJS.Timeout;
    if (activeTab === "in_progress" || activeTab === "all") {
      interval = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          return;
        }
        fetchData(true);
      }, 15000);
    }
    
    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [activeTab, page, searchQuery]);

  const handleRowClick = (row: RecentAnalysis) => {
    if (row.analysisId) {
      router.push(`/ideas/${row.id}/analysis/${row.analysisId}`);
    } else {
      router.push(`/ideas/new`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      {/* Table Header with Filters & Search */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-dime-navy dark:text-white flex items-center gap-2">
            <span>Recent Analyses</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {totalItems} ideas
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any idea to inspect live evidence, competitor matrices, and telemetry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-dime-orange text-slate-900 dark:text-white w-full sm:w-44"
            />
          </div>

          {/* Tab Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg" role="tablist" aria-label="Analyses status filter">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-700 text-dime-navy dark:text-white shadow-xs font-semibold" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Table Body */}
      <div className="flex-1 overflow-x-auto min-h-[300px] relative">
        {loading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-dime-orange animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No analyses match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting another status tab or launch a new analysis.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Idea</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Novelty</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Market</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Competition</th>
                <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Feasibility</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {data.map((row) => {
                const isCompleted = row.status === "Completed";
                const isInProgress = row.status === "In Progress";
                const isDraft = row.status === "Draft";
                const isFailed = row.status === "Failed";

                return (
                  <tr 
                    key={row.id} 
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    {/* Idea Title */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="font-medium text-dime-navy dark:text-white group-hover:text-dime-orange transition-colors truncate text-sm">
                        {row.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {row.industry}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Validated</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40 animate-pulse">
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          <span>Analyzing</span>
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Novelty Score */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isCompleted && row.scores.novelty !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            row.novelty === "High" ? "bg-emerald-500" : row.novelty === "Medium" ? "bg-amber-500" : "bg-slate-400"
                          )} />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {row.scores.novelty}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.novelty}
                          </span>
                        </div>
                      ) : isInProgress ? (
                        <span className="text-slate-400 italic text-[11px]">Evaluating...</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not analyzed</span>
                      )}
                    </td>

                    {/* Market Pain / Demand */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isCompleted && row.scores.market !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            row.market === "High" ? "bg-emerald-500" : row.market === "Medium" ? "bg-amber-500" : "bg-slate-400"
                          )} />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {row.scores.market}/100
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.market}
                          </span>
                        </div>
                      ) : isInProgress ? (
                        <span className="text-slate-400 italic text-[11px]">Scanning...</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not analyzed</span>
                      )}
                    </td>

                    {/* Competition / Saturation */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isCompleted && row.scores.competition !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            row.competition === "Low" ? "bg-emerald-500" : row.competition === "Medium" ? "bg-amber-500" : "bg-rose-500"
                          )} />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {row.scores.competition}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.competition === "Low" ? "Low Saturation" : row.competition === "Medium" ? "Moderate" : "Crowded"}
                          </span>
                        </div>
                      ) : isInProgress ? (
                        <span className="text-slate-400 italic text-[11px]">Mapping...</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not analyzed</span>
                      )}
                    </td>

                    {/* Feasibility */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isCompleted && row.scores.feasibility !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            row.feasibility === "High" ? "bg-emerald-500" : row.feasibility === "Medium" ? "bg-amber-500" : "bg-rose-500"
                          )} />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {row.scores.feasibility}/100
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.feasibility === "High" ? "Proven" : row.feasibility === "Medium" ? "Moderate" : "R&D"}
                          </span>
                        </div>
                      ) : isInProgress ? (
                        <span className="text-slate-400 italic text-[11px]">Analyzing...</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not analyzed</span>
                      )}
                    </td>

                    {/* Updated Timestamp */}
                    <td className="px-5 py-4 text-right whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {timeAgo(row.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/50">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing Page {page} of {totalPages} ({totalItems} total ideas)
        </span>
        <div className="flex gap-2">
          <button 
            type="button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            aria-label="Next page"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
