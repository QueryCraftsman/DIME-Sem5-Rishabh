import React from "react";
import { Lightbulb } from "lucide-react";
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
        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
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
