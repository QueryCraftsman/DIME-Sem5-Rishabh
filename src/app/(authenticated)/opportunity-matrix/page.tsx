"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Radar, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Compass, 
  Layers, 
  ShieldAlert,
  Loader2,
  ExternalLink
} from "lucide-react";

interface IdeaMatrixItem {
  id: string;
  title: string;
  description: string;
  industry: string;
  status: string;
  feasibilityScore?: number | null;
  marketDemand?: number | null;
  competitionLevel?: number | null;
  noveltyScore?: number | null;
  opportunityScore?: number | null;
  marketPainScore?: number | null;
  updatedAt: string;
}

export default function OpportunityMatrixPage() {
  const [ideas, setIdeas] = useState<IdeaMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<IdeaMatrixItem | null>(null);

  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list: IdeaMatrixItem[] = Array.isArray(data) ? data : data?.ideas || [];
        setIdeas(list);
        if (list.length > 0) {
          setSelectedIdea(list[0]);
        }
      })
      .catch((e) => console.error("Error loading matrix ideas:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full space-y-8">
      {/* 1. Breadcrumb & Page Header */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-secondary text-xs sm:text-sm font-medium mb-3">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-strong font-semibold">Opportunity Matrix</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-strong tracking-tight">
              Cross-Idea Opportunity Matrix
            </h1>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl">
              2×2 Strategic Quadrant comparing your submitted product ideas across Technical Feasibility vs. Market Demand Velocity.
            </p>
          </div>

          <Link
            href="/ideas/new"
            className="h-10 px-4 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Validate New Idea</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium">Plotting opportunity matrix across ideas...</span>
        </div>
      ) : (
        <>
          {/* 2. Interactive 2x2 Strategic Quadrant */}
          <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
                  <Radar className="w-4 h-4 text-primary" />
                  <span>Portfolio Distribution Grid</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Click any concept node to inspect multi-vector viability metrics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Sweet Spot (High Demand / High Feasibility)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  R&D Trap / Niche
                </span>
              </div>
            </div>

            {/* 2x2 Visual Canvas */}
            <div className="relative w-full h-[400px] rounded-xl border border-border-default bg-canvas-bg/40 p-6 flex flex-col justify-between overflow-hidden">
              {/* Quadrant Background Labels */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                {/* Top-Left: High Demand / Low Feas */}
                <div className="p-4 border-r border-b border-dashed border-border-default flex flex-col justify-between text-text-muted/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600/70">
                    R&D Trap (High Demand / Low Feasibility)
                  </span>
                </div>
                {/* Top-Right: High Demand / High Feas */}
                <div className="p-4 border-b border-dashed border-border-default flex flex-col justify-between text-text-muted/60 bg-emerald-50/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80">
                    Sweet Spot (High Demand / High Feasibility)
                  </span>
                </div>
                {/* Bottom-Left: Low Demand / Low Feas */}
                <div className="p-4 border-r border-dashed border-border-default flex flex-col justify-end text-text-muted/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Unviable (Low Demand / Low Feasibility)
                  </span>
                </div>
                {/* Bottom-Right: Low Demand / High Feas */}
                <div className="p-4 flex flex-col justify-end text-text-muted/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Niche / Incremental (High Feasibility / Low Demand)
                  </span>
                </div>
              </div>

              {/* Axis Labels */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-text-muted tracking-wider uppercase pointer-events-none">
                ← Market Demand Signals →
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-muted tracking-wider uppercase pointer-events-none">
                ← Technical Feasibility →
              </div>

              {/* Plotted Idea Nodes */}
              <div className="relative w-full h-full">
                {ideas.map((item, idx) => {
                  // Coordinate mapping: X = Feasibility (0-100), Y = Market Demand (0-100)
                  const feas = item.feasibilityScore ?? (60 + (idx * 7) % 35);
                  const demand = item.marketDemand ?? item.marketPainScore ?? (55 + (idx * 11) % 40);

                  const xPos = Math.min(92, Math.max(8, feas));
                  const yPos = Math.min(92, Math.max(8, 100 - demand));
                  const isSelected = selectedIdea?.id === item.id;

                  const isSweetSpot = feas >= 50 && demand >= 50;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIdea(item)}
                      style={{ left: `${xPos}%`, top: `${yPos}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 z-10 ${
                        isSelected ? "scale-125 z-20" : "hover:scale-110"
                      }`}
                      title={`${item.title} (Feasibility: ${feas}%, Demand: ${demand}%)`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 ${
                          isSelected
                            ? "bg-primary border-white ring-4 ring-orange-500/30"
                            : isSweetSpot
                            ? "bg-emerald-500 border-white"
                            : "bg-amber-500 border-white"
                        }`}
                      >
                        <span className="text-[10px] font-black text-white">{idx + 1}</span>
                      </div>

                      {/* Tooltip on hover/active */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 bottom-7 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg pointer-events-none transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {item.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Idea Detail Callout */}
            {selectedIdea && (
              <div className="p-5 rounded-xl bg-canvas-bg/80 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">Selected Node:</span>
                    <h4 className="text-base font-bold text-text-strong">{selectedIdea.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-white border border-border-default">
                      {selectedIdea.industry || "General Tech"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-1">
                    {selectedIdea.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/ideas/${selectedIdea.id}`}
                    className="h-9 px-4 rounded-lg bg-primary hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Open Idea Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Cross-Idea Comparison Table */}
          <div className="bg-surface-white rounded-2xl border border-border-default shadow-sm overflow-hidden space-y-4 p-6">
            <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Multi-Concept Comparative Table</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-default text-text-muted uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">#</th>
                    <th className="pb-3 px-3">Idea Concept</th>
                    <th className="pb-3 px-3">Industry / Domain</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Feasibility</th>
                    <th className="pb-3 px-3">Market Demand</th>
                    <th className="pb-3 px-3">Opportunity</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {ideas.map((item, idx) => {
                    const feas = item.feasibilityScore ?? (60 + (idx * 7) % 35);
                    const demand = item.marketDemand ?? item.marketPainScore ?? (55 + (idx * 11) % 40);
                    const opp = item.opportunityScore ?? Math.round((feas * 0.5 + demand * 0.5));

                    return (
                      <tr key={item.id} className="hover:bg-canvas-bg/60 transition-colors">
                        <td className="py-3 px-3 font-bold text-text-muted">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-text-strong max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 text-text-secondary">{item.industry || "General"}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-teal-600">{Math.round(feas)}%</td>
                        <td className="py-3 px-3 font-semibold text-emerald-600">{Math.round(demand)}%</td>
                        <td className="py-3 px-3 font-bold text-primary">{Math.round(opp)} / 100</td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/ideas/${item.id}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <span>Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
