"use client";

import React from "react";
import { Download, TrendingUp } from "lucide-react";
import type { DemandChartData } from "@/types/market-analysis";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

interface DemandSignalsCardProps {
  data: DemandChartData;
}

export function DemandSignalsCard({ data }: DemandSignalsCardProps) {
  const { peakPoint, velocityInflectionText } = data;
  const series1 = data.series1Label || "Primary Solution Inquiries";
  const series2 = data.series2Label || "Customer Friction Mentions";
  const points = data.points || [];
  const hasData = data.hasSufficientData !== false && points.length > 0;

  const handleDownloadCSV = () => {
    if (!points.length) return;
    const headers = ["Month", `"${series1}"`, `"${series2}"`];
    const rows = points.map((p) => [
      p.month,
      p.mockToolSearches,
      p.painMentions,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `demand_signals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find peak point coordinates in points array
  const peakIndex = points.findIndex(
    (p) =>
      p.month === peakPoint?.month ||
      p.mockToolSearches === peakPoint?.value
  );
  const peakDataPoint = peakIndex !== -1 ? points[peakIndex] : points[points.length - 1];

  return (
    <div className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between pb-4 border-b border-border-default gap-4">
        {/* Title + Badge + Subtitle */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-title-card text-title-card text-text-strong font-semibold">
              Normalized Demand Signals Over Time
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-text-secondary font-mono whitespace-nowrap shrink-0">
              Past 12 Months
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Aggregated query volume, forum discussion velocity, and domain problem mentions (normalized scale 0–100).
          </p>
        </div>

        {/* Chart Legends & CSV Download */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-medium self-start lg:self-center shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <span className="text-text-secondary whitespace-nowrap">{series1}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
            <span className="text-text-secondary whitespace-nowrap">{series2}</span>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-text-secondary hover:text-text-strong border border-border-default rounded-md hover:bg-slate-50 transition-colors shadow-xs shrink-0"
            title="Download Chart Data (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Recharts Canvas or Empty State */}
      {!hasData ? (
        <div className="relative w-full h-72 min-h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 mt-4">
          <p className="font-body-semibold text-text-strong">
            Insufficient historical evidence to generate a reliable trend.
          </p>
          <p className="font-caption text-caption text-text-secondary mt-1 max-w-md">
            DIME requires longitudinal query volume or dated customer feedback to
            render a reliable 12-month demand trajectory without fabricating data points.
          </p>
        </div>
      ) : (
        <div className="relative w-full h-72 min-h-[280px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="primaryOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="dataCyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                stroke="#94A3B8"
                fontSize={11}
                tickMargin={8}
              />

              <YAxis
                domain={[0, 100]}
                tickLine={false}
                stroke="#94A3B8"
                fontSize={11}
                ticks={[0, 25, 50, 75, 100]}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1">
                        <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                          {label}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-orange-400">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            {series1}:
                          </span>
                          <span className="font-mono font-bold">
                            {payload[0]?.value} / 100
                          </span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-cyan-400">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              {series2}:
                            </span>
                            <span className="font-mono font-bold">
                              {payload[1]?.value} / 100
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Cyan Area (Friction Mentions) */}
              <Area
                type="monotone"
                dataKey="painMentions"
                name={series2}
                stroke="#06B6D4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dataCyanGradient)"
              />

              {/* Orange Area (Solution Inquiries) */}
              <Area
                type="monotone"
                dataKey="mockToolSearches"
                name={series1}
                stroke="#EA580C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#primaryOrangeGradient)"
              />

              {/* Peak Marker Reference */}
              {peakDataPoint && (
                <ReferenceDot
                  x={peakDataPoint.month}
                  y={peakDataPoint.mockToolSearches}
                  r={5}
                  fill="#EA580C"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Callout Footer */}
      {hasData && (
        <div className="mt-4 pt-3 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-secondary gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded-full bg-primary/10 text-primary">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="text-text-strong font-medium">
              {velocityInflectionText}
            </span>
          </div>
          {peakPoint && (
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-text-strong font-semibold">
                {peakPoint.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
