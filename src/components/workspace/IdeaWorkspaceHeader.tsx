"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  RotateCw, 
  Download, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  History,
  ExternalLink,
  Calendar
} from "lucide-react";

interface IdeaWorkspaceHeaderProps {
  ideaId: string;
  analysisId: string;
  title: string;
  status: string;
  updatedAt?: string | null;
  domain?: string | null;
  targetAudience?: string | null;
  onRefreshAnalysis?: () => void;
  isRefreshing?: boolean;
  onExportReport?: () => void;
  onViewHistory?: () => void;
}

export function IdeaWorkspaceHeader({
  ideaId,
  analysisId,
  title,
  status,
  updatedAt,
  domain,
  targetAudience,
  onRefreshAnalysis,
  isRefreshing = false,
  onExportReport,
  onViewHistory,
}: IdeaWorkspaceHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "18 Sep 2026";

  const isCompleted = status.toUpperCase() === "COMPLETED";
  const isRunning = ["PENDING", "RUNNING", "PLANNING", "RESEARCHING", "COMPETING", "SCORING"].includes(status.toUpperCase());
  const isFailed = status.toUpperCase() === "FAILED";

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-secondary text-xs sm:text-sm font-medium">
        <Link href="/ideas" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Ideas</span>
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-strong font-semibold truncate max-w-[200px] sm:max-w-xs">{title}</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary">Analysis</span>
      </nav>

      {/* 2. Main Title Row & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-strong tracking-tight truncate">
              {title}
            </h1>

            {/* Status Badge */}
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed
              </span>
            )}
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                Analyzing
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Failed
              </span>
            )}
          </div>

          {/* Metadata Subtitle Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              Last updated {formattedDate}
            </span>
            <span className="text-text-muted">•</span>
            <span className="px-2 py-0.5 rounded bg-canvas-bg border border-border-default font-medium text-text-strong">
              {domain || "AI & Software Tech"}
            </span>
            <span className="text-text-muted">•</span>
            <span className="px-2 py-0.5 rounded bg-canvas-bg border border-border-default font-medium text-text-strong">
              {targetAudience ? targetAudience.slice(0, 30) + (targetAudience.length > 30 ? "..." : "") : "Web Platform"}
            </span>
            <span className="text-text-muted">•</span>
            <span className="flex items-center gap-1 text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Standard Depth
            </span>
          </div>
        </div>

        {/* 3. Actions Button Group */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          {/* Refresh / Re-analyze Button */}
          <button
            type="button"
            onClick={onRefreshAnalysis}
            disabled={isRefreshing || isRunning}
            className="h-9 px-3.5 rounded-lg border border-border-default bg-surface-white hover:bg-canvas-bg text-text-strong text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            title="Run a new analysis cycle for this idea"
          >
            <RotateCw className={`w-3.5 h-3.5 text-text-secondary ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Starting..." : "Refresh Analysis"}</span>
          </button>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={onExportReport}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="h-9 w-9 rounded-lg border border-border-default bg-surface-white hover:bg-canvas-bg text-text-secondary hover:text-text-strong flex items-center justify-center transition-colors shadow-sm"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div 
                className="absolute right-0 top-11 w-52 bg-surface-white rounded-xl border border-border-default shadow-lg py-1.5 z-30 text-xs font-medium text-text-strong animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowMoreMenu(false)}
              >
                {onViewHistory && (
                  <button
                    type="button"
                    onClick={onViewHistory}
                    className="w-full px-3.5 py-2 text-left hover:bg-canvas-bg flex items-center gap-2 text-text-strong"
                  >
                    <History className="w-3.5 h-3.5 text-text-secondary" />
                    <span>View Analysis History</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExportReport}
                  className="w-full px-3.5 py-2 text-left hover:bg-canvas-bg flex items-center gap-2 text-text-strong"
                >
                  <FileText className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Download JSON Report</span>
                </button>
                <a
                  href={`http://localhost:8000/api/v1/analyses/${analysisId}/report`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3.5 py-2 text-left hover:bg-canvas-bg flex items-center gap-2 text-text-strong"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Raw API Endpoint</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
