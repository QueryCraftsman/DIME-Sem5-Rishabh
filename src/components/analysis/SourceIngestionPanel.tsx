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
  Filter,
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
  switch (status) {
    case "COMPLETED":
      return (
        <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Done</span>
        </div>
      );
    case "FAILED":
      return (
        <div className="flex items-center gap-1.5 text-red-600 font-medium text-xs">
          <XCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </div>
      );
    case "SKIPPED":
      return (
        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
          <MinusCircle className="w-3.5 h-3.5" />
          <span>Skipped</span>
        </div>
      );
    case "RUNNING":
      return (
        <div className="flex items-center gap-1.5 text-cyan-600 font-medium text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Running</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Pending</span>
        </div>
      );
  }
}

export default function SourceIngestionPanel({ sources }: PanelProps) {
  const completedCount = sources.filter((s) => s.status === "COMPLETED").length;
  const totalSelected = sources.reduce(
    (sum, s) => sum + (s.selected_count ?? s.records_indexed ?? s.records_found ?? 0),
    0
  );
  const totalCandidates = sources.reduce(
    (sum, s) => sum + (s.candidates_found ?? s.records_found ?? 0),
    0
  );

  return (
    <div className="bg-white dark:bg-[#201E1B] border border-slate-200 dark:border-[#34302B] rounded-2xl shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2E2A25] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#F4F0E9]">
            Source Ingestion & Retrieval
          </h2>
        </div>
        <div className="text-sm text-slate-500 dark:text-[#9A9085] font-medium">
          {sources.length > 0
            ? `${completedCount} / ${sources.length} sources · ${totalSelected} evidence docs selected (from ${totalCandidates} candidates)`
            : "Waiting for sources..."}
        </div>
      </div>

      <div className="p-0 max-h-[340px] overflow-y-auto">
        {sources.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-[#9A9085]">
            <p>No sources ingested yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1A1816] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500 dark:text-[#9A9085] border-b border-slate-100 dark:border-[#2E2A25]">
                  Source
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-[#9A9085] border-b border-slate-100 dark:border-[#2E2A25]">
                  Funnel (Candidates → Filtered → Selected)
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-[#9A9085] border-b border-slate-100 dark:border-[#2E2A25] text-right">
                  Latency
                </th>
                <th className="px-5 py-3 font-medium text-slate-500 dark:text-[#9A9085] border-b border-slate-100 dark:border-[#2E2A25]">
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
                    className="hover:bg-slate-50 dark:hover:bg-[#26231F] transition-colors"
                  >
                    <td className="px-5 py-3.5 flex items-center gap-3 text-slate-700 dark:text-[#C1B8AD]">
                      <div className="p-2 bg-white dark:bg-[#26231F] border border-slate-200 dark:border-[#39332D] rounded-lg shadow-sm text-slate-500 dark:text-[#9A9085]">
                        {SOURCE_ICONS[source.source_name] || (
                          <Database className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-[#F4F0E9]">{source.source_name}</span>
                        {source.error && source.status !== "COMPLETED" && (
                          <span
                            className="text-xs text-slate-400 dark:text-[#9A9085] mt-0.5 truncate max-w-[200px]"
                            title={source.error}
                          >
                            {source.error}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#26231F] text-slate-600 dark:text-[#C1B8AD] rounded font-mono">
                          {candidates} scanned
                        </span>
                        {relevant !== undefined && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">→</span>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 rounded font-mono">
                              {relevant} relevant
                            </span>
                          </>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">→</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 rounded font-semibold font-mono">
                          {selected} selected
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-400 dark:text-[#9A9085]">
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
