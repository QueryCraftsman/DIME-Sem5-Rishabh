"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { KpiCards, KpiStats } from "@/components/dashboard/KpiCards";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { OpportunityDistribution, OpportunityMixItem } from "@/components/dashboard/OpportunityDistribution";
import { MarketSignals, MarketTrend } from "@/components/dashboard/MarketSignals";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { ProTip } from "@/components/dashboard/ProTip";

interface DashboardData {
  stats: KpiStats;
  opportunityMix: OpportunityMixItem[];
  marketTrends: MarketTrend[];
  recentActivity: ActivityItem[];
  quickInsight: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    
    // Poll every 10s
    const interval = setInterval(fetchDashboard, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dime-navy dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Overview of your analysis pipeline and market intelligence.
          </p>
        </div>
        <Link 
          href="/analyze" 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-dime-orange hover:bg-[#d04b08] text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-dime-orange whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* KPI Cards */}
      <KpiCards stats={data?.stats} isLoading={loading} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (takes 2/3 space on large screens) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          <RecentAnalysesTable />
          <div className="mt-auto pt-6">
            <ProTip insight={data?.quickInsight} isLoading={loading} />
          </div>
        </div>
        
        {/* Right Column (takes 1/3 space on large screens) */}
        <div className="space-y-6 flex flex-col h-full">
          <OpportunityDistribution mix={data?.opportunityMix} isLoading={loading} />
          <MarketSignals trends={data?.marketTrends} isLoading={loading} />
          <RecentActivity activities={data?.recentActivity} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
