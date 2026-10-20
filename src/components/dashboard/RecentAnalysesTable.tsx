import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IdeaStatus = "Completed" | "In Progress" | "Draft";

interface RecentAnalysis {
  id: string;
  analysisId?: string | null;
  title: string;
  status: IdeaStatus;
  novelty: string;
  market: string;
  competition: string;
  feasibility: string;
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
  const [data, setData] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "in_progress", label: "In Progress" },
    { id: "draft", label: "Draft" },
  ] as const;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/recent-analyses?filter=${activeTab}&page=${page}`);
        if (res.status === 401) {
          if (interval) clearInterval(interval);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        if (mounted) {
          setData(result.items);
          setTotalPages(result.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    
    // Poll every 5s if we are viewing in_progress
    let interval: NodeJS.Timeout;
    if (activeTab === "in_progress" || activeTab === "all") {
      interval = setInterval(fetchData, 5000);
    }
    
    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [activeTab, page]);

  const handleRowClick = (row: RecentAnalysis) => {
    if (row.analysisId) {
      router.push(`/ideas/${row.id}/analysis/${row.analysisId}`);
    } else {
      router.push(`/ideas/new`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dime-navy dark:text-white">Recent Analyses</h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-700 text-dime-navy dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto min-h-[300px] relative">
        {loading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-dime-orange animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No analyses found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Idea</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Novelty</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Market</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Competition</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Feasibility</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {data.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <span className="text-[14px] font-medium text-dime-navy dark:text-white group-hover:text-dime-orange transition-colors line-clamp-1">{row.title}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-[12px] font-medium border",
                      row.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                      row.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[13px] font-medium",
                      row.novelty === "High" ? "text-dime-green" : row.novelty === "Medium" ? "text-dime-amber" : "text-dime-red"
                    )}>{row.novelty}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[13px] font-medium",
                      row.market === "High" ? "text-dime-green" : row.market === "Medium" ? "text-dime-amber" : "text-dime-red"
                    )}>{row.market}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[13px] font-medium",
                      row.competition === "Low" ? "text-dime-green" : row.competition === "Medium" ? "text-dime-amber" : "text-dime-red"
                    )}>{row.competition}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[13px] font-medium",
                      row.feasibility === "High" ? "text-dime-green" : row.feasibility === "Medium" ? "text-dime-amber" : "text-dime-red"
                    )}>{row.feasibility}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[13px] text-slate-500 dark:text-slate-400">{timeAgo(row.updatedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
