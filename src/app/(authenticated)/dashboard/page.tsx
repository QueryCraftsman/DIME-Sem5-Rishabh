"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Sparkles, Activity, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getUserDisplayName } from "@/lib/user-profile";

import { KpiCards, KpiStats } from "@/components/dashboard/KpiCards";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { OpportunityDistribution, OpportunityMixItem } from "@/components/dashboard/OpportunityDistribution";
import { MarketSignals, MarketSignalItem } from "@/components/dashboard/MarketSignals";
import {
  PortfolioValidationMatrix,
  MatrixIdeaPoint,
} from "@/components/dashboard/PortfolioValidationMatrix";
import {
  PortfolioValidationBenchmark,
  BenchmarkIdeaItem,
} from "@/components/dashboard/PortfolioValidationBenchmark";
import {
  PortfolioMarketIntelligence,
  PortfolioIntelligenceData,
} from "@/components/dashboard/PortfolioMarketIntelligence";
import {
  ResearchSourceIntelligence,
  ResearchSourceHealthItem,
} from "@/components/dashboard/ResearchSourceIntelligence";
import { PipelineHealth, PipelineHealthData } from "@/components/dashboard/PipelineHealth";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { ProTip } from "@/components/dashboard/ProTip";

interface DashboardData {
  stats: KpiStats;
  opportunityMix: OpportunityMixItem[];
  marketSignals: MarketSignalItem[];
  validationMatrix?: MatrixIdeaPoint[];
  benchmarkData?: BenchmarkIdeaItem[];
  portfolioIntelligence: PortfolioIntelligenceData;
  researchSourcesHealth: ResearchSourceHealthItem[];
  pipelineHealth: PipelineHealthData;
  recentActivity: ActivityItem[];
  quickInsight: string;
  lastRefreshedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const displayName = getUserDisplayName(session?.user?.name, session?.user?.email);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/overview");
      if (res.status === 401) {
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchDashboard();

    // Poll every 30s only when tab is visible
    let interval: NodeJS.Timeout;
    const startInterval = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          return;
        }
        if (mounted) fetchDashboard();
      }, 30000);
    };

    startInterval();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && mounted) {
        fetchDashboard();
        startInterval();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchDashboard]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
      {/* 1. Welcome & Portfolio Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-dime-orange">
              Executive Intelligence Center
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine v3.4 Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back{displayName && displayName !== "User" ? `, ${displayName}` : ""}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time validation progress, verified research citations, and portfolio demand intelligence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Refresh button with timestamp */}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refreshed: {lastUpdated}</span>
          </button>

          {/* New Analysis Primary Button */}
          <Link
            href="/ideas/new"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-dime-orange hover:bg-[#d04b08] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-dime-orange whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* 2. Portfolio KPI Cards & Secondary Metric Strip */}
      <section aria-label="Portfolio KPI Metrics">
        <KpiCards stats={data?.stats} isLoading={loading} />
      </section>

      {/* 3. Core Intelligence Grid (Recent Analyses Table & Viability Matrix on Left, Opportunity & Signals on Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" aria-label="Core Analytics">
        {/* Left Column (2/3 width): Table + 2D Viability Scatter Matrix + Pillar Benchmark */}
        <div className="lg:col-span-2 space-y-6">
          <RecentAnalysesTable />
          <PortfolioValidationMatrix data={data?.validationMatrix} isLoading={loading} />
          <PortfolioValidationBenchmark data={data?.benchmarkData} isLoading={loading} />
        </div>

        {/* Right Column (1/3 width): Opportunity Distribution & Market Signals */}
        <div className="space-y-6">
          <OpportunityDistribution mix={data?.opportunityMix} isLoading={loading} />
          <MarketSignals signals={data?.marketSignals} isLoading={loading} />
          <RecentActivity activities={data?.recentActivity} isLoading={loading} />
        </div>
      </section>

      {/* 4. Portfolio Market Intelligence (Research Depth, Industries, Source Types) */}
      <section aria-label="Portfolio Cross-Idea Intelligence">
        <PortfolioMarketIntelligence data={data?.portfolioIntelligence} isLoading={loading} />
      </section>

      {/* 5. Infrastructure & Pipeline Health (Two Columns) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" aria-label="Research Pipeline Infrastructure">
        <ResearchSourceIntelligence sources={data?.researchSourcesHealth} isLoading={loading} />
        <PipelineHealth data={data?.pipelineHealth} isLoading={loading} />
      </section>

      {/* 6. Executive Intelligence Insight (Quick Insight placed at bottom of page) */}
      {data?.quickInsight && (
        <section aria-label="Executive Intelligence Insight">
          <ProTip insight={data?.quickInsight} isLoading={loading} />
        </section>
      )}
    </div>
  );
}
