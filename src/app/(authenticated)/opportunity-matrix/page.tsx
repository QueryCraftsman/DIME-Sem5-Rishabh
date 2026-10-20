"use client";

import React from "react";
import Link from "next/link";

export default function OpportunityMatrixPage() {
  return (
    <div className="p-8 max-w-[1600px] w-full">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-secondary font-label-md text-label-md mb-3">
        <Link href="/dashboard" className="hover:text-text-strong transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
        <span className="text-text-strong font-body-semibold text-body-semibold">Opportunity Matrix</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-strong">Opportunity Matrix</h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            2x2 Strategic Quadrant: Feasibility vs. Market Demand Signals.
          </p>
        </div>
        <Link
          href="/market-analysis"
          className="h-10 px-4 rounded-lg bg-primary hover:bg-brand-hover text-white font-body-semibold text-body-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">insights</span>
          <span>View Market Signals</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-brand-soft rounded-xl border border-brand-pale">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
            <h3 className="font-title-card text-title-card text-brand-pressed">High Demand / High Feasibility (Sweet Spot)</h3>
          </div>
          <p className="font-body-md text-body-md text-brand-pressed/90 text-sm">
            AI Interview Coach ranks in the top right sweet-spot quadrant with 84% Market Demand velocity and 80% Technical Feasibility score.
          </p>
        </div>

        <div className="p-6 bg-surface-white rounded-xl border border-border-default shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-text-secondary text-[22px]">build</span>
            <h3 className="font-title-card text-title-card text-text-strong">High Demand / Low Feasibility (R&amp;D Trap)</h3>
          </div>
          <p className="font-body-md text-body-md text-text-secondary text-sm">
            Fully autonomous AI hiring decision agents without human-in-the-loop compliance face heavy regulatory friction in 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
