"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Layers, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Download,
  ExternalLink
} from "lucide-react";

import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AgentActivityPanel from "@/components/analysis/AgentActivityPanel";
import SourceIngestionPanel from "@/components/analysis/SourceIngestionPanel";
import ReportViewer, { ReportData } from "@/components/analysis/ReportViewer";
import EvidenceExplorer, { EvidenceItem } from "@/components/analysis/EvidenceExplorer";

export default function AnalysisProgressPage({
  params,
}: {
  params: Promise<{ ideaId: string; analysisId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { ideaId, analysisId } = unwrappedParams;

  const [analysisState, setAnalysisState] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "evidence" | "pipeline">("pipeline");
  const [loadingReport, setLoadingReport] = useState(false);

  // Helper to load report and evidence
  const loadReportAndEvidence = async (targetId: string) => {
    setLoadingReport(true);
    try {
      const [reportRes, evidenceRes] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/analyses/${targetId}/report`),
        fetch(`http://localhost:8000/api/v1/analyses/${targetId}/evidence`),
      ]);

      if (reportRes.ok) {
        const reportData = await reportRes.json();
        setReport(reportData);
      }
      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        setEvidence(evidenceData.evidence || []);
      }
    } catch (e) {
      console.error("Error loading report and evidence:", e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    let isCompletedOrFailed = false;

    // 1. Fetch initial state
    const fetchInitialState = async () => {
      try {
        const [analysisRes, agentsRes, sourcesRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/analyses/${analysisId}`),
          fetch(`http://localhost:8000/api/v1/analyses/${analysisId}/agents`),
          fetch(`http://localhost:8000/api/v1/analyses/${analysisId}/sources`),
        ]);

        if (analysisRes.ok) {
          const data = await analysisRes.json();
          setAnalysisState({
            status: data.status,
            stage: data.current_stage || "PENDING",
            progress: data.progress ?? 0,
            title: data.title,
            description: data.description,
          });

          const isDone = data.status === "COMPLETED" || data.status === "completed";
          if (isDone) {
            isCompletedOrFailed = true;
            setActiveTab("report");
            loadReportAndEvidence(analysisId);
          }
        } else {
          // Fallback to ideaId if analysisId failed
          const fallbackRes = await fetch(`http://localhost:8000/api/v1/analyses/${ideaId}`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setAnalysisState({
              status: data.status,
              stage: data.current_stage || "PENDING",
              progress: data.progress ?? 0,
              title: data.title,
              description: data.description,
            });
            if (data.status === "COMPLETED" || data.status === "completed") {
              isCompletedOrFailed = true;
              setActiveTab("report");
              loadReportAndEvidence(ideaId);
            }
          } else {
            setError("Failed to load analysis");
          }
        }

        if (agentsRes.ok) {
          const data = await agentsRes.json();
          setAgents(data.agents || []);
        }
        if (sourcesRes.ok) {
          const data = await sourcesRes.json();
          setSources(data.sources || []);
        }
      } catch (e) {
        console.error("Error fetching initial state", e);
        setError("Network error connecting to analysis backend");
      }
    };

    fetchInitialState();

    // 2. Setup SSE for live updates
    const eventSource = new EventSource(
      `http://localhost:8000/api/v1/analyses/${analysisId}/events`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "analysis_status") {
          setAnalysisState((prev: any) => ({
            ...prev,
            status: data.status,
            stage: data.stage,
            progress: data.progress ?? 0,
          }));

          const isDone = data.status === "COMPLETED" || data.status === "completed";
          const isFailed = data.status === "FAILED" || data.status === "failed";

          if (isDone) {
            eventSource.close();
            setActiveTab("report");
            loadReportAndEvidence(analysisId);
          } else if (isFailed) {
            eventSource.close();
          }
        } else if (data.type === "agent_activity") {
          setAgents((prev) => [...prev, data.data]);
        } else if (data.type === "source_ingestion") {
          setSources((prev) => {
            const index = prev.findIndex((s) => s.source_name === data.data.source_name);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = data.data;
              return updated;
            }
            return [...prev, data.data];
          });
        }
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    eventSource.onerror = (e) => {
      // In development or if completed, eventSource might close
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [analysisId, ideaId]);

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          <div className="flex items-center gap-3 font-semibold text-lg mb-2">
            <AlertCircle className="w-5 h-5" />
            Analysis Encountered an Error
          </div>
          <p className="text-sm">{error}</p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisState) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mt-8"></div>
      </div>
    );
  }

  const isCompleted = analysisState.status === "COMPLETED" || analysisState.status === "completed";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto font-sans pb-24 space-y-8">
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isCompleted ? "Analysis Report & Validation" : "Analyzing Your Concept"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {isCompleted
                ? "DIME autonomous validation engine completed. Review scores, evidence, and report."
                : "DIME is actively querying sources, retrieving citations, and scoring the concept in real time."}
            </p>
          </div>
        </div>

        {/* View Mode Tabs (Available once completed or anytime to inspect progress) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          {isCompleted && (
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "report"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-orange-600" />
              Report & Scores
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => setActiveTab("evidence")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "evidence"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              Evidence ({evidence.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pipeline"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            {isCompleted ? "Agent Execution Log" : "Live Pipeline"}
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Validation Complete: Report Generated
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Deterministic scores, agent activities, and multi-source citations are available for review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`/api/export/pdf?ideaId=${ideaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          </div>
        </div>
      )}

      {/* TAB 1: Report Viewer */}
      {activeTab === "report" && (
        <div>
          {report ? (
            <ReportViewer 
              report={report} 
              ideaId={ideaId} 
              onViewEvidence={() => setActiveTab("evidence")} 
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Loading validated report...
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Evidence Explorer */}
      {activeTab === "evidence" && (
        <div>
          <EvidenceExplorer evidence={evidence} isLoading={loadingReport} />
        </div>
      )}

      {/* TAB 3: Pipeline, Agent Activities, and Sources */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Area (8 cols) - Agent Activity & Sources */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <AgentActivityPanel activities={agents} />
            <SourceIngestionPanel sources={sources} />
          </div>

          {/* Right Sidebar Area (4 cols) - Pipeline */}
          <div className="lg:col-span-4 relative">
            <div className="lg:sticky lg:top-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
              <AnalysisPipeline
                stage={analysisState.stage}
                status={analysisState.status}
                progress={analysisState.progress}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
