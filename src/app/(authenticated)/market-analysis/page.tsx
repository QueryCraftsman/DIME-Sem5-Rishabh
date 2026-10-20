"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { MarketIntelligencePayload } from "@/types/market-analysis";
import { MarketHeader } from "@/components/market-analysis/MarketHeader";
import { AnalysisTabs } from "@/components/market-analysis/AnalysisTabs";
import { MarketSummaryGrid } from "@/components/market-analysis/MarketSummaryGrid";
import { DemandSignalsCard } from "@/components/market-analysis/DemandSignalsCard";
import { QualitativePainSignals } from "@/components/market-analysis/QualitativePainSignals";
import { PainPointsRanking } from "@/components/market-analysis/PainPointsRanking";
import { SentimentBreakdown } from "@/components/market-analysis/SentimentBreakdown";
import { VerifiedEvidenceInspector } from "@/components/market-analysis/VerifiedEvidenceInspector";
import { StrategicOpportunityCard } from "@/components/market-analysis/StrategicOpportunityCard";

function MarketAnalysisContent() {
  const searchParams = useSearchParams();
  const ideaId = searchParams.get("ideaId") || "";
  const analysisId = searchParams.get("analysisId") || "";

  const [data, setData] = useState<MarketIntelligencePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedPainPointIndex, setSelectedPainPointIndex] = useState<number>(0);

  const fetchMarketData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const query = new URLSearchParams();
      if (ideaId) query.set("ideaId", ideaId);
      if (analysisId) query.set("analysisId", analysisId);

      const res = await fetch(`/api/market-analysis/intelligence?${query.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load market intelligence data: ${res.statusText}`);
      }
      const json: MarketIntelligencePayload = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Error fetching market intelligence:", err);
      setError(err?.message || "Failed to load market intelligence data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [ideaId, analysisId]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const handleExport = () => {
    window.location.href = `/api/market-analysis/export?format=csv&ideaId=${encodeURIComponent(ideaId)}`;
  };

  const handleRefresh = () => {
    fetchMarketData(true);
  };

  if (loading) {
    return <MarketAnalysisLoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-[1600px] w-full">
        <div className="p-8 bg-surface-white rounded-xl border border-border-default text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-danger-red">
            error
          </span>
          <h2 className="text-xl font-bold text-text-strong">
            Unable to load Market Intelligence
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            {error || "Market analysis data is currently unavailable for this concept."}
          </p>
          <button
            onClick={() => fetchMarketData()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-body-semibold text-sm hover:bg-brand-hover transition-colors"
          >
            Retry Analysis Fetch
          </button>
        </div>
      </div>
    );
  }

  const selectedPainPoint =
    data.painPoints[selectedPainPointIndex] || data.painPoints[0];

  return (
    <div className="p-8 max-w-[1600px] w-full">
      {/* 1. BREADCRUMB & PAGE HEADER */}
      <MarketHeader
        idea={data.idea}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />

      {/* 2. ANALYSIS NAVIGATION TABS */}
      <AnalysisTabs tabs={data.tabs} ideaId={data.idea.id} />

      {/* 3. TOP SUMMARY ROW: 4 KEY METRIC CARDS */}
      <MarketSummaryGrid summary={data.summary} />

      {/* 4. MAIN LAYOUT GRID (65% Left Column, 35% Right Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 columns in 12-col grid) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Card 1: Demand Signals Chart */}
          <DemandSignalsCard data={data.demandChart} />

          {/* Card 2: Qualitative Pain Signals */}
          <QualitativePainSignals signals={data.qualitativeSignals} />

          {/* Card 3: Top Pain Points by Citation Volume */}
          <PainPointsRanking
            items={data.painPoints}
            selectedIndex={selectedPainPointIndex}
            onSelect={(idx) => setSelectedPainPointIndex(idx)}
          />
        </div>

        {/* RIGHT COLUMN (4 columns in 12-col grid) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          {/* Card 1: Sentiment Breakdown */}
          <SentimentBreakdown data={data.sentiment} />

          {/* Card 2: Verified Evidence Inspector */}
          <VerifiedEvidenceInspector
            item={selectedPainPoint}
            ideaId={data.idea.id}
          />

          {/* Card 3: Strategic Opportunity Callout */}
          <StrategicOpportunityCard opportunity={data.strategicOpportunity} />
        </div>
      </div>
    </div>
  );
}

function MarketAnalysisLoadingSkeleton() {
  return (
    <div className="p-8 max-w-[1600px] w-full animate-pulse space-y-6">
      <div className="h-6 w-64 bg-slate-200 rounded" />
      <div className="h-10 w-96 bg-slate-200 rounded" />
      <div className="h-10 w-full bg-slate-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 bg-slate-100 rounded-xl" />
        <div className="lg:col-span-4 h-96 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function MarketAnalysisPage() {
  return (
    <React.Suspense fallback={<MarketAnalysisLoadingSkeleton />}>
      <MarketAnalysisContent />
    </React.Suspense>
  );
}
