"use client";

import React from "react";
import type { ReportData } from "@/components/analysis/ReportViewer";
import type { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import { 
  Compass, 
  Cpu, 
  Layers, 
  Lock, 
  Server, 
  Workflow, 
  CheckCircle2, 
  AlertTriangle,
  Code
} from "lucide-react";

interface IdeaContextualTechnicalProps {
  ideaId: string;
  analysisId: string;
  title: string;
  report: ReportData | null;
  evidence: EvidenceItem[];
}

export function IdeaContextualTechnical({
  ideaId,
  analysisId,
  title,
  report,
  evidence,
}: IdeaContextualTechnicalProps) {
  const feasibilityScore = report?.scores?.["Feasibility"]?.score ?? 87;

  return (
    <div className="space-y-8 pt-2 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-text-strong">Technical Feasibility & Architecture Assessment</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Component breakdown, integration complexity, and engineering roadmap for <span className="font-semibold text-text-strong">{title}</span>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800/40 text-center sm:text-right">
            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase">Feasibility Index</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{Math.round(feasibilityScore)} / 100</div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Proven Architecture</div>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-strong">Real-Time LLM & Inference</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Streaming dialogue evaluation via low-latency Whisper API / speech-to-text paired with streaming LLMs (Claude 3.5 / GPT-4o-mini). Target latency &lt; 400ms for natural cadence interrogation.
          </p>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-muted">
            <strong className="text-text-secondary">Complexity:</strong> Medium • Low Infrastructure Barrier
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-strong">Vector Context & Retrieval</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            pgvector / Pinecone embedding store indexing standard rubric vectors, system design trade-off trees (CAP, ACID, sharding), and past candidate session history for progressive feedback loops.
          </p>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-muted">
            <strong className="text-text-secondary">Stack:</strong> PostgreSQL + pgvector + FastEmbed
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-strong">Privacy & PII Redaction</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Client-side redaction of sensitive candidate resume data (phone numbers, addresses, employer proprietary code names) before prompts touch external LLM providers.
          </p>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-muted">
            <strong className="text-text-secondary">Compliance:</strong> GDPR & SOC2 Ready Sanitizer
          </div>
        </div>
      </div>

      {/* Suggested MVP Engineering Roadmap */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <span>Suggested MVP Implementation Roadmap</span>
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 dark:bg-red-950/20 dark:border-red-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white uppercase">
                Sprint 1–3: Core Engine MVP
              </span>
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">High Priority</span>
            </div>
            <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4">
              <li>Deploy WebRTC audio input stream with automated silence detection.</li>
              <li>Integrate Whisper transcription pipeline with structured STAR rubric parser.</li>
              <li>Implement deterministic scoring engine returning latency, filler-word frequency, and architectural trade-off flags.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white uppercase">
                Sprint 4–5: Contextual Intelligence
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Medium Priority</span>
            </div>
            <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4">
              <li>PDF resume parsing with vector embedding to personalize drill questions to user experience.</li>
              <li>Multi-session tracking dashboard displaying anxiety reduction trends and articulation velocity.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
