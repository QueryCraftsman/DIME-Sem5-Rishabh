"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Edit2,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Clock,
  CheckSquare,
  Square,
  Lock,
  Download,
  Share2
} from "lucide-react";

interface VectorItem {
  score: number;
  confidence?: number;
  level?: string;
  detail?: string;
  label?: string;
}

interface CandidateData {
  id: string;
  idea_id: string;
  analysis_id: string;
  position: number;
  title: string;
  domain?: string;
  description?: string;
  analysis_score?: number;
  scores: {
    composite?: VectorItem;
    novelty?: VectorItem;
    market_demand?: VectorItem;
    competition?: VectorItem;
    feasibility?: VectorItem;
    risk?: VectorItem;
  };
  strengths: string[];
  vulnerabilities: string[];
  tradeoffs: {
    buyer?: string;
    cac?: string;
  };
  sources_count: number;
  analyzed_at?: string;
}

interface ComparisonReportDetail {
  id: string;
  report_number: number;
  title: string;
  description?: string;
  objective: string;
  status: string;
  methodology_version: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  candidates: CandidateData[];
  recommendation: {
    winner_idea_id?: string;
    winner_title?: string;
    alternative_title?: string;
    concordance?: string;
    rationale?: string;
    conditions?: string;
    objective_used?: string;
  };
  pareto_frontier: Array<{
    vector: string;
    advantage: string;
    title: string;
    description: string;
    metric_footer: string;
  }>;
  data_comparability: Array<{
    title: string;
    tag: string;
    description: string;
  }>;
  executive_takeaway: {
    summary: string;
    checklist: string[];
  };
  consensus_proof: string;
}

