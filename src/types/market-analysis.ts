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
  series1Label?: string;
  series2Label?: string;
  hasSufficientData?: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// NEW ENHANCED SECTIONS (TAM/SAM/SOM, Competitors, Research, GitHub, Insights, Gaps, Coverage)
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketSizeEstimates {
  tam: {
    value: string; // e.g. "$14.8B"
    label: string;
    description: string;
    cagr: string;
  };
  sam: {
    value: string; // e.g. "$3.2B"
    label: string;
    description: string;
  };
  som: {
    value: string; // e.g. "$420M"
    label: string;
    description: string;
  };
  methodology: string;
  confidenceLevel: "High" | "Medium" | "Preliminary";
  growthDrivers: string[];
}

export interface CompetitorItem {
  id: string;
  name: string;
  type: string; // "direct" | "indirect" | "research_impl"
  url?: string;
  description?: string;
  pricing?: string;
  strengths: string[];
  weaknesses: string[];
  features: string[];
  stars?: number | null;
  forks?: number | null;
}

export interface CompetitorLandscapeData {
  directCompetitorsCount: number;
  indirectCompetitorsCount: number;
  competitors: CompetitorItem[];
  featureMatrix: {
    feature: string;
    ourSolution: boolean | string;
    incumbents: Record<string, boolean | string>;
  }[];
  marketConcentration: "High" | "Moderate" | "Fragmented";
  differentiationAngle: string;
}

export interface ResearchPublicationYear {
  year: number;
  count: number;
  label?: string;
}

export interface TopAcademicPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citationCount?: number;
  doi?: string;
  url?: string;
  keyTakeaway: string;
}

export interface ResearchLandscapeData {
  totalPapersAnalyzed: number;
  academicVelocity: string;
  publicationsByYear: ResearchPublicationYear[];
  topPapers: TopAcademicPaper[];
  emergingTopics: string[];
}

export interface GithubRepoItem {
  name: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  activityStatus: "Active" | "Maintained" | "Stale" | "Archived";
  relevance: string;
}

export interface GithubLanguageShare {
  language: string;
  percentage: number;
  repoCount: number;
  color: string;
}

export interface GithubEcosystemData {
  totalReposFound: number;
  totalStars: number;
  averageForks: number;
  topRepositories: GithubRepoItem[];
  languageDistribution: GithubLanguageShare[];
  ecosystemMaturity: "Nascent" | "Growing" | "Mature";
  openSourceGap: string;
}

export interface EvidenceInsightCard {
  id: string;
  category: "market" | "feasibility" | "risk" | "competition" | "novelty" | string;
  title: string;
  summary: string;
  confidenceScore: number;
  evidenceCount: number;
  implication: string;
}

export interface EvidenceInsightsData {
  insights: EvidenceInsightCard[];
  keyTakeaway: string;
}

export interface ResearchGapItem {
  id: string;
  priority: "High" | "Medium" | "Low";
  area: string;
  question: string;
  currentStatus: string;
  recommendedNextStep: string;
}

export interface ResearchGapsData {
  totalGaps: number;
  highPriorityCount: number;
  gaps: ResearchGapItem[];
}

export interface SourceProviderStatus {
  providerName: string;
  status: "COMPLETED" | "RUNNING" | "PARTIAL" | "FAILED" | "PENDING" | string;
  recordsFound: number;
  recordsIndexed: number;
  coveragePercentage: number;
  latencyText?: string;
}

export interface SourceCoverageData {
  totalProviders: number;
  activeProviders: number;
  totalRecordsFound: number;
  totalRecordsIndexed: number;
  providers: SourceProviderStatus[];
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
  // Enhanced Sections
  marketSize?: MarketSizeEstimates;
  competitorLandscape?: CompetitorLandscapeData;
  researchLandscape?: ResearchLandscapeData;
  githubEcosystem?: GithubEcosystemData;
  evidenceInsights?: EvidenceInsightsData;
  researchGaps?: ResearchGapsData;
  sourceCoverage?: SourceCoverageData;
}
