"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Layers, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Download,
  ExternalLink,
  Loader2
} from "lucide-react";

import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AgentActivityPanel from "@/components/analysis/AgentActivityPanel";
import SourceIngestionPanel from "@/components/analysis/SourceIngestionPanel";
import ReportViewer, { ReportData } from "@/components/analysis/ReportViewer";
import EvidenceExplorer, { EvidenceItem } from "@/components/analysis/EvidenceExplorer";
import { AgentPipelineOverlay } from "@/components/analysis/AgentPipelineOverlay";

import { IdeaWorkspaceHeader } from "@/components/workspace/IdeaWorkspaceHeader";
import { IdeaWorkspaceTabs, WorkspaceTabId, TabBadgeInfo } from "@/components/workspace/IdeaWorkspaceTabs";
import { ProductIntelligenceOverview } from "@/components/workspace/ProductIntelligenceOverview";
import { IdeaContextualMarket } from "@/components/workspace/IdeaContextualMarket";
import { IdeaContextualCompetition } from "@/components/workspace/IdeaContextualCompetition";
import { IdeaContextualTechnical } from "@/components/workspace/IdeaContextualTechnical";
import { IdeaContextualResearch } from "@/components/workspace/IdeaContextualResearch";
import { IdeaContextualRisks } from "@/components/workspace/IdeaContextualRisks";
import { IdeaContextualOpportunity } from "@/components/workspace/IdeaContextualOpportunity";
import { IdeaAnalysisHistory } from "@/components/workspace/IdeaAnalysisHistory";
import { IdeaContextualNotes } from "@/components/workspace/IdeaContextualNotes";

