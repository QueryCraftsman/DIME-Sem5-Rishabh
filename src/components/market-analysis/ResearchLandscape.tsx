"use client";

import React from "react";
import { BookOpen, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import type { ResearchLandscapeData } from "@/types/market-analysis";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ResearchLandscapeProps {
  data?: ResearchLandscapeData;
}

export function ResearchLandscape({ data }: ResearchLandscapeProps) {
  if (!data) return null;

  const {
    totalPapersAnalyzed,
    academicVelocity,
    publicationsByYear,
    topPapers,
    emergingTopics,
  } = data;

  return (
    <div id="sec-research" className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              Academic Research & Publication Velocity
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              {totalPapersAnalyzed} Papers Analyzed
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Peer-reviewed literature trends across Semantic Scholar, arXiv, and PubMed indexing empirical validation.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{academicVelocity}</span>
        </div>
      </div>

      {/* Grid: Publications Chart (Left) + Emerging Topics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Publications by Year Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-strong mb-1">
              Annual Publications Velocity (2021 - 2026)
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              Surge in published peer-reviewed architectures and field trial results.
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={publicationsByYear}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickMargin={6}
                />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-md text-xs shadow-lg">
                          <span className="font-semibold text-slate-300">
                            {label}:
                          </span>{" "}
                          <span className="font-mono font-bold text-orange-400">
                            {payload[0].value} publications
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#EA580C"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emerging Topics Pills */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-strong flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Emerging Research Clusters
            </h4>
            <p className="text-xs text-text-secondary mb-4">
              Key topics exhibiting statistically significant co-citation growth.
            </p>
            <div className="flex flex-wrap gap-2">
              {emergingTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-text-strong border border-slate-200 shadow-2xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-text-secondary mt-4 pt-3 border-t border-slate-200">
            Literature consensus confirms high feasibility for specialized vertical deployments.
          </div>
        </div>
      </div>

      {/* Top Academic Papers List */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-strong mb-4 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          Key Corroborating Academic Publications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all space-y-2.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-text-strong line-clamp-2">
                    {paper.title}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                    {paper.year}
                  </span>
                </div>

                <div className="text-[11px] text-text-secondary mt-1 truncate">
                  {paper.authors.join(", ")}
                </div>

                <p className="text-xs text-text-secondary mt-2 line-clamp-3 italic">
                  "{paper.keyTakeaway}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-text-secondary font-mono">
                  {paper.citationCount != null ? `${paper.citationCount} citations` : ""}
                </span>
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <span>DOI Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

