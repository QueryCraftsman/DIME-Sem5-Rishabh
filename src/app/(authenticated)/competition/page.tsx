"use client";

import React from "react";
import Link from "next/link";

export default function CompetitionPage() {
  return (
    <div className="p-8 max-w-[1600px] w-full">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-secondary font-label-md text-label-md mb-3">
        <Link href="/dashboard" className="hover:text-text-strong transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
        <span className="text-text-strong font-body-semibold text-body-semibold">Competition</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-strong">Competitive Intelligence</h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Analyze market incumbents, feature matrices, and differentiation moats across competing solutions.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface-white rounded-xl border border-border-default shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold">1</span>
            <h3 className="font-title-card text-title-card text-text-strong">LeetCode</h3>
          </div>
          <p className="font-body-md text-body-md text-text-secondary">
            Dominant syntax pass/fail coding challenges platform. Lacks real-time speech dialogue and architecture trade-off evaluation.
          </p>
          <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
            <span>Market Share: High</span>
            <span className="text-success-green font-semibold">Direct Incumbent</span>
          </div>
        </div>

        <div className="p-6 bg-surface-white rounded-xl border border-border-default shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold">2</span>
            <h3 className="font-title-card text-title-card text-text-strong">interviewing.io</h3>
          </div>
          <p className="font-body-md text-body-md text-text-secondary">
            Human-led anonymous mock interviews. Expensive ($150-$250/hr) with high scheduling latency and human-observer anxiety.
          </p>
          <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
            <span>Price: $200/hr</span>
            <span className="text-warning-amber font-semibold">High Cost Vector</span>
          </div>
        </div>

        <div className="p-6 bg-surface-white rounded-xl border border-border-default shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold">3</span>
            <h3 className="font-title-card text-title-card text-text-strong">Pramp / Exponent</h3>
          </div>
          <p className="font-body-md text-body-md text-text-secondary">
            Peer-to-peer interview practice. Variable peer quality and zero deterministic system design feedback.
          </p>
          <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
            <span>Quality: Variable</span>
            <span className="text-text-secondary font-semibold">Peer Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
