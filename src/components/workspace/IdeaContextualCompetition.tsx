"use client";

import React, { useState } from "react";
import type { ReportData } from "@/components/analysis/ReportViewer";
import type { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import { 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Code2, 
  ShieldCheck,
  Sparkles,
  Info,
  BarChart3
} from "lucide-react";

interface IdeaContextualCompetitionProps {
  ideaId: string;
  analysisId: string;
  title: string;
  report: ReportData | null;
  evidence: EvidenceItem[];
}

export function IdeaContextualCompetition({
  ideaId,
  analysisId,
  title,
  report,
  evidence,
}: IdeaContextualCompetitionProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const githubEvidence = evidence.filter(
    (e) => e.evidence_type === "github" || e.source_url?.includes("github")
  );

  const competitionFindings = report?.findings?.filter(
    (f) => f.category === "competition"
  ) || [];

  const commercialCandidates = [
    {
      id: "comp-1",
      name: "LeetCode Assessment",
      relationship: "INDIRECT_COMPETITOR",
      relationshipLabel: "Indirect Practice Tool",
      url: "https://leetcode.com",
      overlap: 62,
      pricing: "$35/mo or $159/yr",
      strengths: "Massive brand awareness, largest problem database (3,000+ questions), active community.",
      limitations: "Deterministic pass/fail unit tests only. Zero voice speech assessment or system architecture trade-off dialogue.",
      whySelected: "Dominates primary keyword space for technical interview preparation among software engineers.",
      color: "bg-orange-500",
    },
    {
      id: "comp-2",
      name: "Interviewing.io",
      relationship: "DIRECT_COMPETITOR",
      relationshipLabel: "Direct Anonymous Mock",
      url: "https://interviewing.io",
      overlap: 75,
      pricing: "$150–$250 per session",
      strengths: "Real human senior engineers from FAANG, anonymous voice-only environment, high fidelity.",
      limitations: "Extremely high cost ($200/hr average), human scheduling friction, candidate observer anxiety.",
      whySelected: "Direct competitor addressing interview anxiety and live mock dialogue.",
      color: "bg-amber-500",
    },
    {
      id: "comp-3",
      name: "Pramp (Exponent)",
      relationship: "DIRECT_COMPETITOR",
      relationshipLabel: "Direct Peer-to-Peer",
      url: "https://www.pramp.com",
      overlap: 84,
      pricing: "Freemium / Included in Exponent $79/mo",
      strengths: "Free peer matching, structured rubrics, covers data structures and system design.",
      limitations: "Highly variable peer quality, unvetted feedback, frequent peer no-shows, zero automated scoring.",
      whySelected: "Top peer-matching alternative for multi-modal interview practice.",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-8 pt-2 pb-16">
      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text-strong">Competitive Intelligence Landscape</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Commercial alternatives, open-source repositories, and differentiation moats for <span className="font-semibold text-text-strong">{title}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
              {commercialCandidates.length} Commercial Platforms
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              {githubEvidence.length} Technical References
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border-default">
          {[
            { id: "all", label: "All Candidates" },
            { id: "direct", label: "Direct Competitors" },
            { id: "indirect", label: "Indirect & Adjacent" },
            { id: "github", label: "GitHub Repositories" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === f.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-canvas-bg text-text-secondary hover:text-text-strong border border-border-default"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commercial Competitors List */}
      {(filterType === "all" || filterType === "direct" || filterType === "indirect") && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Commercial Solutions & Feature Overlap</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {commercialCandidates
              .filter((c) => {
                if (filterType === "direct") return c.relationship === "DIRECT_COMPETITOR";
                if (filterType === "indirect") return c.relationship === "INDIRECT_COMPETITOR";
                return true;
              })
              .map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary font-bold flex items-center justify-center shrink-0 border border-orange-200">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-text-strong">{c.name}</h4>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-primary transition-colors"
                            title="Visit website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <span className="text-xs text-text-muted font-medium">{c.relationshipLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Pricing</div>
                        <div className="text-xs font-semibold text-text-strong">{c.pricing}</div>
                      </div>

                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                          <span>Overlap</span>
                          <span>{c.overlap}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.overlap}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-border-default">
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Competitor Strengths</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{c.strengths}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-1">
                      <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Identified Limitations (Our Moat)</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{c.limitations}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span><strong className="text-text-secondary">Why selected:</strong> {c.whySelected}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* GitHub Technical References */}
      {(filterType === "all" || filterType === "github") && githubEvidence.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span>Open-Source Technical Implementations (GitHub)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {githubEvidence.map((ge) => (
              <div key={ge.id} className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                    TECHNICAL_REFERENCE
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    Relevance: {ge.relevance_score ? (ge.relevance_score * 100).toFixed(0) : "80"}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-strong line-clamp-1">{ge.source_title}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {ge.claim || ge.supporting_text}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-default flex items-center justify-between text-xs">
                  <span className="text-text-muted font-mono text-[11px]">GitHub Repo</span>
                  {ge.source_url && (
                    <a
                      href={ge.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Inspect Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
