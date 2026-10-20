"use client";

import React from "react";
import Link from "next/link";

export default function ResearchPage() {
  return (
    <div className="p-8 max-w-[1600px] w-full">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-secondary font-label-md text-label-md mb-3">
        <Link href="/dashboard" className="hover:text-text-strong transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
        <span className="text-text-strong font-body-semibold text-body-semibold">Research &amp; Evidence</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-strong">Research &amp; Evidence Corpus</h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Verified academic literature, open-source repositories, and candidate forums with zero-hallucination provenance.
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

      <div className="space-y-4">
        <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-canvas-bg border border-border-default font-mono">
                SEMANTIC SCHOLAR
              </span>
              <span className="text-xs text-success-green font-medium">Relevance: 0.94</span>
            </div>
            <h3 className="font-body-semibold text-body-semibold text-text-strong">
              Automated Dialogue Assessment in Technical Software Engineering Interviews
            </h3>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Investigates multi-turn LLM agent reasoning for evaluating trade-offs in distributed system architecture interviews.
            </p>
          </div>
          <a
            href="https://www.semanticscholar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-lg border border-border-default hover:bg-canvas-bg text-text-strong text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <span>Open Paper</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>

        <div className="p-5 bg-surface-white rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-canvas-bg border border-border-default font-mono">
                GITHUB REPOSITORY
              </span>
              <span className="text-xs text-success-green font-medium">Relevance: 0.88</span>
            </div>
            <h3 className="font-body-semibold text-body-semibold text-text-strong">
              Real-Time WebRTC Audio Speech Cadence Evaluator
            </h3>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Open-source framework for low-latency filler word detection, tone calibration, and STAR-method pacing metrics.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-lg border border-border-default hover:bg-canvas-bg text-text-strong text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <span>View Repo</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
}