export default function UnifiedIdeaWorkspacePage(_props: {
  params?: Promise<{ ideaId: string; analysisId: string; subtab?: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const routeParams = useParams<{ ideaId: string; analysisId: string; subtab?: string }>();
  const ideaId = (routeParams?.ideaId as string) || "";
  const analysisId = (routeParams?.analysisId as string) || "";
  const subtab = routeParams?.subtab;

  const [analysisState, setAnalysisState] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(1);

  // Validate subtab from route or fallback to search query or "overview"
  const validTabs: WorkspaceTabId[] = [
    "overview",
    "market",
    "competition",
    "technical",
    "research",
    "risks",
    "opportunity",
    "evidence",
    "report",
    "activity",
    "history",
    "notes",
  ];

  // Base analysis URL preserving plural/singular routing convention
  const isPluralRoute = pathname?.includes("/analyses/");
  const baseAnalysisPath = isPluralRoute
    ? `/ideas/${ideaId}/analyses/${analysisId}`
    : `/ideas/${ideaId}/analysis/${analysisId}`;

  // Resolve active tab dynamically from route parameter, pathname segment, or query param
  const resolveActiveTab = (): WorkspaceTabId => {
    // 1. Direct param from [subtab] dynamic route
    if (subtab && validTabs.includes(subtab as WorkspaceTabId)) {
      return subtab as WorkspaceTabId;
    }
    // 2. Check path suffix (e.g. .../analyses/[analysisId]/market)
    const segments = pathname ? pathname.split("/").filter(Boolean) : [];
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && validTabs.includes(lastSeg as WorkspaceTabId)) {
      return lastSeg as WorkspaceTabId;
    }
    // 3. Fallback to query param (?tab=...)
    const queryTab = searchParams.get("tab") as WorkspaceTabId | null;
    if (queryTab && validTabs.includes(queryTab)) {
      return queryTab;
    }
    // 4. Default to overview for the base analysis route
    return "overview";
  };

  const activeTab = resolveActiveTab();

  // Navigation handler for programmatic tab switching
  const handleTabChange = (tab: WorkspaceTabId) => {
    const targetUrl = tab === "overview" 
      ? baseAnalysisPath 
      : `${baseAnalysisPath}/${tab}`;
    router.push(targetUrl);
  };

  // Helper to load report and evidence
  const loadReportAndEvidence = useCallback(async (targetId: string) => {
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
    }
  }, []);

  // Fetch history count for badge
  useEffect(() => {
    fetch(`/api/ideas/${ideaId}/analyses`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.analyses && Array.isArray(data.analyses)) {
          setHistoryCount(data.analyses.length);
        }
      })
      .catch(() => {});
  }, [ideaId]);

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
            domain: data.domain,
            target_audience: data.target_audience,
            created_at: data.created_at,
          });

          const isDone = data.status === "COMPLETED" || data.status === "completed";
          if (isDone) {
            isCompletedOrFailed = true;
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
              domain: data.domain,
              target_audience: data.target_audience,
              created_at: data.created_at,
            });
            if (data.status === "COMPLETED" || data.status === "completed") {
              isCompletedOrFailed = true;
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

    // 2. Setup SSE for live updates if running
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

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [analysisId, ideaId, loadReportAndEvidence]);

  // Handle Refresh Analysis (creates a new analysis run for this idea)
  const handleRefreshAnalysis = async () => {
    if (!analysisState) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ideas/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: ideaId,
          title: analysisState.title,
          description: analysisState.description,
          industry: analysisState.domain || "AI & Software Tech",
          targetAudience: analysisState.target_audience || "Engineers & Product Teams",
        }),
      });

      if (!res.ok) throw new Error("Failed to start re-analysis");
      const json = await res.json();
      const newAnalysisId = json.id;

      // Navigate to the newly launched analysis run
      router.push(`/ideas/${ideaId}/analysis/${newAnalysisId}`);
    } catch (e) {
      console.error("Error refreshing analysis:", e);
      alert("Failed to start new analysis run. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Export Report (JSON download)
  const handleExportReport = () => {
    if (!report) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `${(analysisState?.title || "DIME-Report").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-validation-report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12">
        <div className="bg-red-50 dark:bg-rose-950/30 text-red-600 dark:text-rose-400 p-6 rounded-2xl border border-red-200 dark:border-rose-900/40 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 font-semibold text-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-rose-400" />
            <span>Analysis Encountered an Error</span>
          </div>
          <p className="text-sm text-red-600/90 dark:text-rose-300">{error}</p>
          <div className="pt-2">
            <Link
              href="/ideas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-rose-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Ideas</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisState) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto animate-pulse flex flex-col gap-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2" />
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full mt-4" />
        <div className="h-96 bg-slate-50 dark:bg-slate-900 rounded-2xl mt-4" />
      </div>
    );
  }

  const isCompleted = analysisState.status === "COMPLETED" || analysisState.status === "completed";
  const isRunning = !isCompleted && analysisState.status !== "FAILED" && analysisState.status !== "failed";

  // While pipeline is executing, show ONLY the agent activity pipeline overlay without idea-specific tabs
  if (!isCompleted) {
    return (
      <AgentPipelineOverlay
        ideaId={ideaId}
        analysisId={analysisId}
        analysisState={analysisState}
        agents={agents}
        sources={sources}
        error={error}
        onViewReport={() => {
          setAnalysisState((prev: any) => ({ ...prev, status: "COMPLETED" }));
        }}
        onRetry={handleRefreshAnalysis}
      />
    );
  }

  // Compute Badges for Tabs dynamically with absolute authentic provenance
  const directCompetitorCount = report?.competitors?.filter((c: any) => 
    c.classification?.toLowerCase().includes("direct") || 
    c.relationship?.toLowerCase().includes("direct")
  ).length ?? report?.competitors?.length ?? 0;

  const researchCount = evidence.filter((e) => 
    e.evidence_type === "research" || 
    e.source_url?.includes("semanticscholar") || 
    e.source_url?.includes("arxiv") || 
    e.source_url?.includes("doi.org") ||
    e.source_url?.includes("pubmed") ||
    e.source_url?.includes("sciencedirect")
  ).length;

  const risksCount = report?.findings?.filter((f) => f.category === "risk").length ?? 0;

  const feasScore = report?.scores?.["Feasibility"]?.score;
  const technicalLabel = feasScore != null 
    ? (feasScore >= 70 ? "Feasible" : feasScore >= 45 ? "Moderate" : "Challenging")
    : "Feasible";

  const badges: TabBadgeInfo = {
    marketSources: evidence.length,
    competitionDirect: directCompetitorCount,
    technicalLabel: technicalLabel,
    researchPapers: researchCount,
    risksCount: risksCount,
    evidenceCount: evidence.length,
    historyCount: historyCount,
  };

  return (
    <div className="min-h-screen bg-canvas-bg text-text-strong overflow-x-hidden">
      <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
        {/* 1. Unified Idea Workspace Header */}
        <IdeaWorkspaceHeader
          ideaId={ideaId}
          analysisId={analysisId}
          title={analysisState.title}
          status={analysisState.status}
          updatedAt={analysisState.created_at}
          domain={analysisState.domain}
          targetAudience={analysisState.target_audience}
          onRefreshAnalysis={handleRefreshAnalysis}
          isRefreshing={isRefreshing}
          onExportReport={handleExportReport}
          onViewHistory={() => handleTabChange("history")}
        />

        {/* 2. Workspace Navigation Tabs (12 Contextual Tabs) */}
        <IdeaWorkspaceTabs
          activeTab={activeTab}
          basePath={baseAnalysisPath}
          onTabChange={handleTabChange}
          badges={badges}
        />

        {/* 3. Live Running Banner (when in progress) */}
        {isRunning && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                  Autonomous Validation in Progress: {analysisState.stage}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                  DIME agents are streaming evidence from GitHub, Semantic Scholar, and web indexes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTabChange("activity")}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold self-start sm:self-auto transition-colors shrink-0"
            >
              Inspect Live Pipeline ({analysisState.progress}%)
            </button>
          </div>
        )}

        {/* 4. Tab Content Area */}
        <div className="min-h-[500px]">
          {/* TAB 1: OVERVIEW (SCREEN A - EXACT MATCH TO IMAGE 2) */}
          {activeTab === "overview" && (
            <ProductIntelligenceOverview
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              description={analysisState.description}
              domain={analysisState.domain}
              report={report}
              evidence={evidence}
              onSwitchTab={handleTabChange}
              onExportReport={handleExportReport}
            />
          )}

          {/* TAB 2: MARKET INTELLIGENCE */}
          {activeTab === "market" && (
            <IdeaContextualMarket
              ideaId={ideaId}
              analysisId={analysisId}
            />
          )}

          {/* TAB 3: COMPETITION */}
          {activeTab === "competition" && (
            <IdeaContextualCompetition
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              report={report}
              evidence={evidence}
            />
          )}

          {/* TAB 4: TECHNICAL FEASIBILITY */}
          {activeTab === "technical" && (
            <IdeaContextualTechnical
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              report={report}
              evidence={evidence}
            />
          )}

          {/* TAB 5: RESEARCH & EVIDENCE */}
          {activeTab === "research" && (
            <IdeaContextualResearch
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              evidence={evidence}
            />
          )}

          {/* TAB 6: RISKS & RECOMMENDATIONS */}
          {activeTab === "risks" && (
            <IdeaContextualRisks
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              report={report}
              evidence={evidence}
              onSwitchTab={handleTabChange}
            />
          )}

          {/* TAB 7: OPPORTUNITY ASSESSMENT */}
          {activeTab === "opportunity" && (
            <IdeaContextualOpportunity
              ideaId={ideaId}
              analysisId={analysisId}
              title={analysisState.title}
              report={report}
            />
          )}

          {/* TAB 8: EVIDENCE EXPLORER */}
          {activeTab === "evidence" && (
            <div className="py-2">
              <EvidenceExplorer evidence={evidence} />
            </div>
          )}

          {/* TAB 9: DETAILED REPORT (SCREEN B - IMAGE 3) */}
          {activeTab === "report" && (
            <div className="py-2">
              {report ? (
                <ReportViewer
                  report={report}
                  ideaId={ideaId}
                  onViewEvidence={() => handleTabChange("evidence")}
                />
              ) : (
                <div className="py-16 text-center text-text-secondary">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Generating comprehensive report...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: AGENT ACTIVITY & PIPELINE */}
          {activeTab === "activity" && (
            <div className="space-y-8 py-2">
              <AnalysisPipeline
                stage={analysisState.stage}
                progress={analysisState.progress}
                status={analysisState.status}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <AgentActivityPanel activities={agents} />
                <SourceIngestionPanel sources={sources} />
              </div>
            </div>
          )}

          {/* TAB 11: ANALYSIS HISTORY */}
          {activeTab === "history" && (
            <IdeaAnalysisHistory
              ideaId={ideaId}
              currentAnalysisId={analysisId}
              onRunNewAnalysis={handleRefreshAnalysis}
            />
          )}

          {/* TAB 12: CONTEXTUAL NOTES */}
          {activeTab === "notes" && (
            <IdeaContextualNotes
              ideaId={ideaId}
              title={analysisState.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
