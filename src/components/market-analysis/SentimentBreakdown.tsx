"use client";

import React from "react";
import type { SentimentBreakdownData } from "@/types/market-analysis";

interface SentimentBreakdownProps {
  data: SentimentBreakdownData;
}

export function SentimentBreakdown({ data }: SentimentBreakdownProps) {
  const {
    negativePercent,
    neutralPercent,
    positivePercent,
    yoyTrend,
    totalSampleSize,
    sampleDescription,
  } = data;

  // Circumference for r=14 is 2 * Math.PI * 14 ≈ 87.9644
  const circumference = 2 * Math.PI * 14;
  const negLen = (negativePercent / 100) * circumference;
  const neuLen = (neutralPercent / 100) * circumference;
  const posLen = (positivePercent / 100) * circumference;

  const neuOffset = -negLen;
  const posOffset = -(negLen + neuLen);

  return (
    <div className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between pb-3 border-b border-border-default">
        <h2 className="font-title-card text-title-card text-text-strong">
          Sentiment Breakdown
        </h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-soft text-danger-red border border-red-200">
          {yoyTrend}
        </span>
      </div>

      {/* Donut Chart & Percentages */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-5 pb-3">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="#F1F5F9"
              strokeWidth="4"
            />
            {/* Negative */}
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="#DC2626"
              strokeDasharray={`${negLen.toFixed(2)} ${circumference.toFixed(2)}`}
              strokeDashoffset="0"
              strokeWidth="4"
            />
            {/* Neutral */}
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="#94A3B8"
              strokeDasharray={`${neuLen.toFixed(2)} ${circumference.toFixed(2)}`}
              strokeDashoffset={neuOffset.toFixed(2)}
              strokeWidth="4"
            />
            {/* Positive */}
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="#16A34A"
              strokeDasharray={`${posLen.toFixed(2)} ${circumference.toFixed(2)}`}
              strokeDashoffset={posOffset.toFixed(2)}
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-text-strong">
              {negativePercent}%
            </span>
            <span className="text-[10px] uppercase font-bold text-danger-red">
              Negative
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2.5 w-full text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger-red" />
              <span className="text-text-secondary">Negative (Frustrated)</span>
            </div>
            <span className="font-bold text-text-strong font-mono">
              {negativePercent}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
              <span className="text-text-secondary">Neutral (Impersonal)</span>
            </div>
            <span className="font-bold text-text-strong font-mono">
              {neutralPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success-green" />
              <span className="text-text-secondary">Positive (Satisfied)</span>
            </div>
            <span className="font-bold text-text-strong font-mono">
              {positivePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Sample Metadata & Context Callout */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg border border-border-default">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Total Sample Size:</span>
          <span className="font-mono font-semibold text-text-strong">
            {totalSampleSize.toLocaleString()} community posts
          </span>
        </div>
        <p className="font-caption text-caption text-text-muted mt-1">
          {sampleDescription}
        </p>
      </div>
    </div>
  );
}
