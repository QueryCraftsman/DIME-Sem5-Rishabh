"use client";

import React from "react";
import { Database, CheckCircle2, Clock, Activity, AlertCircle } from "lucide-react";
import type { SourceCoverageData } from "@/types/market-analysis";

interface SourceCoverageProps {
  data?: SourceCoverageData;
}

export function SourceCoverage({ data }: SourceCoverageProps) {
  if (!data) return null;

  const {
    totalProviders,
    activeProviders,
    totalRecordsFound,
    totalRecordsIndexed,
    providers,
  } = data;

  return (
    <div id="sec-sources" className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              Source Ingestion Coverage & Ingestion Pipeline
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              {activeProviders} / {totalProviders} Providers Active
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Real-time pipeline ingestion telemetry tracking multi-source indexation across academic, code, and community datasets.
          </p>
        </div>

        {/* Global Record Counts */}
        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
          <div>
            <span className="text-text-secondary">Records Found: </span>
            <span className="font-bold text-text-strong">{totalRecordsFound}</span>
          </div>
          <div>
            <span className="text-text-secondary">Indexed: </span>
            <span className="font-bold text-emerald-700">{totalRecordsIndexed}</span>
          </div>
        </div>
      </div>

      {/* Providers Table / Cards */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-text-strong font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Provider / Data Source</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-center">Records Found</th>
              <th className="py-2.5 px-4 text-center">Records Indexed</th>
              <th className="py-2.5 px-4">Coverage Rate</th>
              <th className="py-2.5 px-4 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map((p, idx) => {
              const isDone = p.status.toUpperCase() === "COMPLETED";
              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-text-strong flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{p.providerName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isDone
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Activity className="w-3 h-3 animate-spin" />
                      )}
                      <span>{p.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-text-secondary">
                    {p.recordsFound}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-text-strong">
                    {p.recordsIndexed}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${p.coveragePercentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-text-secondary font-semibold">
                        {p.coveragePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-secondary">
                    {p.latencyText || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

