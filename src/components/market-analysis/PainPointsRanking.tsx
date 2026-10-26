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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h2 className="font-title-card text-title-card text-text-strong">
            Top Pain Points by Citation Volume
          </h2>
          <p className="font-caption text-caption text-text-secondary">
            Click any pain point to inspect verified source evidence citations.
          </p>
        </div>
        <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-2 sm:mt-0">
          <MousePointerClick className="w-4 h-4" />
          Interactive Inspector
        </span>
      </div>

      <div className="space-y-3 pt-2">
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;

          if (isSelected) {
            return (
              <div
                key={item.id || idx}
                onClick={() => onSelect(idx)}
                className="p-3 rounded-lg border-2 border-primary bg-brand-soft/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center mb-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {item.rank}
                    </span>
                    <span className="font-body-semibold text-body-semibold text-text-strong">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded">
                      Active Selection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-secondary">
                      {item.evidenceCount} items
                    </span>
                    <span className="font-bold text-primary font-mono">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-border-default rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id || idx}
              onClick={() => onSelect(idx)}
              className="p-3 rounded-lg border border-border-default hover:bg-canvas-bg cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-canvas-bg text-text-secondary border border-border-default text-xs font-bold flex items-center justify-center">
                    {item.rank}
                  </span>
                  <span className="font-body-md text-body-md text-text-strong">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-secondary">
                    {item.evidenceCount} items
                  </span>
                  <span className="font-semibold text-text-strong font-mono">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-border-default rounded-full h-2 overflow-hidden">
                <div
                  className="bg-text-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
