"use client";

import React, { useState } from "react";
import { 
  Search, 
  ExternalLink, 
  FileText, 
  Globe, 
  Github, 
  BookOpen, 
  Filter, 
  Layers, 
  Check, 
  Copy,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

export interface EvidenceItem {
  id: string;
  evidence_type: string;
  claim: string;
  supporting_text?: string | null;
  source_url?: string | null;
  source_title?: string | null;
  confidence: number;
  relevance_score: number;
  chunk_id?: string | null;
  document_id?: string | null;
}

interface EvidenceExplorerProps {
  evidence: EvidenceItem[];
  isLoading?: boolean;
}

export default function EvidenceExplorer({ evidence, isLoading = false }: EvidenceExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getSourceIcon = (url?: string | null, type?: string) => {
    const lowerType = (type || "").toLowerCase();
    const lowerUrl = (url || "").toLowerCase();
    if (lowerType === "github" || lowerType === "repository" || lowerUrl.includes("github.com")) return Github;
    if (lowerType === "research" || lowerUrl.includes("semanticscholar.org") || lowerUrl.includes("crossref.org") || lowerUrl.includes("ieee.org") || lowerUrl.includes("arxiv.org")) {
      return BookOpen;
    }
    if (lowerType === "web" || lowerUrl.includes("http")) return Globe;
    return FileText;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Types available in current evidence
  const uniqueTypes = ["all", ...Array.from(new Set(evidence.map(e => e.evidence_type.toLowerCase())))];

  // Filtering
  const filteredEvidence = evidence.filter((item) => {
    const matchesType = selectedType === "all" || item.evidence_type.toLowerCase() === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q || 
      (item.claim && item.claim.toLowerCase().includes(q)) ||
      (item.supporting_text && item.supporting_text.toLowerCase().includes(q)) ||
      (item.source_title && item.source_title.toLowerCase().includes(q)) ||
      (item.source_url && item.source_url.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              Evidence Explorer
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect grounded source citations, paper extracts, and code repositories backing this analysis.
            </p>
          </div>

          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {filteredEvidence.length} of {evidence.length} Evidence Records
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search evidence claims, citations, or URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedType === type
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
            No Evidence Matches
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery 
              ? "Try adjusting your search query or removing filters to view indexed sources."
              : "No evidence records were stored for this analysis yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvidence.map((item) => {
            const Icon = getSourceIcon(item.source_url, item.evidence_type);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {item.source_title || "Primary Research Document"}
                      </h4>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 inline-flex items-center gap-1 mt-0.5 line-clamp-1 break-all"
                        >
                          {item.source_url}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 self-start">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {item.evidence_type}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      {Math.round(item.confidence * 100)}% Conf
                    </span>
                    {item.relevance_score > 0 && (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                        {Math.round(item.relevance_score * 100)}% Rel
                      </span>
                    )}
                  </div>
                </div>

                {/* Claim / Extract */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 my-3">
                  <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                    Grounded Claim / Citation
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {item.claim}
                  </p>
                </div>

                {item.supporting_text && item.supporting_text !== item.claim && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-2 italic bg-slate-50/50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    "{item.supporting_text}"
                  </div>
                )}

                {/* Footer with chunk ID */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Citation ID:</span>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                      {item.chunk_id || item.id}
                    </code>
                    <button
                      onClick={() => handleCopy(item.chunk_id || item.id, item.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy citation ID"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
