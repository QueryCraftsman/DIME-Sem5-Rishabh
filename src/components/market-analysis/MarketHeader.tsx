"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketIntelligenceIdea } from "@/types/market-analysis";

interface MarketHeaderProps {
  idea: MarketIntelligenceIdea;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
}

export function MarketHeader({
  idea,
  onRefresh,
  onExport,
  isRefreshing = false,
}: MarketHeaderProps) {
  return (
    <>
      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-text-secondary font-label-md text-label-md mb-3"
      >
        <Link href="/ideas" className="hover:text-text-strong transition-colors">
          My Ideas
        </Link>
        <ChevronRight className="w-4 h-4 text-text-muted" />
        <Link
          href={`/ideas/${idea.id}`}
          className="hover:text-text-strong transition-colors"
        >
          {idea.title}
        </Link>
        <ChevronRight className="w-4 h-4 text-text-muted" />
        <span className="text-text-strong font-body-semibold text-body-semibold">
          Market Intelligence
        </span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-text-strong">
              Market Intelligence
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-soft text-brand-pressed border border-brand-pale">
              Idea: {idea.title}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-canvas-bg text-text-secondary border border-border-default">
              {idea.platform || "Web App"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-canvas-bg text-text-secondary border border-border-default">
              Updated {idea.updatedDate}
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Evidence-backed demand and user pain signals relevant to this idea.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-10 px-4 rounded-lg bg-surface-white border border-border-default hover:bg-canvas-bg text-text-strong font-body-semibold text-body-semibold flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            type="button"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>

          <button
            onClick={onExport}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-brand-hover text-white font-body-semibold text-body-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <Download className="w-4 h-4" />
            <span>Export Market Signals</span>
          </button>
        </div>
      </div>
    </>
  );
}
