"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  History, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Calendar
} from "lucide-react";

interface IdeaAnalysisHistoryProps {
  ideaId: string;
  currentAnalysisId: string;
  onSelectAnalysis?: (analysisId: string) => void;
  onRunNewAnalysis?: () => void;
}

export function IdeaAnalysisHistory({
  ideaId,
  currentAnalysisId,
  onSelectAnalysis,
  onRunNewAnalysis,
}: IdeaAnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ideas/${ideaId}/analyses`);
        if (!res.ok) throw new Error("Failed to load analysis history");
        const json = await res.json();
        if (mounted) {
          setAnalyses(json.analyses || []);
        }
      } catch (err: any) {
        console.error("Error fetching analysis history:", err);
        if (mounted) setError(err.message || "Failed to load history");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [ideaId]);

  return (
    <div className="space-y-6 pt-2 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text-strong">Historical Validation Runs</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Every execution cycle is immutably archived. Compare score trends and inspect historical evidence snapshots.
            </p>
          </div>

          {onRunNewAnalysis && (
            <button
              type="button"
              onClick={onRunNewAnalysis}
              className="h-9 px-4 rounded-lg bg-primary hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Run New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium">Loading analysis history...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-surface-white border border-border-default text-center text-rose-600 text-xs font-medium">
          {error}
        </div>
      ) : analyses.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface-white border border-border-default text-center space-y-2">
          <History className="w-8 h-8 text-text-muted mx-auto" />
          <h4 className="text-sm font-bold text-text-strong">No past runs found</h4>
          <p className="text-xs text-text-secondary">This is the first analysis executed for this idea.</p>
        </div>
      ) : (
        <div className="bg-surface-white rounded-2xl border border-border-default shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-canvas-bg/80 border-b border-border-default text-text-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Run ID / Execution</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Novelty</th>
                <th className="py-3 px-5">Market Pain</th>
                <th className="py-3 px-5">Feasibility</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {analyses.map((a, idx) => {
                const isCurrent = a.id === currentAnalysisId;
                const formattedDate = a.created_at
                  ? new Date(a.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                const novelty = a.scores?.Novelty?.score ?? a.scores?.Novelty;
                const marketPain = a.scores?.["Market Pain"]?.score ?? a.scores?.["Market Pain"];
                const feasibility = a.scores?.Feasibility?.score ?? a.scores?.Feasibility;

                return (
                  <tr
                    key={a.id}
                    className={`hover:bg-canvas-bg/60 transition-colors ${
                      isCurrent ? "bg-orange-50/40 dark:bg-orange-950/20" : ""
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-strong font-mono">
                          Run #{analyses.length - idx}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono mt-0.5 truncate max-w-[140px]">
                        {a.id}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {a.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-semibold text-text-strong">
                      {novelty !== undefined ? `${Number(novelty).toFixed(1)}%` : "—"}
                    </td>

                    <td className="py-4 px-5 font-semibold text-text-strong">
                      {marketPain !== undefined ? `${Number(marketPain).toFixed(1)}%` : "—"}
                    </td>

                    <td className="py-4 px-5 font-semibold text-text-strong">
                      {feasibility !== undefined ? `${Number(feasibility).toFixed(1)}%` : "—"}
                    </td>

                    <td className="py-4 px-5 text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      {isCurrent ? (
                        <span className="text-xs font-semibold text-text-muted">Viewing now</span>
                      ) : (
                        <Link
                          href={`/ideas/${ideaId}/analysis/${a.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-default hover:bg-canvas-bg text-text-strong font-semibold transition-colors"
                        >
                          <span>Open Run</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
