"use client";

import React, { useState, useMemo } from "react";
import type { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import { 
  BookOpen, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  Building
} from "lucide-react";

interface IdeaContextualResearchProps {
  ideaId: string;
  analysisId: string;
  title: string;
  evidence: EvidenceItem[];
}

export function IdeaContextualResearch({
  ideaId,
  analysisId,
  title,
  evidence,
}: IdeaContextualResearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Strict Filter for Genuine Research Items (Zero Mock Fallbacks)
  const researchItems = useMemo(() => {
    return evidence.filter(
      (e) =>
        e.evidence_type === "research" ||
        e.source_url?.includes("semanticscholar.org") ||
        e.source_url?.includes("arxiv.org") ||
        e.source_url?.includes("doi.org") ||
        e.source_url?.includes("sciencedirect.com") ||
        e.source_url?.includes("pubmed") ||
        e.source_url?.includes("ieee.org") ||
        e.source_url?.includes("acm.org") ||
        e.source_url?.includes("springer.com")
    );
  }, [evidence]);

  // 2. Search filtering
  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return researchItems;
    const q = searchQuery.toLowerCase();
    return researchItems.filter(
      (p) =>
        (p.source_title && p.source_title.toLowerCase().includes(q)) ||
        (p.claim && p.claim.toLowerCase().includes(q)) ||
        (p.supporting_text && p.supporting_text.toLowerCase().includes(q)) ||
        (p.source_url && p.source_url.toLowerCase().includes(q))
    );
  }, [researchItems, searchQuery]);

  // Average relevance calculation
  const avgRelevance = useMemo(() => {
    if (researchItems.length === 0) return 0;
    const sum = researchItems.reduce((acc, r) => acc + (r.relevance_score || 0.8), 0);
    return Math.round((sum / researchItems.length) * 100);
  }, [researchItems]);

  const cleanPaperTitle = (rawTitle?: string | null) => {
    if (!rawTitle) return "Peer-Reviewed Research Publication";
    return rawTitle
      .replace(/\[PDF\]/gi, "")
      .replace(/\[HTML\]/gi, "")
      .replace(/ - Semantic Scholar/gi, "")
      .replace(/ - arXiv/gi, "")
      .trim();
  };

  const getSourceProvider = (url?: string | null) => {
    if (!url) return "ACADEMIC INDEX";
    const u = url.toLowerCase();
    if (u.includes("arxiv.org")) return "arXiv";
    if (u.includes("semanticscholar.org")) return "Semantic Scholar";
    if (u.includes("doi.org")) return "DOI / CrossRef";
    if (u.includes("pubmed")) return "PubMed / NIH";
    if (u.includes("ieee.org")) return "IEEE Xplore";
    if (u.includes("acm.org")) return "ACM Digital Library";
    return "Peer-Reviewed Literature";
  };

  return (
    <div className="space-y-8 pt-2 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text-strong">Research & Academic Literature Corpus</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Peer-reviewed evidence, conference papers, and verified citation links backing <span className="font-semibold text-text-strong">{title}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40">
              {researchItems.length} Papers Ingested
            </span>
            {researchItems.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                Avg Relevance: {avgRelevance}%
              </span>
            )}
          </div>
        </div>

        {/* Search Bar (Only shown if papers exist) */}
        {researchItems.length > 0 && (
          <div className="relative pt-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search literature titles, extracted claims, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-canvas-bg border border-border-default rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-strong"
            />
          </div>
        )}
      </div>

      {/* Main Papers List or Transparent Zero-Evidence Banner */}
      {researchItems.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-5 text-center max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-primary flex items-center justify-center mx-auto border border-orange-200 dark:border-orange-800/40">
            <BookOpen className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-text-strong">
              No Academic Papers Directly Indexed for this Idea
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
              Automated scientific queries through Semantic Scholar, arXiv, and CrossRef returned zero peer-reviewed papers matching the specific operational ontology of <span className="font-semibold text-text-strong">{title}</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas-bg border border-border-default text-left space-y-2 text-xs">
            <div className="font-bold text-text-strong flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>Why does this happen?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-text-secondary leading-relaxed pl-1">
              <li>Practical B2B workflows, specialized SaaS, and market marketplaces often lack dedicated academic research papers.</li>
              <li>Academic literature focuses primarily on foundational machine learning, medical trials, or novel algorithms rather than commercial software execution.</li>
              <li>Verification for this idea is anchored in real-world practitioner evidence, GitHub implementations, and commercial competitors.</li>
            </ul>
          </div>

          <div className="pt-2 text-xs text-text-muted">
            <span>You can review verified web sources and code repositories in the </span>
            <span className="font-semibold text-primary">Evidence</span>
            <span> and </span>
            <span className="font-semibold text-primary">Market</span>
            <span> tabs.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Retrieved Scientific Evidence ({filteredPapers.length})</span>
            </h3>
            <span className="text-xs text-text-muted">
              {filteredPapers.length} of {researchItems.length} papers matching
            </span>
          </div>

          <div className="space-y-4">
            {filteredPapers.map((r, idx) => {
              const provider = getSourceProvider(r.source_url);
              const cleanTitle = cleanPaperTitle(r.source_title);

              return (
                <div 
                  key={r.id || idx} 
                  className="p-5 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40 uppercase">
                          {provider}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                          {Math.round(r.confidence * 100)}% Confidence
                        </span>
                        {r.relevance_score > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
                            {Math.round(r.relevance_score * 100)}% Relevance
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-text-strong leading-snug">
                        {cleanTitle}
                      </h4>
                    </div>

                    {r.source_url && (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-canvas-bg hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-default text-xs font-semibold text-primary flex items-center gap-1.5 transition-colors shrink-0 self-start cursor-pointer"
                        title="View official paper"
                      >
                        <span>Read Paper</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Grounded Citation Extract */}
                  <div className="p-4 rounded-xl bg-canvas-bg border border-border-default space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Empirical Extract / Abstract Finding
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {r.supporting_text || r.claim}
                    </p>
                  </div>

                  {/* Contextual Link to the Idea */}
                  <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-1 border-t border-border-default">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="text-text-secondary">Validation Provenance:</strong> Ingested into DIME corpus to verify foundational feasibility and theoretical boundaries for this concept.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
