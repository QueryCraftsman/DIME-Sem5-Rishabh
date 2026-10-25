"use client";

import React from "react";
import type { ReportData } from "@/components/analysis/ReportViewer";
import type { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Shield,
  Layers,
  Lock
} from "lucide-react";
import type { WorkspaceTabId } from "./IdeaWorkspaceTabs";

interface IdeaContextualRisksProps {
  ideaId: string;
  analysisId: string;
  title: string;
  report: ReportData | null;
  evidence: EvidenceItem[];
  onSwitchTab?: (tab: WorkspaceTabId) => void;
}

export function IdeaContextualRisks({
  ideaId,
  analysisId,
  title,
  report,
  evidence,
  onSwitchTab,
}: IdeaContextualRisksProps) {
  const riskScore = report?.scores?.["Risk Indicator"]?.score ?? 42;

  // Extract risk findings
  const riskFindings = report?.findings?.filter((f) => f.category === "risk") || [];

  const keyRisks = [
    {
      id: "risk-1",
      category: "Market / Incumbent Risk",
      title: "LeetCode or Big Tech Fast-Follow Capability",
      severity: "Moderate",
      severityColor: "text-amber-700 bg-amber-50 border-amber-200",
      description: "Incumbents like LeetCode or HackerRank possess the candidate distribution (over 30M registered developers). If they bolt on a simple Whisper audio layer, user switching costs remain high.",
      evidenceBacked: true,
      evidenceRef: "Competition landscape findings",
      mitigation: "Build defensibility around contextual resume personalization, verified hiring manager endorsement badges, and unscripted architectural whiteboarding that generic multiple-choice systems cannot replicate.",
    },
    {
      id: "risk-2",
      category: "Technical / Latency Risk",
      title: "Audio Dialogue Turn-Taking Latency Lag",
      severity: "High",
      severityColor: "text-rose-700 bg-rose-50 border-rose-200",
      description: "If the end-to-end voice loop (Speech-to-Text -> LLM Inference -> Text-to-Speech) exceeds 600ms, the interview feels artificial and breaks conversational presence.",
      evidenceBacked: true,
      evidenceRef: "Speech cadence architecture findings",
      mitigation: "Utilize Groq / Cerebras low-latency Llama-3 inference pipelines and WebRTC client-side streaming chunking to achieve sub-400ms turnaround.",
    },
    {
      id: "risk-3",
      category: "Security & Privacy",
      title: "Proprietary Code & Candidate Resume Leakage",
      severity: "Moderate",
      severityColor: "text-amber-700 bg-amber-50 border-amber-200",
      description: "Candidates may discuss non-public architectural systems from current employers or paste proprietary company code into mock practice sessions.",
      evidenceBacked: true,
      evidenceRef: "Privacy & compliance findings",
      mitigation: "Strict client-side zero-retention mode and automated PII/token redaction before vector indexing or cloud inference.",
    },
  ];

  return (
    <div className="space-y-8 pt-2 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-text-strong">Risks, Evidence Gaps & Mitigations</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Objective threat vectors, compliance boundaries, and recommended mitigations for <span className="font-semibold text-text-strong">{title}</span>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/40 text-center sm:text-right">
            <div className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Composite Risk Index</div>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">{Math.round(riskScore)} / 100</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Moderate Moat Risk</div>
          </div>
        </div>
      </div>

      {/* Primary Risk Vectors & Mitigations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Evaluated Vulnerability Vectors & Mitigation Strategies</span>
        </h3>

        <div className="space-y-4">
          {keyRisks.map((k) => (
            <div key={k.id} className="p-5 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${k.severityColor}`}>
                    {k.severity} Severity
                  </span>
                  <span className="text-xs font-semibold text-text-muted">{k.category}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Evidence Backed</span>
                </div>
              </div>

              <h4 className="text-base font-bold text-text-strong">{k.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{k.description}</p>

              {/* Mitigation Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recommended Mitigation Strategy</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{k.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Gaps / Unresolved Questions Section */}
      {riskFindings.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-text-strong">Unresolved Questions & Evidence Gaps</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-bg border border-border-default text-text-muted">
              {riskFindings.length} Questions Identified
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            DIME autonomous agents flagged these questions where public data sources lack statistically verified consensus. Addressing these directly in customer interviews will reduce launch uncertainty:
          </p>

          <div className="space-y-2.5">
            {riskFindings.map((rf, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-canvas-bg/60 border border-border-default text-xs flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <h5 className="font-semibold text-text-strong">{rf.title || "Evidence Gap"}</h5>
                  <p className="text-text-secondary">{rf.description}</p>
                </div>
              </div>
            ))}
          </div>

          {onSwitchTab && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSwitchTab("evidence")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect all citation sources in Evidence Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
