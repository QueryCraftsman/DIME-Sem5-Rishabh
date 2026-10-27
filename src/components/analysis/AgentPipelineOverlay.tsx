"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Database,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AgentActivityPanel from "@/components/analysis/AgentActivityPanel";
import SourceIngestionPanel from "@/components/analysis/SourceIngestionPanel";

interface AgentPipelineOverlayProps {
  ideaId: string;
  analysisId: string;
  analysisState: {
    title: string;
    description?: string;
    domain?: string;
    target_audience?: string;
    status: string;
    stage: string;
    progress: number;
    created_at?: string;
  };
  agents: any[];
  sources: any[];
  error?: string | null;
  onViewReport?: () => void;
  onRetry?: () => void;
}

const STAGE_DESCRIPTIONS: Record<string, { label: string; desc: string; icon: string }> = {
  INITIALIZING: {
    label: "System Initialization",
    desc: "Bootstrapping multi-agent session, embedding engine, and vector index.",
    icon: "⚡",
  },
  IDEA_UNDERSTANDING: {
    label: "Idea Understanding & Decomposition",
    desc: "Extracting core value proposition, problem statements, target personas, and domain boundaries.",
    icon: "🧠",
  },
  QUERY_PLANNING: {
    label: "Query Planning",
    desc: "Formulating targeted semantic search queries across academic databases, open-source repositories, and web indexes.",
    icon: "🔍",
  },
  ACQUIRING: {
    label: "Multi-Source Evidence Acquisition",
    desc: "Querying GitHub, Semantic Scholar, Crossref, and industry indexes in parallel for real evidence.",
    icon: "🌐",
  },
  PROCESSING: {
    label: "Normalization & Vector Indexing",
    desc: "Cleaning snippets, generating dense embeddings, and storing evidence vectors in Qdrant.",
    icon: "📊",
  },
  PLANNING: {
    label: "Research Planning",
    desc: "Synthesizing evidence requirements and preparing research vectors for specialized evaluation agents.",
    icon: "📋",
  },
  RESEARCHING: {
    label: "Market & Academic Research",
    desc: "Examining market trends, citation graphs, demand signals, and relevant technical papers.",
    icon: "📚",
  },
  ANALYZING_COMPETITION: {
    label: "Competition & Landscape Analysis",
    desc: "Benchmarking existing competitors, pricing models, feature parity, and positioning gaps.",
    icon: "⚔️",
  },
  SYNTHESIZING: {
    label: "Evidence Synthesis",
    desc: "Cross-referencing insights, verifying grounded claims, and evaluating product viability.",
    icon: "🔬",
  },
  SCORING: {
    label: "Deterministic Scoring",
    desc: "Calculating mathematical Feasibility, Market Pain, Saturation, and Opportunity scores (0-100).",
    icon: "🎯",
  },
  COMPLETED: {
    label: "Validation Completed",
    desc: "All multi-agent evaluations synthesized into an actionable intelligence report.",
    icon: "✨",
  },
};

