import React from "react";
import { MousePointerClick } from "lucide-react";
import type { PainPointRankingItem } from "@/types/market-analysis";

interface PainPointsRankingProps {
  items: PainPointRankingItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PainPointsRanking({
  items,
  selectedIndex,
  onSelect,
}: PainPointsRankingProps) {
  return (
    <div className="bg-surface-white rounded-xl border border-border-default p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-default gap-2 mb-4">
        <div>
          <h2 className="font-title-card text-title-card text-text-strong font-semibold">
            Top Pain Points by Citation Volume
          </h2>
          <p className="font-caption text-caption text-text-secondary mt-0.5">
            Click any pain point to inspect verified source evidence citations.
          </p>
        </div>
        <span className="text-xs text-primary font-semibold flex items-center gap-1.5 shrink-0">
          <MousePointerClick className="w-3.5 h-3.5" />
          Interactive Inspector
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <div
              key={item.id || idx}
              onClick={() => onSelect(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-xs"
                  : "border-border-default hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                {/* Left: Rank badge + Title + Active pill */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-text-secondary border border-slate-200"
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span
                      className={`text-sm leading-snug ${
                        isSelected
                          ? "font-semibold text-text-strong"
                          : "font-medium text-text-strong"
                      }`}
                    >
                      {item.title}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-white rounded shrink-0">
                        Active Selection
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Items count + Percentage (strictly separated and non-colliding) */}
                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                  <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
                    {item.evidenceCount} items
                  </span>
                  <span
                    className={`font-mono text-sm font-bold min-w-[2.5rem] text-right ${
                      isSelected ? "text-primary" : "text-text-strong"
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isSelected ? "bg-primary" : "bg-slate-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, item.percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
