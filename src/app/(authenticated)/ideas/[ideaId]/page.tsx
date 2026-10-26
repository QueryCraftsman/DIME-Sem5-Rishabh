"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  RotateCw, 
  FileText, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function IdeaWorkspaceHomePage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { ideaId } = unwrappedParams;

  const [idea, setIdea] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAnalysis, setStartingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchIdeaAndAnalyses = async () => {
      setLoading(true);
      try {
        const [ideasRes, analysesRes] = await Promise.all([
          fetch("/api/ideas"),
          fetch(`/api/ideas/${ideaId}/analyses`),
        ]);

        if (ideasRes.ok) {
          const ideasList = await ideasRes.json();
          const found = Array.isArray(ideasList)
            ? ideasList.find((i: any) => i.id === ideaId)
            : ideasList.ideas?.find((i: any) => i.id === ideaId);
          if (mounted) setIdea(found || null);
        }

        if (analysesRes.ok) {
          const data = await analysesRes.json();
          const list = data.analyses || [];
          if (mounted) {
            setAnalyses(list);
            // If completed analysis exists, auto-redirect to latest run
            if (list.length > 0 && list[0]?.id) {
              router.replace(`/ideas/${ideaId}/analysis/${list[0].id}`);
              return;
            }
          }
        }
      } catch (e: any) {
        console.error("Error loading idea workspace:", e);
        if (mounted) setError(e.message || "Failed to load idea");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIdeaAndAnalyses();
    return () => {
      mounted = false;
    };
  }, [ideaId, router]);

  const handleStartAnalysis = async () => {
    if (!idea) return;
    setStartingAnalysis(true);
    try {
      const res = await fetch("/api/ideas/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          industry: idea.industry || "AI & Software Tech",
          targetAudience: idea.targetAudience || "Target Users",
        }),
      });

      if (!res.ok) throw new Error("Failed to start analysis");
      const json = await res.json();
      router.push(`/ideas/${ideaId}/analysis/${json.id}`);
    } catch (e) {
      console.error("Error starting analysis:", e);
      alert("Failed to start analysis. Please try again.");
    } finally {
      setStartingAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm font-medium">Resolving Idea Workspace...</span>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12">
        <div className="bg-surface-white p-8 rounded-2xl border border-border-default text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-text-muted mx-auto" />
          <h2 className="text-lg font-bold text-text-strong">Idea Not Found</h2>
          <p className="text-xs text-text-secondary">
            This idea could not be located in your workspace or has been removed.
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-hover"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to My Ideas</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-bg text-text-strong p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
          <Link href="/ideas" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Ideas</span>
          </Link>
          <span>/</span>
          <span className="text-text-strong font-semibold">{idea.title}</span>
        </nav>

        <div className="p-8 rounded-2xl bg-surface-white border border-border-default shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-canvas-bg border border-border-default text-text-muted">
                {idea.industry || "General Tech"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-strong tracking-tight">
                {idea.title}
              </h1>
              <p className="text-xs text-text-muted">
                Created on {new Date(idea.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={startingAnalysis}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {startingAnalysis ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Validation Analysis</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-canvas-bg/60 border border-border-default space-y-2">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Concept Description</div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-border-default bg-surface-white space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase">Target Audience</div>
              <div className="font-semibold text-text-strong">{idea.targetAudience || "Not specified"}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-border-default bg-surface-white space-y-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase">Validation Status</div>
              <div className="font-semibold text-text-strong flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{idea.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
