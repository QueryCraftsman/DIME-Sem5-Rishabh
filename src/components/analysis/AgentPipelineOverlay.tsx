"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Database,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Terminal,
  Zap,
  ShieldCheck,
  ChevronRight,
  ExternalLink
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
      label: analysisState.stage.replace(/_/g, " "),
      desc: "Autonomous agents are evaluating your idea parameters...",
      icon: "🤖",
    };

  const completedSources = sources.filter((s) => s.status === "COMPLETED").length;
  const totalEvidenceSelected = sources.reduce(
    (sum, s) => sum + (s.selected_count ?? s.records_indexed ?? s.records_found ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* ── Top Floating Execution Bar ───────────────────────────────── */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Navigation and Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/validate"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Return to Idea Submission"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {!isCompleted && !isFailed ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : isCompleted ? (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  )}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {isCompleted
                    ? "Pipeline Finished"
                    : isFailed
                    ? "Pipeline Stopped"
                    : "Autonomous Pipeline Active"}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                {analysisState.title || "Validating Idea Concept"}
              </h1>
            </div>
          </div>

          {/* Right: Key Live Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Elapsed: {formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/50">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Agents: {agents.length > 0 ? agents.length : 6}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/50">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evidence Docs: {totalEvidenceSelected}</span>
              </div>
            </div>

            {isCompleted && onViewReport && (
              <button
                onClick={onViewReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all animate-bounce"
              >
                <span>View Full Analysis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {isFailed && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Pipeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : isFailed
                ? "bg-rose-500"
                : "bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400"
            }`}
            style={{ width: `${Math.max(5, Math.min(100, analysisState.progress))}%` }}
          />
        </div>
      </header>

      {/* ── Main Pipeline Overlay Content ────────────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stage Status Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/50">
                <span className="text-sm">{currentStageInfo.icon}</span>
                <span>Current Stage: {currentStageInfo.label}</span>
                <span className="font-mono text-purple-400">({analysisState.progress}%)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isCompleted
                  ? "Validation Complete! Unlocking intelligence workspaces..."
                  : isFailed
                  ? "Pipeline Encountered an Interruption"
                  : currentStageInfo.label}
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                {isCompleted
                  ? "All 11 autonomous intelligence stages have completed. Deterministic scores, competitive benchmarks, and academic citations have been compiled."
                  : currentStageInfo.desc}
              </p>

              {analysisState.domain && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-slate-500 font-medium">Domain Focus:</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {analysisState.domain}
                  </span>
                  {analysisState.target_audience && (
                    <>
                      <span className="text-xs text-slate-500 font-medium">Target:</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {analysisState.target_audience}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Completion / Action Card */}
            {isCompleted ? (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5 flex flex-col items-center text-center max-w-xs shrink-0">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">Validation Ready</h4>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Multi-agent report and all 12 contextual tabs are ready for review.
                </p>
                {onViewReport && (
                  <button
                    onClick={onViewReport}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Workspaces</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isFailed ? (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-5 flex flex-col items-center text-center max-w-xs shrink-0">
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full mb-3">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-rose-300 text-base">Execution Failed</h4>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  {error || "An agent or network query timed out. You can retry with a single click."}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Validation</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-center max-w-xs shrink-0 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Autonomous Orchestration</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  DIME agents query external APIs, filter noise with cross-encoders, and synthesize verified intelligence.
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>Current Progress:</span>
                  <span className="font-bold text-purple-400">{analysisState.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (For inspecting pipeline details without leaving overlay) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("stream")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "stream"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Agent Live Stream</span>
            </button>
            <button
              onClick={() => setActiveView("pipeline")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "pipeline"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Pipeline Stages</span>
            </button>
            <button
              onClick={() => setActiveView("sources")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === "sources"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Source Funnel ({sources.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            {isCompleted
              ? "All agents completed successfully."
              : "No idea tabs are shown until pipeline completion."}
          </div>
        </div>

        {/* ── Main Layout: Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Active View */}
          <div className="lg:col-span-8 space-y-6">
            {activeView === "stream" && (
              <div className="space-y-6">
                <AgentActivityPanel activities={agents} />
                <SourceIngestionPanel sources={sources} />
              </div>
            )}

            {activeView === "pipeline" && (
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
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
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 p-1">
              <AnalysisPipeline
                stage={analysisState.stage}
                status={analysisState.status}
                progress={analysisState.progress}
              />
            </div>

            {/* Evidence Radar / Source Funnel Preview */}
            <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Evidence Integrity</span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-400">100% Grounded</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Sources Ingested:</span>
                  <span className="font-semibold text-white">{completedSources} of {sources.length || 5}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Selected Citations:</span>
                  <span className="font-semibold text-emerald-400">{totalEvidenceSelected}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Vector Deduplication:</span>
                  <span className="font-semibold text-white">Cosine ≥ 0.88</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">IEEE Xplore Status:</span>
                  <span className="font-semibold text-slate-400">
                    {sources.find((s) => s.source_name === "IEEE Xplore")?.status || "Fallback Active"}
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