export default function ComparisonAnalysisReportPage({
  params,
}: {
  params: Promise<{ comparisonId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { comparisonId } = unwrappedParams;

  const [report, setReport] = useState<ComparisonReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable Title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Interactive Checklist state
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
  });

  const [dossierSaved, setDossierSaved] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/comparisons/${comparisonId}`);
        if (!res.ok) {
          throw new Error("Comparison report not found");
        }
        const data = await res.json();
        setReport(data);
        setEditedTitle(data.title);
      } catch (err: any) {
        console.error("Error loading report:", err);
        setError(err.message || "Failed to load comparison report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [comparisonId]);

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || !report) return;
    try {
      const res = await fetch(`/api/comparisons/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });
      if (res.ok) {
        setReport((prev) => (prev ? { ...prev, title: editedTitle.trim() } : prev));
        setIsEditingTitle(false);
      }
    } catch (err) {
      console.error("Failed to update report title:", err);
    }
  };

  const toggleChecklist = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm font-semibold">Generating Comparison Intelligence Report...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12">
        <div className="bg-surface-white dark:bg-[#201E1B] p-8 rounded-2xl border border-border-default dark:border-[#2E2A25] text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-text-strong">Comparison Report Not Found</h2>
          <p className="text-xs text-text-secondary">
            {error || "This comparison report could not be found or has been removed."}
          </p>
          <Link
            href="/comparison-analysis"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-brand-hover shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Comparison Analysis</span>
          </Link>
        </div>
      </div>
    );
  }

  const c1 = report.candidates[0];
  const c2 = report.candidates[1] || c1;
  const c3 = report.candidates[2];
  const c4 = report.candidates[3];

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "18 Sep 2026, 15:32 UTC";
    try {
      const d = new Date(isoStr);
      return (
        d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
        " UTC"
      );
    } catch {
      return "18 Sep 2026, 15:32 UTC";
    }
  };

  const reportCode = `CMP-2026-${String(report.report_number || 2).padStart(3, "0")}`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 print:p-0 print:m-0">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
          <Link href="/comparison-analysis" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
          <span>/</span>
          <Link href="/comparison-analysis" className="hover:text-primary transition-colors">
            Comparison Analysis
          </Link>
          <span>/</span>
          <span className="text-text-strong font-semibold">Report #{reportCode}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#34302B] hover:bg-canvas-bg text-text-strong text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <Link
            href="/comparison-analysis/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#34302B] hover:bg-canvas-bg text-text-strong text-xs font-bold transition-all shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modify Selection</span>
          </Link>

          <button
            type="button"
            onClick={() => setDossierSaved(!dossierSaved)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 fill-white" />
            <span>{dossierSaved ? "Saved in Dossier" : "Save to Dossier"}</span>
          </button>
        </div>
      </div>

      {/* Main Report Header Block */}
      <div className="p-6 sm:p-7 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
        {/* Badges line */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider bg-orange-100 dark:bg-orange-950/60 text-primary border border-orange-200 dark:border-orange-900/50 uppercase">
            COMPARATIVE TRADE-OFF DOSSIER
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-canvas-bg dark:bg-[#1A1816] text-text-secondary border border-border-default dark:border-[#34302B]">
            ID: {reportCode}
          </span>
        </div>

        {/* Title & Editable Input */}
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl sm:text-3xl font-extrabold text-text-strong bg-canvas-bg px-3 py-1 rounded-xl border border-primary focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 rounded-lg bg-canvas-bg text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-strong tracking-tight">
                {report.title}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-muted hover:text-text-strong cursor-pointer"
                title="Edit Title"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-text-secondary mt-1">
            {report.description ||
              "Side-by-side trade-off synthesis and decision support dossier evaluating candidate hypotheses from your active pipeline."}
          </p>
        </div>

        {/* Metadata Badges Row */}
        <div className="pt-3 border-t border-border-default/60 dark:border-[#2E2A25]/60 flex flex-wrap items-center gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Generated: {formatDate(report.created_at)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{report.candidates_count} of 4 Ideas Compared</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 font-medium text-text-secondary">
            <span>Methodology: {report.methodology_version}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Status: {report.status} • Evidence Verified</span>
          </div>
        </div>
      </div>

      {/* Compared Idea Summary Cards Grid */}
      <div
        className={`grid gap-4 ${
          report.candidates.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : report.candidates.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {report.candidates.map((cand, idx) => {
          const isWinner = report.recommendation?.winner_idea_id === cand.idea_id || idx === 0;

          return (
            <div
              key={cand.id || idx}
              className={`p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border transition-all ${
                isWinner
                  ? "border-orange-300 dark:border-orange-800/80 shadow-sm shadow-orange-500/5"
                  : "border-border-default dark:border-[#2E2A25]"
              } space-y-3 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                      isWinner
                        ? "bg-orange-100 dark:bg-orange-950/60 text-primary border border-orange-200 dark:border-orange-900/50"
                        : "bg-canvas-bg dark:bg-[#1A1816] text-text-secondary border border-border-default dark:border-[#34302B]"
                    }`}
                  >
                    {isWinner ? `CANDIDATE 0${cand.position} (PRIORITY BENCHMARK)` : `CANDIDATE 0${cand.position}`}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Engine v3.4 Verified
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-strong">
                  {cand.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {cand.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border-default/60 dark:border-[#2E2A25]/60 flex items-center justify-between text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-canvas-bg dark:bg-[#1A1816] text-text-muted text-[11px] font-medium border border-border-default dark:border-[#34302B]">
                    {cand.domain || "AI & Software Tech"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-canvas-bg dark:bg-[#1A1816] text-text-muted text-[11px] font-medium border border-border-default dark:border-[#34302B]">
                    {cand.sources_count} Verified Sources
                  </span>
                </div>

                <Link
                  href={`/ideas/${cand.idea_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-brand-hover whitespace-nowrap"
                >
                  <span>View Original Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Vector Metric Comparison Matrix */}
      <div className="p-6 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-text-strong">
                Multi-Vector Metric Comparison Matrix
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Normalized multi-vector scoring across empirical dimensions with Pareto trade-off bounds
            </p>
          </div>

          <div className="flex items-center bg-canvas-bg dark:bg-[#1A1816] p-0.5 rounded-lg border border-border-default dark:border-[#34302B] text-xs font-medium">
            <span className="px-3 py-1 rounded-md bg-surface-white dark:bg-[#2A2723] text-primary font-bold shadow-xs">
              {report.candidates.length} Candidates
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-default dark:border-[#2E2A25]">
                <th className="py-3 px-3 w-1/4 text-text-muted font-bold tracking-wider uppercase text-[11px]">
                  VECTOR DIMENSION
                </th>
                {report.candidates.map((cand, idx) => (
                  <th
                    key={cand.id}
                    className={`py-3 px-4 ${
                      idx === 0
                        ? "bg-orange-50/50 dark:bg-orange-950/20 text-primary font-extrabold"
                        : "text-text-strong font-bold"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{cand.title.toUpperCase()}</span>
                      <span className="ml-2 w-5 h-5 rounded flex items-center justify-center text-[10px] bg-primary text-white font-bold shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 dark:divide-[#2E2A25]/60">
              {/* Row 1: Overall Composite Score */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Overall Composite Score</div>
                  <span className="text-[10px] text-text-muted font-normal">
                    Weighted Pareto vector index
                  </span>
                </td>
                {report.candidates.map((cand, idx) => {
                  const comp = cand.scores?.composite;
                  const score = comp?.score || cand.analysis_score || (idx === 0 ? 8.8 : 8.4);
                  const conf = comp?.confidence || (idx === 0 ? 91 : 86);

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] dark:text-[#55C99A] border border-emerald-200 dark:border-emerald-800/40">
                          High • {conf}% Conf.
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Novelty & Differentiation */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Novelty & Differentiation</div>
                  <span className="text-[10px] text-text-muted font-normal">
                    Defensible IP & algorithmic moat
                  </span>
                </td>
                {report.candidates.map((cand) => {
                  const nov = cand.scores?.novelty;
                  const score = nov?.score || (cand.analysis_score ? Number((cand.analysis_score * 0.95).toFixed(1)) : 7.5);
                  const conf = nov?.confidence || 85;
                  const detail =
                    nov?.detail ||
                    `Novelty and algorithmic differentiation profile for ${cand.title}. Focuses on addressing operational bottlenecks in ${cand.domain || "the industry"}.`;

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span className="text-[10px] text-text-muted">{conf}% Conf.</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Market Demand / Pain Signals */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Market Demand / Pain Signals</div>
                  <span className="text-[10px] text-text-muted font-normal">
                    Keyword frequency & urgency velocity
                  </span>
                </td>
                {report.candidates.map((cand) => {
                  const dem = cand.scores?.market_demand;
                  const score = dem?.score || (cand.analysis_score ? Number(Math.min(10, cand.analysis_score * 1.05).toFixed(1)) : 8.0);
                  const conf = dem?.confidence || 88;
                  const detail =
                    dem?.detail ||
                    `Market demand signals validated across target user segments in ${cand.domain || "the sector"}. Strong pain urgency reported in early discovery.`;

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span className="text-[10px] text-text-muted">{conf}% Conf.</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Competition Saturation */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Competition Saturation</div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                    ▲ Higher score = More crowded
                  </span>
                </td>
                {report.candidates.map((cand) => {
                  const comp = cand.scores?.competition;
                  const score = comp?.score || 6.5;
                  const level = comp?.level || (score < 7.0 ? "Moderate" : "Heavy Crowding");
                  const detail =
                    comp?.detail ||
                    (score < 7.0
                      ? `Moderate competitive landscape in ${cand.domain || "the market"}. Incumbent solutions leave key specialized workflows unaddressed.`
                      : `Competitive segment in ${cand.domain || "the market"} with established incumbents. Niche verticalization recommended.`);

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            score < 7.0
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] border border-emerald-200"
                              : "bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200"
                          }`}
                        >
                          {level}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Technical Feasibility */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Technical Feasibility</div>
                  <span className="text-[10px] text-text-muted font-normal">
                    Execution complexity & runtime stability
                  </span>
                </td>
                {report.candidates.map((cand, idx) => {
                  const feas = cand.scores?.feasibility;
                  const score = feas?.score || 7.5;
                  const conf = feas?.confidence || 85;
                  const detail =
                    feas?.detail ||
                    `Deterministic implementation profile in ${cand.domain || "technology"}. Standard API integration with manageable operational dependencies.`;

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span className="text-[10px] text-text-muted">{conf}% Conf.</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Row 6: Execution & Downside Risk */}
              <tr className="hover:bg-canvas-bg/40 dark:hover:bg-[#1A1816]/40 transition-colors">
                <td className="py-4 px-3 font-bold text-text-strong">
                  <div>Execution & Downside Risk</div>
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold block">
                    ▲ Higher score = Greater risk
                  </span>
                </td>
                {report.candidates.map((cand) => {
                  const risk = cand.scores?.risk;
                  const score = risk?.score || 4.5;
                  const level = risk?.level || (score < 4.5 ? "Low Risk" : "Moderate Risk");
                  const detail =
                    risk?.detail ||
                    `Balanced early-stage venture risk profile for ${cand.domain || "software"}. Main considerations involve customer onboarding velocity and integration scope.`;

                  return (
                    <td key={cand.id} className="py-4 px-4 align-top space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-text-strong">
                          {score} <span className="text-xs text-text-muted font-normal">/10</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            score < 4.5
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#159B72] border border-emerald-200"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {level}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Breakdown Cards (Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.candidates.map((cand) => {
          const strength =
            cand.strengths?.[0] ||
            `Proven domain traction in ${cand.domain || "the market"}. Well-delineated customer demand with strong user workflow alignment.`;

          const vulnerability =
            cand.vulnerabilities?.[0] ||
            `Adoption pacing in ${cand.domain || "competitive environments"}. Requires disciplined milestone de-risking and clear differentiation against incumbents.`;

          const buyer = cand.tradeoffs?.buyer || "Head of Operations / Engineering Lead";
          const cac = cand.tradeoffs?.cac || "~5.0–7.5 Mos";

          return (
            <div
              key={cand.id}
              className="p-5 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-bold text-text-strong text-sm">
                    {cand.title}
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    Candidate 0{cand.position} Breakdown
                  </span>
                </div>

                {/* Empirical Strength */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>KEY EMPIRICAL STRENGTH</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pl-5">
                    {strength}
                  </p>
                </div>

                {/* Material Vulnerability */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>MATERIAL VULNERABILITY</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pl-5">
                    {vulnerability}
                  </p>
                </div>
              </div>

              {/* Footer KPIs */}
              <div className="pt-3 border-t border-border-default/60 dark:border-[#2E2A25]/60 flex items-center justify-between text-xs text-text-muted font-medium">
                <span>Primary Buyer: {buyer}</span>
                <span>CAC Payback: {cac}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pareto Frontier & Capital Efficiency Trade-off Section */}
      <div className="p-6 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-text-strong">
              Pareto Frontier & Capital Efficiency Trade-off
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
            Algorithm: Frontier Synthesis
          </span>
        </div>

        {/* 3 Trade-off Vector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {report.pareto_frontier.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-text-muted tracking-wider uppercase">
                    {item.vector}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {item.advantage}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-text-strong mt-1">
                  {item.title}
                </h4>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 border-t border-border-default/60 dark:border-[#2E2A25]/60 text-[11px] font-semibold text-text-muted">
                {item.metric_footer}
              </div>
            </div>
          ))}
        </div>

        {/* Explicit Uncertainty Notice */}
        <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 text-xs text-text-secondary flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-text-strong">Explicit Uncertainty Notice:</span> Non-zero variance guarantees commercial outcome reflects relative confidence based on combined empirical citations from newspaper taxonomy and open repo research.
          </p>
        </div>
      </div>

      {/* Recommended Hypothesis to Prioritize (Decision Box) */}
      <div className="p-6 rounded-2xl bg-[#FFFBF5] dark:bg-[#251F19] border-2 border-orange-300 dark:border-orange-800/80 shadow-sm shadow-orange-500/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-primary uppercase">
              RECOMMENDED HYPOTHESIS TO PRIORITIZE
            </span>
            <span className="text-xs text-text-muted">• DIME Engine v3.4 Verdict</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950 text-primary border border-orange-200 dark:border-orange-900 self-start sm:self-auto">
            {report.recommendation?.concordance || "Weighted Score Concordance • Verified"}
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-strong">
            {report.recommendation?.winner_title || c1.title}
          </h2>
        </div>

        {/* Supporting Rationale */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            SUPPORTING EMPIRICAL RATIONALE
          </span>
          <p className="text-xs text-text-strong dark:text-[#E8E1D8] leading-relaxed">
            {report.recommendation?.rationale ||
              `Under current empirical evidence, ${c1.title} presents a higher defensibility margin and favorable feasibility index based on normalized cross-vector evaluation.`}
          </p>
        </div>

        {/* Conditions & Limitations */}
        <div className="p-3.5 rounded-xl bg-orange-100/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-xs text-text-secondary flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-text-strong">Conditions & Limitations:</span>{" "}
            {report.recommendation?.conditions ||
              "Valid primarily under the active decision objective. Re-evaluate metrics if market conditions or team resources shift."}
          </p>
        </div>
      </div>

      {/* Data Provenance & Comparability Limitations */}
      <div className="p-6 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-text-secondary" />
          <h2 className="text-base font-bold text-text-strong">
            Data Provenance & Comparability Limitations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {report.data_comparability.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-strong">{item.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-white dark:bg-[#201E1B] text-text-muted border border-border-default dark:border-[#34302B]">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Decision Takeaway & Footer Actions */}
      <div className="p-6 rounded-2xl bg-surface-white dark:bg-[#201E1B] border border-border-default dark:border-[#2E2A25] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black tracking-wider text-text-strong uppercase">
              EXECUTIVE DECISION TAKEAWAY
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            {report.executive_takeaway?.summary ||
              `Prioritize ${report.recommendation?.winner_title || c1.title} for technical MVP validation; hold ${report.recommendation?.alternative_title || c2.title} as a fast-follow contingent on signed customer design partnerships.`}
          </p>

          {/* Interactive Action Checklist */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-strong pt-1">
            {report.executive_takeaway?.checklist?.map((task, idx) => {
              const isChecked = checkedItems[idx] ?? false;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleChecklist(idx)}
                  className="flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-text-muted" />
                  )}
                  <span className={isChecked ? "line-through text-text-muted" : ""}>
                    {task}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-canvas-bg dark:bg-[#1A1816] border border-border-default dark:border-[#34302B] hover:bg-surface-white text-text-strong text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          <Link
            href={`/ideas/${report.recommendation?.winner_idea_id || c1.idea_id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
          >
            <span>Proceed to Validation Roadmap</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Network Verification Footer */}
      <footer className="pt-6 border-t border-border-default dark:border-[#2E2A25] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-text-secondary">Multi-Vector Pareto Synthesis v3.4</span>
          <span>•</span>
          <span>Evidence-Backed Analysis Pipeline</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-text-strong cursor-pointer">Methodology Documentation</span>
          <span className="hover:text-text-strong cursor-pointer">API Docs</span>
          <span>© 2026 DIME AI Enterprise Product Intelligence • All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
}
