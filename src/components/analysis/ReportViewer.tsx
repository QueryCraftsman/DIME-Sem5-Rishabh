"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Compass, 
  BarChart3, 
  Sparkles,
  Download,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Search
} from "lucide-react";
import Link from "next/link";

export interface ScoreData {
  score: number | null;
  status: string;
  explanation: string;
  inputs?: any;
  evidence_references?: string[];
}

export interface FindingData {
  category: string;
  title: string;
  description: string;
  confidence: number;
  evidence_count: number;
  evidence_ids?: string[];
}

export interface ReportData {
  id: string;
  status: string;
  title: string;
  description: string;
  domain?: string | null;
  target_audience?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  scores: Record<string, ScoreData>;
  findings: FindingData[];
}

interface ReportViewerProps {
  report: ReportData;
  ideaId?: string;
  onViewEvidence?: () => void;
}

export default function ReportViewer({ report, ideaId, onViewEvidence }: ReportViewerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const metricConfig: Record<string, { label: string; icon: React.ElementType; color: string; desc: string }> = {
    "Novelty": {
      label: "Novelty",
      icon: Sparkles,
      color: "from-blue-500 to-indigo-600",
      desc: "Distinctiveness against existing literature and market solutions."
    },
    "Market Saturation": {
      label: "Market Saturation",
      icon: Layers,
      color: "from-amber-500 to-orange-600",
      desc: "Density and maturity of competitive alternatives."
    },
    "Market Pain": {
      label: "Market Pain",
      icon: Target,
      color: "from-rose-500 to-red-600",
      desc: "Severity and frequency of user-reported problems."
    },
    "Feasibility": {
      label: "Feasibility",
      icon: Compass,
      color: "from-emerald-500 to-teal-600",
      desc: "Execution viability given domain complexity and resources."
    },
    "Opportunity": {
      label: "Opportunity",
      icon: TrendingUp,
      color: "from-violet-500 to-purple-600",
      desc: "Balanced potential calculated from novelty and market pain."
    },
    "Risk Indicator": {
      label: "Risk Indicator",
      icon: ShieldAlert,
      color: "from-amber-600 to-rose-600",
      desc: "Risk profile considering saturation, novelty, and feasibility."
    }
  };

  const categories = ["all", "synthesis", "competition", "research", "market", "risk"];
  const filteredFindings = activeCategory === "all" 
    ? report.findings 
    : report.findings.filter(f => f.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-10">
      {/* Executive Overview Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Analysis Verified & Completed
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {report.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base leading-relaxed max-w-3xl">
              {report.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ideaId && (
              <a
                href={`/api/export/pdf?ideaId=${ideaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </a>
            )}
            {onViewEvidence && (
              <button
                onClick={onViewEvidence}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl text-sm font-semibold transition-all"
              >
                <Search className="w-4 h-4" />
                Explore Evidence
              </button>
            )}
          </div>
        </div>

        {/* Metadata Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Domain / Industry</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.domain || "Cross-Industry"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Audience</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.target_audience || "General / Enterprise"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Validated On</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {report.completed_at ? new Date(report.completed_at).toLocaleDateString() : "Today"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Findings</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.findings.length} Items</p>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Validation Scores & Metrics
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Deterministic scoring based on multi-source retrieved evidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(metricConfig).map(([key, config]) => {
            const keySnake = key.toLowerCase().replace(/ /g, "_");
            const scoreItem = report.scores?.[key] || 
              (key === "Market Saturation" ? report.scores?.["saturation"] : undefined) ||
              (key === "Risk Indicator" ? report.scores?.["risk"] : undefined) ||
              (key === "Market Pain" ? report.scores?.["market_pain"] : undefined) ||
              report.scores?.[keySnake] || {
                score: null,
                status: "INSUFFICIENT_EVIDENCE",
                explanation: "No data available."
              };
            const Icon = config.icon;
            const isComputed = 
              scoreItem.score !== null && 
              scoreItem.score !== undefined && 
              scoreItem.status !== "INSUFFICIENT_EVIDENCE" && 
              scoreItem.status !== "ERROR";
            const scoreValue = isComputed 
              ? (scoreItem.score! > 1 ? Math.round(scoreItem.score! * 10) / 10 : Math.round(scoreItem.score! * 100)) 
              : null;

            return (
              <div 
                key={key}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{config.label}</h4>
                        <span className="text-xs text-slate-400">{config.desc}</span>
                      </div>
                    </div>
                    {isComputed ? (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
                        Computed
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Score display */}
                  <div className="my-4">
                    {isComputed ? (
                      <div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {scoreValue}
                          </span>
                          <span className="text-slate-400 text-sm font-medium">/ 100</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.min(100, Math.max(0, scoreValue!))}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 px-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs mb-1">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Insufficient Evidence
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-tight">
                          Grounded calculation requires additional domain data.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p className="line-clamp-3 leading-relaxed" title={scoreItem.explanation}>
                    {scoreItem.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Findings & Intelligence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Synthesized Findings & Market Intelligence
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Insights generated by DIME autonomous agents cross-referenced with sources.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No findings matching the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFindings.map((finding, idx) => {
              const categoryColor: Record<string, string> = {
                research: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                competition: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                synthesis: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                market: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                risk: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800",
              };

              return (
                <div 
                  key={idx}
                  className="p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase border tracking-wider ${categoryColor[finding.category.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {finding.category}
                      </span>
                      {finding.evidence_count > 0 && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {finding.evidence_count} source citations
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">
                      {finding.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {finding.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Confidence: {Math.round(finding.confidence * 100)}%</span>
                    {onViewEvidence && finding.evidence_count > 0 && (
                      <button 
                        onClick={onViewEvidence}
                        className="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Inspect Evidence <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
