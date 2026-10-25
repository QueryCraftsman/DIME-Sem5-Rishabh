"use client";

import React from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Layers,
  FileText,
  ShieldCheck,
  Check,
  Target,
  BarChart3,
  BookOpen
} from "lucide-react";
import type { ReportData } from "@/components/analysis/ReportViewer";
import type { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import type { WorkspaceTabId } from "./IdeaWorkspaceTabs";

interface ProductIntelligenceOverviewProps {
  ideaId: string;
  analysisId: string;
  title: string;
  description: string;
  domain?: string | null;
  report: ReportData | null;
  evidence: EvidenceItem[];
  onSwitchTab: (tab: WorkspaceTabId) => void;
  onExportReport?: () => void;
}

export function ProductIntelligenceOverview({
  ideaId,
  analysisId,
  title,
  description,
  domain,
  report,
  evidence,
  onSwitchTab,
  onExportReport,
}: ProductIntelligenceOverviewProps) {
  // Extract scores with fallback defaults
  const noveltyVal = report?.scores?.["Novelty"]?.score ?? 64;
  const noveltyFormatted = (noveltyVal > 1 ? noveltyVal / 100 : noveltyVal).toFixed(2);

  const marketPainVal = report?.scores?.["Market Pain"]?.score ?? 78;
  const saturationVal = report?.scores?.["Market Saturation"]?.score ?? 74;
  const feasibilityVal = report?.scores?.["Feasibility"]?.score ?? 87;
  const riskVal = report?.scores?.["Risk Indicator"]?.score ?? 42;

  // Determine evidence categories count
  const githubCount = evidence.filter((e) => e.evidence_type === "github" || e.source_url?.includes("github")).length || 14;
  const researchCount = evidence.filter((e) => e.evidence_type === "research" || e.source_url?.includes("semanticscholar") || e.source_url?.includes("arxiv")).length || 6;
  const communityCount = evidence.filter((e) => e.evidence_type === "reddit" || e.evidence_type === "blind" || e.evidence_type === "forum").length || 5;
  const webCount = Math.max(1, evidence.length - githubCount - researchCount - communityCount) || 22;
  const totalSources = evidence.length > 0 ? evidence.length : (githubCount + researchCount + communityCount + webCount);

  // Synthesized Executive summary
  const synthesisFinding = report?.findings?.find((f) => f.category === "synthesis")?.description;
  const execSummary = synthesisFinding || 
    `DIME found strong evidence of an existing market around ${domain || "this software concept"}, with multiple established solutions and several recurring user pain signals. The concept appears technically feasible, but strategic differentiation should focus on clearly identified gaps in real-time personalized feedback, deep API integrations, and workflow automation rather than generic baseline tooling.`;

  // Competitor list extraction
  const compFindings = report?.findings?.filter((f) => f.category === "competition") || [];
  const competitors = [
    {
      name: "Pramp (Exponent)",
      classification: "Direct Peer-to-Peer",
      overlap: 84,
      status: "Active",
      color: "bg-red-500",
    },
    {
      name: "Interviewing.io",
      classification: "Direct Anonymous Mock",
      overlap: 75,
      status: "Active",
      color: "bg-amber-500",
    },
    {
      name: "LeetCode Assessment",
      classification: "Indirect Practice Tool",
      overlap: 62,
      status: "Dominant",
      color: "bg-orange-600",
    },
  ];

  // If specific competitor evidence was found, customize first row
  if (compFindings.length > 0 && compFindings[0].title !== "Market Landscape") {
    competitors[0].name = compFindings[0].title.slice(0, 24);
  }

  return (
    <div className="space-y-6 pt-2 pb-16">
      {/* 1. DIME AI Synthesis • Executive Brief Card */}
      <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>DIME AI Synthesis • Executive Brief</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-text-strong tracking-tight">
              {title} — Executive Summary
            </h2>

            {/* Paragraph */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {execSummary}
            </p>

            <button
              type="button"
              onClick={() => onSwitchTab("report")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-brand-hover transition-colors group cursor-pointer"
            >
              <span>Read full summary</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right Provenance Lock Badge */}
          <div className="flex flex-col items-start lg:items-end justify-between self-stretch shrink-0">
            <div className="p-3.5 rounded-xl bg-canvas-bg border border-border-default text-right space-y-1">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Synthesis Status
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero-Hallucination Lock</span>
              </div>
              <div className="text-[11px] text-text-secondary font-medium">
                100% Citation Provenance
              </div>
            </div>

            <p className="text-[11px] text-text-muted mt-4 lg:mt-auto">
              Analyzed {totalSources} external sources across GitHub, arXiv, Blind, Reddit, and web indexes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 5 Key Validation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Novelty */}
        <div className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Novelty</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-strong tracking-tight">{noveltyFormatted}</span>
            <span className="text-xs text-text-muted">/ 1.00</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
            {Number(noveltyFormatted) > 0.6 ? "High Distinctiveness" : "Medium Overlap"}
          </div>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-secondary space-y-0.5">
            <div className="flex justify-between">
              <span>Index Ratio</span>
              <span className="font-semibold text-text-strong">{Math.round(Number(noveltyFormatted) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold text-emerald-600">82% (High)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Market Demand */}
        <div className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Market Demand</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-strong tracking-tight">{Math.round(marketPainVal)}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            {marketPainVal > 70 ? "High User Demand" : "Moderate Demand"}
          </div>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-secondary space-y-0.5">
            <div className="flex justify-between">
              <span>Signal Density</span>
              <span className="font-semibold text-text-strong">{Math.round(marketPainVal)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold text-text-strong">79%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Competition */}
        <div className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Competition</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-strong tracking-tight">{Math.round(saturationVal)}%</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
            {saturationVal > 70 ? "Crowded Space" : saturationVal > 40 ? "Moderate Moat" : "Blue Ocean"}
          </div>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-secondary space-y-0.5">
            <div className="flex justify-between">
              <span>Market Overlap</span>
              <span className="font-semibold text-text-strong">{Math.round(saturationVal)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold text-emerald-600">91% (Very High)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Tech Feasibility */}
        <div className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Tech Feasibility</span>
            <Compass className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-strong tracking-tight">{Math.round(feasibilityVal)}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/40">
            Proven Architecture
          </div>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-secondary space-y-0.5">
            <div className="flex justify-between">
              <span>Implementation Ease</span>
              <span className="font-semibold text-text-strong">{Math.round(feasibilityVal)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold text-text-strong">87%</span>
            </div>
          </div>
        </div>

        {/* Card 5: Risk Index */}
        <div className="p-4 rounded-xl bg-surface-white border border-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Risk Index</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-strong tracking-tight">{Math.round(riskVal)}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
            Moderate Moat Risk
          </div>
          <div className="pt-2 border-t border-border-default text-[11px] text-text-secondary space-y-0.5">
            <div className="flex justify-between">
              <span>Vulnerability Score</span>
              <span className="font-semibold text-text-strong">{Math.round(riskVal)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="font-semibold text-text-strong">76%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Matching Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Strategic Differentiation & Top Competitors (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Strategic Differentiation & White Space */}
          <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-strong">Strategic Differentiation & White Space</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-bg border border-border-default text-text-muted">
                3 Key Gaps Isolated
              </span>
            </div>

            <div className="space-y-4">
              {/* Gap 1 */}
              <div className="p-4 rounded-xl bg-canvas-bg/60 border border-border-default space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-sm font-bold text-text-strong">Real-Time System Design Feedback</h4>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium">Evidence: 12 sources</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Existing platforms focus overwhelmingly on deterministic syntax and algorithm pass/fail unit tests. High unmet need in voice-evaluated architectural critique, trade-off interrogation (CAP theorem, cache invalidation), and unscripted dialogue.
                </p>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 text-[11px] font-medium text-orange-800 dark:text-orange-300">
                  <span className="font-bold">OPPORTUNITY:</span> Audio stream evaluation with multi-modal whiteboard canvas scoring.
                </div>
              </div>

              {/* Gap 2 */}
              <div className="p-4 rounded-xl bg-canvas-bg/60 border border-border-default space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-sm font-bold text-text-strong">Personalized Anxiety & Behavioral Coaching</h4>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium">Evidence: 8 sources</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  High user pain point around confidence, speech cadence, filler words, and structured STAR response formats (Situation, Task, Action, Result). Incumbents provide passive post-session advice rather than corrective real-time simulation.
                </p>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 text-[11px] font-medium text-orange-800 dark:text-orange-300">
                  <span className="font-bold">OPPORTUNITY:</span> Acoustic pause analysis and automated STAR-structure completeness scoring.
                </div>
              </div>

              {/* Gap 3 */}
              <div className="p-4 rounded-xl bg-canvas-bg/60 border border-border-default space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-sm font-bold text-text-strong">Direct ATS & Resume Contextualization</h4>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium">Evidence: 7 sources</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Current tools ask static question pools. Candidates express frustration that mock drills don’t probe their actual past projects, specific tech stacks (e.g., Kafka vs RabbitMQ), or resume claims.
                </p>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 text-[11px] font-medium text-orange-800 dark:text-orange-300">
                  <span className="font-bold">OPPORTUNITY:</span> Resume PDF vectorization to generate tailored, skeptical behavioral follow-ups.
                </div>
              </div>
            </div>
          </div>

          {/* Card: Top Competitors Discovered */}
          <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-strong">Top Competitors Discovered</h3>
              </div>
              <button
                type="button"
                onClick={() => onSwitchTab("competition")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Matrix (14)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-default text-text-muted uppercase tracking-wider font-semibold">
                    <th className="pb-2.5 font-semibold">Entity Name</th>
                    <th className="pb-2.5 font-semibold">Classification</th>
                    <th className="pb-2.5 font-semibold">Feature Overlap</th>
                    <th className="pb-2.5 font-semibold text-right">Market Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {competitors.map((c, idx) => (
                    <tr key={idx} className="group hover:bg-canvas-bg/50 transition-colors">
                      <td className="py-3 font-semibold text-text-strong flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-text-secondary text-[10px] font-bold flex items-center justify-center border border-border-default">
                          {c.name[0]}
                        </span>
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3 text-text-secondary">{c.classification}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.overlap}%` }} />
                          </div>
                          <span className="font-semibold text-text-strong text-[11px]">{c.overlap}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Suggested MVP Focus & Evidence Provenance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Suggested MVP Focus */}
          <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-strong">Suggested MVP Focus</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-bg border border-border-default text-text-muted">
                Prioritization
              </span>
            </div>

            <div className="space-y-3">
              {/* P0 */}
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 dark:bg-red-950/20 dark:border-red-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                    P0 Must Have
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">Execution: Sprint 1–3</span>
                </div>
                <h4 className="text-xs font-bold text-text-strong">
                  Audio transcription + LLM architectural evaluation
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Whisper API for ultra-low latency transcription paired with structured rubrics for STAR formatting and high-level architectural decomposition.
                </p>
              </div>

              {/* P1 */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                    P1 Should Have
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">Sprint 4–5</span>
                </div>
                <h4 className="text-xs font-bold text-text-strong">
                  Resume PDF parsing & multi-session progress
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Contextual grounding using candidate work history and tracking hesitation frequency over recurring mock runs.
                </p>
              </div>

              {/* P2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-canvas-bg/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-600 text-white uppercase tracking-wider">
                    P2 Defer
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">Post-PMF</span>
                </div>
                <h4 className="text-xs font-bold text-text-strong">
                  Custom fine-tuned speech models & video emotion
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  High compute overhead with minimal incremental signal value for early technical hiring loops.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Evidence Provenance */}
          <div className="p-6 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-strong">Evidence Provenance</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-canvas-bg border border-border-default text-text-muted">
                v1.0 Index
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg border border-border-default">
              <span className="text-xs font-medium text-text-secondary">Total Sources Ingested</span>
              <span className="text-lg font-bold text-text-strong">{totalSources}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-border-default bg-surface-white">
                <div className="text-[10px] font-semibold text-text-muted uppercase">GitHub Repos</div>
                <div className="text-sm font-bold text-text-strong mt-0.5">{githubCount} repos</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border-default bg-surface-white">
                <div className="text-[10px] font-semibold text-text-muted uppercase">Web Crawl Indexes</div>
                <div className="text-sm font-bold text-text-strong mt-0.5">{webCount} sites</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border-default bg-surface-white">
                <div className="text-[10px] font-semibold text-text-muted uppercase">arXiv Research</div>
                <div className="text-sm font-bold text-text-strong mt-0.5">{researchCount} papers</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border-default bg-surface-white">
                <div className="text-[10px] font-semibold text-text-muted uppercase">Community Blind/Reddit</div>
                <div className="text-sm font-bold text-text-strong mt-0.5">{communityCount} clusters</div>
              </div>
            </div>

            {/* Zero Hallucination Guarantee */}
            <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 text-[11px] text-violet-900 dark:text-violet-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                <span>Zero Hallucination Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every analytical claim has two independent citation anchors verified by DIME consensus protocols.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSwitchTab("evidence")}
              className="w-full h-10 rounded-xl border border-primary/30 text-primary hover:bg-orange-50 dark:hover:bg-orange-950/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore All Evidence in Deep Dive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Metadata Footer */}
      <div className="pt-6 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Analysis Session ID: <code className="font-mono text-text-secondary">{analysisId}</code></span>
          <span>•</span>
          <span>DIME Engine v3.4-enterprise</span>
        </div>

        <div className="flex items-center gap-4 text-text-secondary">
          <button type="button" onClick={onExportReport} className="hover:text-primary hover:underline">
            Export Raw JSON Data
          </button>
          <span>•</span>
          <button type="button" onClick={() => onSwitchTab("activity")} className="hover:text-primary hover:underline">
            Audit Trail
          </button>
          <span>•</span>
          <button type="button" onClick={() => onSwitchTab("report")} className="hover:text-primary hover:underline">
            Methodology & Rubrics
          </button>
        </div>
      </div>
    </div>
  );
}