export function AgentPipelineOverlay({
  ideaId,
  analysisId,
  analysisState,
  agents,
  sources,
  error,
  onViewReport,
  onRetry,
}: AgentPipelineOverlayProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeView, setActiveView] = useState<"stream" | "pipeline" | "sources">("stream");

  // Live timer while running
  useEffect(() => {
    const isDone = analysisState.status === "COMPLETED" || analysisState.status === "completed";
    const isFailed = analysisState.status === "FAILED" || analysisState.status === "failed";
    if (isDone || isFailed) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [analysisState.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCompleted =
    analysisState.status === "COMPLETED" || analysisState.status === "completed";
  const isFailed =
    analysisState.status === "FAILED" || analysisState.status === "failed" || Boolean(error);

  const currentStageInfo =
    STAGE_DESCRIPTIONS[analysisState.stage] || {
      label: analysisState.stage?.replace(/_/g, " ") || "Processing",
      desc: "Autonomous agents are evaluating your idea parameters...",
      icon: "🤖",
    };

  const completedSources = sources.filter((s) => s.status?.toUpperCase() === "COMPLETED").length;
  const totalEvidenceSelected = sources.reduce(
    (sum, s) => sum + (s.selected_count ?? s.records_indexed ?? s.records_found ?? 0),
    0
  );

  const ieeeSource = sources.find(
    (s) => s.source_name === "IEEE Xplore" || s.source_name?.toLowerCase().includes("ieee")
  );

  const getIeeeStatusText = () => {
    if (!ieeeSource) return "Fallback Active";
    if (ieeeSource.status === "COMPLETED") return `Active (${ieeeSource.selected_count || 0} cited)`;
    if (ieeeSource.status === "RUNNING") return "Querying...";
    if (ieeeSource.status === "FAILED") return "Fallback Active";
    if (ieeeSource.status === "SKIPPED") return "Skipped (Fallback Active)";
    return "Pending Query";
  };

  return (
    <div className="min-h-full bg-[#FAF7F2] dark:bg-[#141311] text-slate-900 dark:text-[#F4F0E9] flex flex-col font-sans transition-colors selection:bg-orange-500 selection:text-white">
      {/* ── Top Execution Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-md border-b border-[#EAE4DC] dark:border-[#2E2A25] px-4 sm:px-6 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Navigation and Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/validate"
              className="p-2 rounded-xl bg-white dark:bg-[#201E1B] hover:bg-stone-100 dark:hover:bg-[#26231F] text-slate-600 dark:text-[#C1B8AD] hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/80 dark:border-[#34302B] shadow-2xs shrink-0"
              title="Return to Idea Submission"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  {!isCompleted && !isFailed ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : isCompleted ? (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  )}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  {isCompleted
                    ? "Pipeline Finished"
                    : isFailed
                    ? "Pipeline Interrupted"
                    : "Autonomous Pipeline Active"}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {analysisState.title || "Validating Idea Concept"}
              </h1>
            </div>
          </div>

          {/* Right: Key Live Stats & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-medium">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#201E1B] border border-slate-200/80 dark:border-[#34302B] text-slate-600 dark:text-[#C1B8AD]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">Elapsed: {formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/30 text-dime-orange dark:text-orange-400 font-semibold">
                <Bot className="w-3.5 h-3.5 text-dime-orange" />
                <span>Agents: {agents.length > 0 ? agents.length : 6}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/30 text-dime-blue dark:text-blue-400 font-semibold">
                <Database className="w-3.5 h-3.5 text-dime-blue" />
                <span>Evidence Docs: {totalEvidenceSelected}</span>
              </div>
            </div>

            {isCompleted && onViewReport && (
              <button
                onClick={onViewReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dime-orange hover:bg-[#d04b08] text-white font-semibold text-xs shadow-sm hover:shadow transition-all active:scale-95"
              >
                <span>View Full Analysis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {isFailed && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Pipeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-2.5 w-full bg-slate-100 dark:bg-[#26231F] h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              isCompleted
                ? "bg-emerald-500"
                : isFailed
                ? "bg-rose-500"
                : "bg-dime-orange"
            }`}
            style={{ width: `${Math.max(5, Math.min(100, analysisState.progress))}%` }}
          />
        </div>
      </header>

      {/* ── Main Pipeline Overlay Content ────────────────────────────── */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stage Status Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#34302B] bg-white dark:bg-[#201E1B] p-6 md:p-7 shadow-xs transition-colors">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-dime-orange via-amber-500 to-orange-400" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-dime-orange dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/40">
                <span className="text-sm">{currentStageInfo.icon}</span>
                <span>Current Stage: {currentStageInfo.label}</span>
                <span className="font-mono text-dime-orange font-bold">({analysisState.progress}%)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isCompleted
                  ? "Validation Complete! Unlocking intelligence workspaces..."
                  : isFailed
                  ? "Pipeline Encountered an Interruption"
                  : currentStageInfo.label}
              </h2>

              <p className="text-sm text-slate-600 dark:text-[#C1B8AD] leading-relaxed">
                {isCompleted
                  ? "All 11 autonomous intelligence stages have completed. Deterministic scores, competitive benchmarks, and academic citations have been compiled."
                  : currentStageInfo.desc}
              </p>

              {analysisState.domain && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Domain Focus:</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#26231F] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#34302B]">
                    {analysisState.domain}
                  </span>
                  {analysisState.target_audience && (
                    <>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">Target:</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#26231F] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#34302B]">
                        {analysisState.target_audience}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Completion / Action Card */}
            {isCompleted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-5 flex flex-col items-center text-center max-w-xs shrink-0">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full mb-2.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Validation Ready</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-3">
                  Multi-agent report and all 12 contextual intelligence tabs are ready.
                </p>
                {onViewReport && (
                  <button
                    onClick={onViewReport}
                    className="w-full py-2 px-4 rounded-xl bg-dime-orange hover:bg-[#d04b08] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open Workspaces</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isFailed ? (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl p-5 flex flex-col items-center text-center max-w-xs shrink-0">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full mb-2.5">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">Execution Interrupted</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-3">
                  {error || "An agent or query encountered an interruption. You can retry with a single click."}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Validation</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-stone-50/80 dark:bg-[#26231F] border border-slate-200/80 dark:border-[#34302B] rounded-xl p-4 flex flex-col justify-center max-w-xs shrink-0 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-dime-orange" />
                  <span>Autonomous Orchestration</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  DIME agents query external APIs, filter noise with cross-encoders, and synthesize verified intelligence.
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-[#34302B]">
                  <span>Current Progress:</span>
                  <span className="font-bold text-dime-orange">{analysisState.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (Consistent segmented controls matching DIME theme) */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#2E2A25] pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-[#26231F] rounded-xl border border-slate-200/60 dark:border-[#34302B]">
            <button
              onClick={() => setActiveView("stream")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "stream"
                  ? "bg-white dark:bg-[#201E1B] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-[#34302B]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-dime-orange" />
              <span>Agent Live Stream</span>
            </button>
            <button
              onClick={() => setActiveView("pipeline")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "pipeline"
                  ? "bg-white dark:bg-[#201E1B] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-[#34302B]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-dime-orange" />
              <span>Pipeline Stages</span>
            </button>
            <button
              onClick={() => setActiveView("sources")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "sources"
                  ? "bg-white dark:bg-[#201E1B] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-[#34302B]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-dime-orange" />
              <span>Source Funnel ({sources.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block font-medium">
            {isCompleted
              ? "All agents completed successfully."
              : "No idea tabs are shown until pipeline completion."}
          </div>
        </div>

        {/* ── Main Layout: Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Active View */}
          <div className="lg:col-span-8 space-y-6">
            {activeView === "stream" && (
              <div className="space-y-6">
                <AgentActivityPanel activities={agents} />
                <SourceIngestionPanel sources={sources} />
              </div>
            )}

            {activeView === "pipeline" && (
              <div className="border border-slate-200/80 dark:border-[#34302B] rounded-2xl overflow-hidden bg-white dark:bg-[#201E1B] shadow-xs">
                <AnalysisPipeline
                  stage={analysisState.stage}
                  status={analysisState.status}
                  progress={analysisState.progress}
                />
              </div>
            )}

            {activeView === "sources" && (
              <div className="space-y-6">
                <SourceIngestionPanel sources={sources} />
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Pipeline Stage Monitor */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stage Timeline */}
            <div className="border border-slate-200/80 dark:border-[#34302B] rounded-2xl overflow-hidden bg-white dark:bg-[#201E1B] shadow-xs">
              <AnalysisPipeline
                stage={analysisState.stage}
                status={analysisState.status}
                progress={analysisState.progress}
              />
            </div>

            {/* Evidence Integrity Panel */}
            <div className="border border-slate-200/80 dark:border-[#34302B] rounded-2xl bg-white dark:bg-[#201E1B] p-5 space-y-4 shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Evidence Integrity</span>
                </h4>
                {totalEvidenceSelected > 0 ? (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                    Verified Grounded
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
                    Awaiting Evidence
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-[#C1B8AD]">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2E2A25]">
                  <span className="text-slate-500 dark:text-slate-400">Sources Ingested:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {completedSources} of {sources.length || 5}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2E2A25]">
                  <span className="text-slate-500 dark:text-slate-400">Selected Citations:</span>
                  <span
                    className={`font-semibold ${
                      totalEvidenceSelected > 0
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {totalEvidenceSelected}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#2E2A25]">
                  <span className="text-slate-500 dark:text-slate-400">Vector Deduplication:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Cosine ≥ 0.88 (Qdrant)
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">IEEE Xplore Status:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {getIeeeStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
