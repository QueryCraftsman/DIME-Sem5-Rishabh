export interface MarketSummaryMetrics {
  marketDemand: {
    level: string; // e.g. "Strong"
    badge: string; // e.g. "High Demand"
    trendPercent: string; // e.g. "+34% YoY"
    supportingSignal: string; // e.g. "query velocity across engineering communities"
    isPositiveTrend: boolean;
  };
  evidenceBase: {
    totalSources: number; // e.g. 27
    badge: string; // "Multi-source"
    redditBlindCount: number; // 14
    reviewsCount: number; // 8
    surveysResearchCount: number; // 5
  };
  confidenceScore: {
    scorePercent: number; // 79
    badge: string; // "Deterministic"
    levelText: string; // "High Confidence"
    provenanceClaim: string; // "Evidence-backed provenance"
  };
  freshness: {
    displayDate: string; // "18 Sep 2026"
    badge: string; // "Live"
    relativeCrawlText: string; // "Last crawl completed 12 min ago"
  };
}

export interface DemandChartPoint {
  month: string;
  mockToolSearches: number; // 0-100 normalized
  painMentions: number; // 0-100 normalized
}

export interface DemandChartData {
  points: DemandChartPoint[];
  peakPoint: {
    month: string;
    value: number;
    label: string;
  };
  velocityInflectionText: string;
}

export interface QualitativePainSignal {
  id: string;
  frequencyBadge: "High frequency" | "Medium frequency" | "Low frequency";
  evidenceCount: number;
  title: string;
  description: string;
  representativeQuote: string;
}

export interface CorroboratingSource {
  sourceName: string;
  similarityText: string;
}

export interface VerifiedEvidenceItem {
  id: string;
  claim: string;
  supportingText: string;
  sourceUrl: string;
  sourceTitle: string;
  evidenceType: string;
  relevanceScore: number;
  confidence: number;
  timestampText: string;
  corroboratingSources: CorroboratingSource[];
  secondaryCitationsNote: string;
}

export interface PainPointRankingItem {
  id: string;
  rank: number;
  title: string;
  evidenceCount: number;
  percentage: number;
  evidence: VerifiedEvidenceItem;
}

export interface SentimentBreakdownData {
  negativePercent: number;
  neutralPercent: number;
  positivePercent: number;
  yoyTrend: string;
  totalSampleSize: number;
  sampleDescription: string;
}

export interface StrategicOpportunity {
  heading: string;
  explanation: string;
}

export interface AnalysisTabsData {
  overviewHref: string;
  competitionCount: number;
  technicalLabel: string;
  researchCount: number;
  risksCount: number;
}

export interface MarketIntelligenceIdea {
  id: string;
  analysisId: string;
  title: string;
  platform: string;
  updatedDate: string;
  status: string;
}

export interface MarketIntelligencePayload {
  idea: MarketIntelligenceIdea;
  summary: MarketSummaryMetrics;
  tabs: AnalysisTabsData;
  demandChart: DemandChartData;
  qualitativeSignals: QualitativePainSignal[];
  painPoints: PainPointRankingItem[];
  sentiment: SentimentBreakdownData;
  strategicOpportunity: StrategicOpportunity;
}
