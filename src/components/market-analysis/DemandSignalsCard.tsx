"use client";

import React from "react";
import type { DemandChartData } from "@/types/market-analysis";

interface DemandSignalsCardProps {
  data: DemandChartData;
}

export function DemandSignalsCard({ data }: DemandSignalsCardProps) {
  const { peakPoint, velocityInflectionText } = data;

  return (
    <div className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-3">
        <div>
          <h2 className="font-title-card text-title-card text-text-strong">
            Normalized Demand Signals Over Time (Past 12 Months)
          </h2>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Aggregated query volume, forum discussion velocity, and hiring
            frustration mentions (normalized scale 0-100). Does not imply total
            addressable market size.
          </p>
        </div>

        {/* Chart Legends */}
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-text-secondary">Mock AI Tool Searches</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-data-cyan" />
            <span className="text-text-secondary">
              Interview Prep Pain Mentions
            </span>
          </div>
        </div>
      </div>

      {/* SVG Data Visualization Canvas */}
      <div className="relative w-full h-72 pt-6">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 760 220"
        >
          <defs>
            {/* Gradient for Primary Orange Line */}
            <linearGradient id="orangeGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
            </linearGradient>
            {/* Gradient for Cyan Line */}
            <linearGradient id="cyanGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          <line
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            x1="40"
            x2="750"
            y1="20"
            y2="20"
          />
          <line
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            x1="40"
            x2="750"
            y1="65"
            y2="65"
          />
          <line
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            x1="40"
            x2="750"
            y1="110"
            y2="110"
          />
          <line
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            x1="40"
            x2="750"
            y1="155"
            y2="155"
          />
          <line stroke="#CBD5E1" x1="40" x2="750" y1="200" y2="200" />

          {/* Left Y-Axis Labels */}
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="11"
            textAnchor="end"
            x="30"
            y="24"
          >
            100
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="11"
            textAnchor="end"
            x="30"
            y="69"
          >
            75
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="11"
            textAnchor="end"
            x="30"
            y="114"
          >
            50
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="11"
            textAnchor="end"
            x="30"
            y="159"
          >
            25
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="11"
            textAnchor="end"
            x="30"
            y="204"
          >
            0
          </text>

          {/* Shaded Area Cyan */}
          <path
            d="M 50 160 C 110 150, 170 145, 230 135 C 290 128, 350 115, 410 102 C 470 94, 530 85, 590 70 C 650 62, 710 48, 740 45 L 740 200 L 50 200 Z"
            fill="url(#cyanGradient)"
          />

          {/* Cyan Line: Interview Prep Pain Mentions */}
          <path
            d="M 50 160 C 110 150, 170 145, 230 135 C 290 128, 350 115, 410 102 C 470 94, 530 85, 590 70 C 650 62, 710 48, 740 45"
            fill="none"
            stroke="#06B6D4"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          {/* Shaded Area Orange */}
          <path
            d="M 50 178 C 110 170, 170 162, 230 145 C 290 130, 350 110, 410 90 C 470 75, 530 60, 590 44 C 650 34, 710 28, 740 24 L 740 200 L 50 200 Z"
            fill="url(#orangeGradient)"
          />

          {/* Orange Primary Line: Mock AI Tool Searches */}
          <path
            d="M 50 178 C 110 170, 170 162, 230 145 C 290 130, 350 110, 410 90 C 470 75, 530 60, 590 44 C 650 34, 710 28, 740 24"
            fill="none"
            stroke="#EA580C"
            strokeLinecap="round"
            strokeWidth="3"
          />

          {/* Interactive High Watermark Point at Peak (Sep 2026 = 88/100) */}
          <circle
            cx="740"
            cy="24"
            fill="#EA580C"
            r="5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <circle
            cx="740"
            cy="45"
            fill="#06B6D4"
            r="4"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Milestone Callout Badge */}
          <g transform="translate(640, 2)">
            <rect fill="#EA580C" height="20" rx="4" width="85" x="0" y="0" />
            <text
              fill="#FFFFFF"
              fontFamily="Inter"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              x="42"
              y="14"
            >
              {peakPoint.label}
            </text>
          </g>

          {/* Month ticks on X-Axis */}
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="50"
            y="216"
          >
            Oct 25
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="112"
            y="216"
          >
            Nov
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="175"
            y="216"
          >
            Dec
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="237"
            y="216"
          >
            Jan 26
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="300"
            y="216"
          >
            Feb
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="362"
            y="216"
          >
            Mar
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="425"
            y="216"
          >
            Apr
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="487"
            y="216"
          >
            May
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="550"
            y="216"
          >
            Jun
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="612"
            y="216"
          >
            Jul
          </text>
          <text
            fill="#94A3B8"
            fontFamily="Inter"
            fontSize="10"
            textAnchor="middle"
            x="675"
            y="216"
          >
            Aug
          </text>
          <text
            fill="#0F172B"
            fontFamily="Inter"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            x="738"
            y="216"
          >
            Sep 26
          </text>
        </svg>
      </div>

      <div className="mt-4 pt-3 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-secondary gap-2">
        <span>{velocityInflectionText}</span>
        <a
          className="text-primary font-body-semibold hover:underline flex items-center gap-1 shrink-0"
          href="/api/market-analysis/export?format=csv"
          download="dime-market-signals.csv"
        >
          <span>Download raw dataset (.csv)</span>
          <span className="material-symbols-outlined text-[14px]">download</span>
        </a>
      </div>
    </div>
  );
}
