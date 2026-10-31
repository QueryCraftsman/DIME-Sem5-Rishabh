"use client";

import React from "react";
import { DollarSign, TrendingUp, Info, CheckCircle2 } from "lucide-react";
import type { MarketSizeEstimates } from "@/types/market-analysis";

interface MarketSizeCardProps {
  data?: MarketSizeEstimates;
}

export function MarketSizeCard({ data }: MarketSizeCardProps) {
  if (!data) return null;

  const { tam, sam, som, methodology, confidenceLevel, growthDrivers } = data;

  return (
    <div id="sec-market-size" className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              Market Opportunity & Sizing (TAM / SAM / SOM)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              {confidenceLevel} Confidence
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Bottom-up addressable market sizing derived from sector spending benchmarks and target customer cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{tam.cagr}</span>
        </div>
      </div>

      {/* 3 Metric Cards: TAM, SAM, SOM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* TAM */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {tam.label} (TAM)
              </span>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                Global
              </span>
            </div>
            <div className="text-3xl font-extrabold text-text-strong font-mono mt-3">
              {tam.value}
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">
            {tam.description}
          </p>
        </div>

        {/* SAM */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {sam.label} (SAM)
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Serviceable
              </span>
            </div>
            <div className="text-3xl font-extrabold text-text-strong font-mono mt-3">
              {sam.value}
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">
            {sam.description}
          </p>
        </div>

        {/* SOM */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors border-l-4 border-l-primary">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {som.label} (SOM)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                3-Yr Target
              </span>
            </div>
            <div className="text-3xl font-extrabold text-primary font-mono mt-3">
              {som.value}
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-3 leading-relaxed">
            {som.description}
          </p>
        </div>
      </div>

      {/* Growth Drivers & Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-5 border-t border-border-default">
        {/* Growth Drivers */}
        <div className="lg:col-span-7 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-strong flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Key Market Growth Drivers
          </h4>
          <ul className="grid grid-cols-1 gap-2 text-xs text-text-secondary">
            {growthDrivers?.map((driver, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Methodology Note */}
        <div className="lg:col-span-5 bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Methodology & Modeling Protocol
            </div>
            <p className="text-xs text-blue-800/90 leading-relaxed">
              {methodology}
            </p>
          </div>
          <div className="text-[11px] text-blue-700 mt-3 pt-2 border-t border-blue-200/60">
            Validated against historical SaaS multiple indices & domain spending reports.
          </div>
        </div>
      </div>
    </div>
  );
}

