"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IdeaCoreConcept, CoreConceptState } from "./IdeaCoreConcept";
import { IdeaClassification, ClassificationState } from "./IdeaClassification";
import { OperationalConstraints, OperationalConstraintsState } from "./OperationalConstraints";
import { AnalysisDepthSelector, AnalysisDepthState } from "./AnalysisDepthSelector";
import { ValidationActions } from "./ValidationActions";
import { WhatWeAnalyzePanel } from "./WhatWeAnalyzePanel";
import { Sparkles } from "lucide-react";

export function IdeaValidationForm() {
  const router = useRouter();
  
  const [coreState, setCoreState] = useState<CoreConceptState>({
    title: "",
    description: "",
    targetAudience: "",
  });
  
  const [classState, setClassState] = useState<ClassificationState>({
    domains: [],
    formFactors: [],
  });

  const [opState, setOpState] = useState<OperationalConstraintsState>({
    budget: "",
    teamSize: "",
    timeline: "",
    preferredTechnologies: "",
  });

  const [depthState, setDepthState] = useState<AnalysisDepthState>({
    depth: "STANDARD",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!coreState.title || coreState.title.length < 4) {
      newErrors.title = "Title must be at least 4 characters.";
    }
    if (!coreState.description || coreState.description.length < 30) {
      newErrors.description = "Description must be at least 30 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = () => {
    return {
      title: coreState.title,
      description: coreState.description,
      targetAudience: coreState.targetAudience,
      industry: classState.domains.join(", "),
      formFactors: classState.formFactors,
      budget: opState.budget,
      teamSize: opState.teamSize,
      timeline: opState.timeline,
      preferredTechnologies: opState.preferredTechnologies.split(",").map(t => t.trim()).filter(Boolean),
      analysisDepth: depthState.depth,
    };
  };

  const handleSaveDraft = async () => {
    // Draft only requires a title, but we enforce at least some input
    if (!coreState.title && !coreState.description) {
      alert("Please enter at least a title or description to save a draft.");
      return;
    }
    
    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      });
      if (res.ok) {
        alert("Draft saved successfully!");
      } else {
        alert("Failed to save draft.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ideas/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/ideas/${data.db_idea_id}/analysis/${data.id}`);
      } else {
        const errText = await res.text();
        alert(`Failed to start analysis: ${errText}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while starting the analysis.");
      setIsSubmitting(false);
    }
  };

  const isValid = coreState.title.length >= 4 && coreState.description.length >= 30;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-24">
      {/* Main Form Area */}
      <div className="lg:col-span-8 space-y-12">
        <IdeaCoreConcept 
          data={coreState} 
          onChange={(updates) => setCoreState(prev => ({ ...prev, ...updates }))} 
          errors={errors} 
        />
        
        <IdeaClassification 
          data={classState}
          onChange={(updates) => setClassState(prev => ({ ...prev, ...updates }))}
        />
        
        <OperationalConstraints 
          data={opState}
          onChange={(updates) => setOpState(prev => ({ ...prev, ...updates }))}
        />
        
        <AnalysisDepthSelector 
          data={depthState}
          onChange={(updates) => setDepthState(prev => ({ ...prev, ...updates }))}
        />

        <ValidationActions 
          isSubmitting={isSubmitting}
          isSavingDraft={isSavingDraft}
          onAnalyze={handleAnalyze}
          onSaveDraft={handleSaveDraft}
          isValid={isValid}
        />
      </div>

      {/* Right Sidebar Area */}
      <div className="lg:col-span-4 relative">
        <div className="lg:sticky lg:top-8">
          <WhatWeAnalyzePanel />
        </div>
      </div>
    </div>
  );
}
