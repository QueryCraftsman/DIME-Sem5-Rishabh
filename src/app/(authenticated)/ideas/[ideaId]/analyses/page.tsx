"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IdeaAnalysisHistory } from "@/components/workspace/IdeaAnalysisHistory";

export default function IdeaAnalysesHistoryPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const unwrappedParams = use(params);
  const { ideaId } = unwrappedParams;

  return (
    <div className="min-h-screen bg-canvas-bg text-text-strong p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1240px] mx-auto space-y-6">
        <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
          <Link href="/ideas" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Ideas</span>
          </Link>
          <span>/</span>
          <Link href={`/ideas/${ideaId}`} className="hover:text-primary">
            Workspace
          </Link>
          <span>/</span>
          <span className="text-text-strong font-semibold">Analysis History</span>
        </nav>

        <IdeaAnalysisHistory
          ideaId={ideaId}
          currentAnalysisId=""
        />
      </div>
    </div>
  );
}
