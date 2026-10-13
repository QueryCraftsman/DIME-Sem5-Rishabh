"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClassificationState {
  domains: string[];
  formFactors: string[];
}

interface IdeaClassificationProps {
  data: ClassificationState;
  onChange: (data: Partial<ClassificationState>) => void;
}

const PREDEFINED_DOMAINS = [
  "AI/ML",
  "SaaS",
  "Web App",
  "Mobile App",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Developer Tools",
  "Cybersecurity",
];

const PREDEFINED_FORM_FACTORS = [
  "Web",
  "Mobile",
  "Desktop",
  "API",
  "Browser Extension",
  "Other",
];

export function IdeaClassification({ data, onChange }: IdeaClassificationProps) {
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState("");

  const toggleDomain = (domain: string) => {
    if (data.domains.includes(domain)) {
      onChange({ domains: data.domains.filter((d) => d !== domain) });
    } else {
      onChange({ domains: [...data.domains, domain] });
    }
  };

  const toggleFormFactor = (ff: string) => {
    if (data.formFactors.includes(ff)) {
      onChange({ formFactors: data.formFactors.filter((f) => f !== ff) });
    } else {
      onChange({ formFactors: [...data.formFactors, ff] });
    }
  };

  const addCustomDomain = () => {
    if (customDomain.trim() && !data.domains.includes(customDomain.trim())) {
      onChange({ domains: [...data.domains, customDomain.trim()] });
    }
    setCustomDomain("");
    setShowCustomDomain(false);
  };

  // Ensure any selected domains that aren't predefined are also rendered
  const allRenderedDomains = Array.from(new Set([...PREDEFINED_DOMAINS, ...data.domains]));

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="w-5 h-5 rounded-md bg-orange-50 text-dime-orange flex items-center justify-center text-[12px] font-bold">2</span>
        <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">Classification & Scope</h2>
      </div>

      {/* Domain Pills */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">
          Industry & Technology Domain
        </label>
        <div className="flex flex-wrap gap-2">
          {allRenderedDomains.map((domain) => {
            const isSelected = data.domains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-colors border",
                  isSelected
                    ? "border-dime-orange bg-orange-50 text-dime-orange shadow-sm"
                    : "border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{domain}</span>
              </button>
            );
          })}
          
          {showCustomDomain ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomDomain();
                  } else if (e.key === "Escape") {
                    setShowCustomDomain(false);
                    setCustomDomain("");
                  }
                }}
                onBlur={addCustomDomain}
                placeholder="Type & enter..."
                className="h-7 px-2 rounded-md border border-dime-orange bg-white dark:bg-slate-900 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-200 w-32"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomDomain(true)}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              + Other
            </button>
          )}
        </div>
      </div>

      {/* Intended Form Factor */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">
          Intended Form Factor
        </label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_FORM_FACTORS.map((ff) => {
            const isSelected = data.formFactors.includes(ff);
            return (
              <button
                key={ff}
                type="button"
                onClick={() => toggleFormFactor(ff)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-colors border",
                  isSelected
                    ? "border-dime-orange bg-orange-50 text-dime-orange shadow-sm"
                    : "border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{ff}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
