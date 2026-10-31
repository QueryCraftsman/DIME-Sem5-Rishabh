"use client";

import React from "react";
import { GitBranch, Star, GitFork, ExternalLink, Code2, AlertTriangle } from "lucide-react";
import type { GithubEcosystemData } from "@/types/market-analysis";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface GithubEcosystemProps {
  data?: GithubEcosystemData;
}

export function GithubEcosystem({ data }: GithubEcosystemProps) {
  if (!data) return null;

  const {
    totalReposFound,
    totalStars,
    averageForks,
    topRepositories,
    languageDistribution,
    ecosystemMaturity,
    openSourceGap,
  } = data;

  return (
    <div id="sec-github" className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              GitHub & Open-Source Ecosystem
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
              {ecosystemMaturity} Ecosystem
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Analysis of {totalReposFound} developer repositories, toolkits, and reference implementations.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-text-strong">{totalStars.toLocaleString()}</span> stars
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-text-strong">{averageForks}</span> avg forks
          </div>
        </div>
      </div>

      {/* Open Source Gap Callout */}
      <div className="mt-4 p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-900 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ecosystem Gap & Opportunity: </span>
          <span>{openSourceGap}</span>
        </div>
      </div>

      {/* Grid: Language Distribution (Left) + Top Repos (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Language Breakdown */}
        <div className="lg:col-span-5 bg-slate-50/60 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-strong mb-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              Language Distribution
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Dominant languages across active ecosystem repositories.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs shadow-md">
                            <span className="font-semibold">{d.language}:</span>{" "}
                            <span className="font-mono">{d.percentage}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={languageDistribution}
                    dataKey="percentage"
                    nameKey="language"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {languageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Language Legends */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-xs">
            {languageDistribution.map((lang) => (
              <div key={lang.language} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  {lang.language}
                </span>
                <span className="font-mono font-semibold text-text-strong">
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Repositories List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-strong mb-2 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            Top Reference Codebases & Toolkits
          </h3>

          <div className="space-y-2.5">
            {topRepositories.map((repo, idx) => (
              <div
                key={idx}
                className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-text-strong font-mono">
                      {repo.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                      {repo.language}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {repo.relevance}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {repo.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white text-text-secondary border border-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <GitFork className="w-3 h-3" />
                      {repo.forks}
                    </span>
                  </div>
                  {repo.url && (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                    >
                      <span>View Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

