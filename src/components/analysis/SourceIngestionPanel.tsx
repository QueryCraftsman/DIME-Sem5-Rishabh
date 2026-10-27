"use client";

import React from "react";
import {
  Database,
  Github,
  BookOpen,
  Globe,
  CheckCircle2,
  Loader2,
  XCircle,
  MinusCircle,
  FileSearch,
} from "lucide-react";

interface SourceIngestion {
  id?: string;
  source_name: string;
  status: string;
  records_found?: number;
  records_indexed?: number;
  candidates_found?: number;
  relevant_count?: number;
  selected_count?: number;
  indexed_count?: number;
  duration_ms?: number;
  error?: string | null;
  timestamp?: string;
}

interface PanelProps {
  sources: SourceIngestion[];
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  GitHub: <Github className="w-4 h-4" />,
  "Semantic Scholar": <BookOpen className="w-4 h-4" />,
  Crossref: <BookOpen className="w-4 h-4" />,
  "IEEE Xplore": <BookOpen className="w-4 h-4" />,
  Web: <Globe className="w-4 h-4" />,
};

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Done</span>
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Failed</span>
        </span>
      );
    case "SKIPPED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
          <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Skipped</span>
        </span>
      );
    case "RUNNING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-dime-orange" />
          <span>Running</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-stone-50 text-slate-500 border border-slate-200/60 dark:bg-[#201E1B] dark:text-slate-400 dark:border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Pending</span>
        </span>
      );
  }
}

export default function SourceIngestionPanel({ sources }: PanelProps) {
  const completedCount = sources.filter((s) => s.status?.toUpperCase() === "COMPLETED").length;
  const totalSelected = sources.reduce(
    (sum, s) => sum + (s.selected_count ?? s.records_indexed ?? s.records_found ?? 0),
    0
  );
  const totalCandidates = sources.reduce(
    (sum, s) => sum + (s.candidates_found ?? s.records_found ?? 0),
    0
  );

  return (
    <div className="bg-white dark:bg-[#201E1B] border border-slate-200/80 dark:border-[#34302B] rounded-2xl shadow-xs flex flex-col transition-colors">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2E2A25] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-dime-orange border border-orange-100 dark:border-orange-900/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F4F0E9]">
              Source Ingestion & Retrieval
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Multi-source evidence acquisition funnel
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-[#9A9085] font-medium bg-stone-50 dark:bg-[#26231F] border border-slate-200/60 dark:border-[#34302B] px-3 py-1 rounded-lg">
          {sources.length > 0
            ? `${completedCount} of ${sources.length} sources · ${totalSelected} citations selected`
            : "Waiting for sources..."}
        </div>
      </div>

      <div className="p-0 max-h-[380px] overflow-y-auto">
        {sources.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-[#9A9085]">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-[#26231F] flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileSearch className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No sources ingested yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              External repositories, academic papers, and market indexes will register here once query planning completes.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-stone-50/80 dark:bg-[#1A1816] sticky top-0 z-10 border-b border-slate-200/80 dark:border-[#2E2A25]">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Funnel (Scanned → Relevant → Selected)
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Latency
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2A25]">
              {sources.map((source) => {
                const candidates = source.candidates_found ?? source.records_found ?? 0;
                const relevant = source.relevant_count;
                const selected = source.selected_count ?? source.records_indexed ?? source.records_found ?? 0;

                return (
                  <tr
                    key={source.id || source.source_name}
                    className="hover:bg-stone-50/60 dark:hover:bg-[#26231F] transition-colors"
                  >
                    <td className="px-5 py-3.5 flex items-center gap-3 text-slate-700 dark:text-[#C1B8AD]">
                      <div className="p-2 bg-stone-50 dark:bg-[#26231F] border border-slate-200/80 dark:border-[#39332D] rounded-lg shadow-2xs text-slate-600 dark:text-[#9A9085]">
                        {SOURCE_ICONS[source.source_name] || (
                          <Database className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-[#F4F0E9] text-[13px]">{source.source_name}</span>
                        {source.error && source.status !== "COMPLETED" && (
                          <span
                            className="text-[11px] text-rose-500 dark:text-rose-400 mt-0.5 truncate max-w-[220px]"
                            title={source.error}
                          >
                            {source.error}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#26231F] text-slate-600 dark:text-[#C1B8AD] rounded-md font-mono text-[11px] border border-slate-200/60 dark:border-slate-800">
                          {candidates} scanned
                        </span>
                        {relevant !== undefined && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 rounded-md font-mono text-[11px]">
                              {relevant} relevant
                            </span>
                          </>
                        )}
                        <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 rounded-md font-semibold font-mono text-[11px]">
                          {selected} selected
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-500 dark:text-[#9A9085]">
                      {source.duration_ms
                        ? source.duration_ms > 1000
                          ? `${(source.duration_ms / 1000).toFixed(1)}s`
                          : `${Math.round(source.duration_ms)}ms`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(source.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
