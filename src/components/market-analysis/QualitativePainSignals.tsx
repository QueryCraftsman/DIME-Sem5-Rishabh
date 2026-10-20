"use client";

import React from "react";
import type { QualitativePainSignal } from "@/types/market-analysis";

interface QualitativePainSignalsProps {
  signals: QualitativePainSignal[];
}

export function QualitativePainSignals({ signals }: QualitativePainSignalsProps) {
  const getBadgeStyle = (badge: string, idx: number) => {
    if (idx === 0) {
      return "bg-danger-soft text-danger-red border border-red-200";
    }
    if (idx === 1) {
      return "bg-warning-soft text-warning-amber border border-amber-200";
    }
    return "bg-indigo-50 text-indigo-600 border border-indigo-200";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-title-card text-title-card text-text-strong">
          Top Qualitative Pain Signals
        </h2>
        <span className="font-caption text-caption text-text-muted">
          Extracted via DIME NLP semantic parser
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {signals.map((signal, idx) => (
          <div
            key={signal.id || idx}
            className="p-4 bg-surface-white rounded-xl border border-border-default hover:border-border-hover transition-colors flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyle(
                    signal.frequencyBadge,
                    idx
                  )}`}
                >
                  {signal.frequencyBadge}
                </span>
                <span className="font-caption text-caption text-text-muted font-mono">
                  {signal.evidenceCount} evidence items
                </span>
              </div>
              <h3 className="font-body-semibold text-body-semibold text-text-strong">
                {signal.title}
              </h3>
              <p className="font-body-md text-body-md text-text-secondary mt-1.5 line-clamp-3">
                {signal.description}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-border-default bg-canvas-bg -mx-4 -mb-4 p-3 rounded-b-xl">
              <div className="flex items-start gap-1.5 text-xs text-text-secondary italic">
                <span className="material-symbols-outlined text-[14px] text-text-muted shrink-0 mt-0.5">
                  format_quote
                </span>
                <p className="line-clamp-2">{signal.representativeQuote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
