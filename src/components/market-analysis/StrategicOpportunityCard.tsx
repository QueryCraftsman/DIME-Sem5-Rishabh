"use client";

import React from "react";
import type { StrategicOpportunity } from "@/types/market-analysis";

interface StrategicOpportunityCardProps {
  opportunity: StrategicOpportunity;
}

export function StrategicOpportunityCard({
  opportunity,
}: StrategicOpportunityCardProps) {
  return (
    <div className="p-4 bg-brand-soft rounded-xl border border-brand-pale">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
          lightbulb
        </span>
        <div>
          <h3 className="font-body-semibold text-body-semibold text-brand-pressed">
            {opportunity.heading}
          </h3>
          <p className="font-body-md text-body-md text-brand-pressed/90 mt-1 text-xs leading-relaxed">
            {opportunity.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
