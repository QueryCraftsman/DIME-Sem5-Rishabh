"use client";

import React from "react";
import Link from "next/link";
import type { AnalysisTabsData } from "@/types/market-analysis";

interface AnalysisTabsProps {
  tabs: AnalysisTabsData;
  ideaId: string;
}

export function AnalysisTabs({ tabs, ideaId }: AnalysisTabsProps) {
  return (
    <div className="border-b border-border-default mb-8">
      <div className="flex items-center gap-8 overflow-x-auto">
        <Link
          className="pb-3 font-label-md text-label-md text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent whitespace-nowrap"
          href={tabs.overviewHref || `/ideas/${ideaId}`}
        >
          Overview
        </Link>
        <div className="pb-3 font-body-semibold text-body-semibold text-primary border-b-2 border-primary flex items-center gap-2 whitespace-nowrap cursor-default">
          <span>Market</span>
          <span className="w-2 h-2 rounded-full bg-primary" />
        </div>
        <Link
          className="pb-3 font-label-md text-label-md text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/competition?ideaId=${ideaId}`}
        >
          <span>Competition</span>
          <span className="px-1.5 py-0.2 rounded text-[11px] bg-canvas-bg border border-border-default text-text-muted">
            {tabs.competitionCount}
          </span>
        </Link>
        <Link
          className="pb-3 font-label-md text-label-md text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/ideas/${ideaId}#technical`}
        >
          <span>Technical</span>
          <span className="text-xs text-success-green font-medium">
            {tabs.technicalLabel}
          </span>
        </Link>
        <Link
          className="pb-3 font-label-md text-label-md text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/research?ideaId=${ideaId}`}
        >
          <span>Research</span>
          <span className="px-1.5 py-0.2 rounded text-[11px] bg-canvas-bg border border-border-default text-text-muted">
            {tabs.researchCount}
          </span>
        </Link>
        <Link
          className="pb-3 font-label-md text-label-md text-text-secondary hover:text-text-strong transition-colors border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap"
          href={`/ideas/${ideaId}#risks`}
        >
          <span>Risks &amp; Recommendations</span>
          <span className="px-1.5 py-0.2 rounded text-[11px] bg-warning-soft border border-amber-200 text-warning-amber">
            {tabs.risksCount} risks
          </span>
        </Link>
      </div>
    </div>
  );
}
