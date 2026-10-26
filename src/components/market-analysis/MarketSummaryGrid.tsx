import React from "react";
import { TrendingUp, ArrowUp, ShieldCheck, Clock } from "lucide-react";
import type { MarketSummaryMetrics } from "@/types/market-analysis";

interface MarketSummaryGridProps {
  summary: MarketSummaryMetrics;
}

export function MarketSummaryGrid({ summary }: MarketSummaryGridProps) {
  const { marketDemand, evidenceBase, confidenceScore, freshness } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Market Demand */}
      <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-text-secondary">
            Market Demand
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success-green border border-green-200">
            <TrendingUp className="w-3.5 h-3.5" />
            {marketDemand.badge}
          </span>
        </div>
        <div className="text-xl font-bold text-text-strong">
          {marketDemand.level}
        </div>
        <div className="flex items-center gap-1.5 mt-2 font-caption text-caption text-text-secondary">
          <ArrowUp className="w-4 h-4 text-success-green" />
          <span className="text-success-green font-semibold">
            {marketDemand.trendPercent}
          </span>{" "}
          {marketDemand.supportingSignal}
        </div>
      </div>

      {/* Card 2: Evidence Base */}
      <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-text-secondary">
            Evidence Base
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-canvas-bg text-text-secondary border border-border-default">
            {evidenceBase.badge}
          </span>
        </div>
        <div className="text-xl font-bold text-text-strong">
          {evidenceBase.totalSources} sources
        </div>
        <div className="flex items-center gap-2 mt-2 font-caption text-caption text-text-secondary">
          <span>{evidenceBase.redditBlindCount} Reddit/Blind</span> •{" "}
          <span>{evidenceBase.reviewsCount} Reviews</span> •{" "}
          <span>{evidenceBase.surveysResearchCount} Surveys</span>
        </div>
      </div>

      {/* Card 3: Confidence Score */}
      <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-text-secondary">
            Confidence Score
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-ai-purple-soft text-ai-purple border border-ai-purple-border">
            {confidenceScore.badge}
          </span>
        </div>
        <div className="text-xl font-bold text-text-strong">
          {confidenceScore.scorePercent}%
        </div>
        <div className="flex items-center gap-1.5 mt-2 font-caption text-caption text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-ai-purple" />
          <span>
            {confidenceScore.levelText} • {confidenceScore.provenanceClaim}
          </span>
        </div>
      </div>

      {/* Card 4: Analysis Freshness */}
      <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-md text-label-md text-text-secondary">
            Analysis Freshness
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success-green border border-green-200">
            {freshness.badge}
          </span>
        </div>
        <div className="text-xl font-bold text-text-strong">
          {freshness.displayDate}
        </div>
        <div className="flex items-center gap-1.5 mt-2 font-caption text-caption text-text-secondary">
          <Clock className="w-4 h-4 text-text-muted" />
          <span>{freshness.relativeCrawlText}</span>
        </div>
      </div>
    </div>
  );
}
