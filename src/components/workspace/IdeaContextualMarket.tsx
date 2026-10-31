"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { MarketIntelligencePayload } from "@/types/market-analysis";
import { MarketSummaryGrid } from "@/components/market-analysis/MarketSummaryGrid";
import { DemandSignalsCard } from "@/components/market-analysis/DemandSignalsCard";
import { QualitativePainSignals } from "@/components/market-analysis/QualitativePainSignals";
import { PainPointsRanking } from "@/components/market-analysis/PainPointsRanking";
import { SentimentBreakdown } from "@/components/market-analysis/SentimentBreakdown";
import { VerifiedEvidenceInspector } from "@/components/market-analysis/VerifiedEvidenceInspector";
import { StrategicOpportunityCard } from "@/components/market-analysis/StrategicOpportunityCard";
import { Loader2, AlertCircle } from "lucide-react";

interface IdeaContextualMarketProps {
  ideaId: string;
  analysisId: string;
}

export function IdeaContextualMarket({ ideaId, analysisId }: IdeaContextualMarketProps) {
  const [data, setData] = useState<MarketIntelligencePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPainPointIndex, setSelectedPainPointIndex] = useState<number>(0);

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
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
    }
  }, [ideaId, analysisId]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm font-medium">Loading idea market intelligence...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-surface-white border border-border-default text-center space-y-3 my-6">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-text-strong">Unable to load Market Intelligence</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          {error || "Market signals are currently unavailable for this specific concept."}
        </p>
        <button
          onClick={() => fetchMarketData()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const selectedPainPoint =
    data.painPoints[selectedPainPointIndex] || data.painPoints[0];

  return (
    <div className="space-y-6 pt-2 pb-16">
      {/* 1. Summary Grid */}
      <MarketSummaryGrid summary={data.summary} />

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <DemandSignalsCard data={data.demandChart} />
          <QualitativePainSignals signals={data.qualitativeSignals} />
          <PainPointsRanking
            items={data.painPoints}
            selectedIndex={selectedPainPointIndex}
            onSelect={(idx: number) => setSelectedPainPointIndex(idx)}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          <SentimentBreakdown data={data.sentiment} />
          <VerifiedEvidenceInspector
            item={selectedPainPoint}
            ideaId={data.idea.id}
          />
          <StrategicOpportunityCard opportunity={data.strategicOpportunity} />
        </div>
      </div>
    </div>
  );
}
