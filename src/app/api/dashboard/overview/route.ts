import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "../../../../../lib/prisma";
import { getOpportunityBucket } from "@/lib/idea-analysis";

// In-memory cache for global database counts to avoid full-table scans on every poll
let cachedSourcesCount: { value: number; timestamp: number } | null = null;
const SOURCES_CACHE_TTL_MS = 60 * 1000;

const mixColors = {
  "High Potential": "#10b981", // Luminous Emerald
  Promising: "#f59e0b",       // Sunlit Amber
  "Needs Validation": "#38bdf8", // Luminous Sky Blue
} as const;

const toTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes} min ago`;
  }

  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / hour));
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.max(1, Math.floor(diff / day));
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const normalizeRangeDays = (value: string | null) => {
  const parsed = Number(value ?? 7);

  if (!Number.isFinite(parsed)) {
    return 7;
  }

  if (parsed <= 7) {
    return 7;
  }

  if (parsed <= 30) {
    return 30;
  }

  return 90;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const KEYWORD_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "into",
  "your",
  "their",
  "have",
  "will",
  "would",
  "could",
  "should",
  "about",
  "using",
  "based",
  "solution",
  "product",
  "platform",
]);

const extractProblemKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length > 3 &&
        !KEYWORD_STOPWORDS.has(word) &&
        !/^\d+$/.test(word),
    );
};

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const rangeDays = normalizeRangeDays(url.searchParams.get("range"));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    // Single query with projected fields only (prevents N+1 and duplicate queries)
    const allIdeas = await prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        industry: true,
        overallViability: true,
        innovationScore: true,
        marketDemand: true,
        noveltyScore: true,
        marketPainScore: true,
        opportunityScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const scopedIdeas = allIdeas.filter((idea) => idea.createdAt >= startDate);
    const ideasToScore = scopedIdeas.length > 0 ? scopedIdeas : allIdeas;

    const analyzedIdeas = allIdeas.filter(
      (idea) =>
        idea.overallViability !== null ||
        idea.innovationScore !== null ||
        idea.marketDemand !== null,
    );

    const totalIdeas = analyzedIdeas.length;

    const scoredIdeas = analyzedIdeas.map((idea) => {
      // Prefer real persisted scores; fall back to derived values for legacy ideas
      const novelty = idea.noveltyScore ?? clamp01((idea.innovationScore ?? 0) / 100);
      const marketPain = idea.marketPainScore ?? clamp01((idea.marketDemand ?? 0) / 100);
      const opportunity = idea.opportunityScore ?? (0.6 * novelty + 0.4 * marketPain);

      return {
        novelty,
        marketPain,
        opportunity,
      };
    });

    const avgNovelty =
      totalIdeas > 0
        ? Number(
            (
              scoredIdeas.reduce((sum, idea) => sum + idea.novelty, 0) /
              totalIdeas
            ).toFixed(6),
          )
        : 0;

    const avgMarketPain =
      totalIdeas > 0
        ? Number(
            (
              scoredIdeas.reduce((sum, idea) => sum + idea.marketPain, 0) /
              totalIdeas
            ).toFixed(6),
          )
        : 0;

    const avgOpportunity =
      totalIdeas > 0
        ? Number(
            (
              scoredIdeas.reduce((sum, idea) => sum + idea.opportunity, 0) /
              totalIdeas
            ).toFixed(6),
          )
        : 0;

    const distribution = scoredIdeas.reduce(
      (acc, idea) => {
        if (idea.opportunity > 0.75) {
          acc.high += 1;
        } else if (idea.opportunity >= 0.5) {
          acc.promising += 1;
        } else {
          acc.low += 1;
        }
        return acc;
      },
      { high: 0, promising: 0, low: 0 },
    );

    const keywordFrequency = new Map<string, number>();

    for (const idea of analyzedIdeas) {
      const keywords = extractProblemKeywords(idea.description);
      for (const keyword of keywords) {
        keywordFrequency.set(keyword, (keywordFrequency.get(keyword) ?? 0) + 1);
      }
    }

    const topKeywords = [...keywordFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);

    const [notes, tasks] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 6,
        select: {
          id: true,
          title: true,
          isPinned: true,
          updatedAt: true,
        },
      }),
      prisma.workspaceTask.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 6,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    const ideasAnalyzed = analyzedIdeas.length;
    
    // New KPI calculations
    const completedAnalyses = allIdeas.filter(
      (idea) => idea.status === "VALIDATED" || idea.status === "REJECTED" || idea.status === "COMPLETED"
    ).length;

    // Fetch evidence count from FastAPI schema via safe raw SQL
    let evidenceItems = 0;
    let indexedSources = 0;

    try {
      const evidenceRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(e.id) as count 
        FROM evidence e 
        JOIN analyses a ON e.analysis_id = a.id 
        WHERE a.user_id = ${userId}
      `;
      evidenceItems = Number(evidenceRows[0]?.count ?? 0);

      // Check in-memory cache for source_documents count to avoid full-table scans
      if (cachedSourcesCount && (Date.now() - cachedSourcesCount.timestamp < SOURCES_CACHE_TTL_MS)) {
        indexedSources = cachedSourcesCount.value;
      } else {
        const sourcesRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
          SELECT COUNT(id) as count FROM source_documents
        `;
        indexedSources = Number(sourcesRows[0]?.count ?? 0);
        cachedSourcesCount = { value: indexedSources, timestamp: Date.now() };
      }
    } catch (dbErr) {
      console.warn("Could not query external intelligence tables:", dbErr);
    }

    const mixCounter = {
      "High Potential": 0,
      Promising: 0,
      "Needs Validation": 0,
    };

    for (const idea of allIdeas) {
      const bucket = getOpportunityBucket(idea.overallViability ?? 50);
      mixCounter[bucket] += 1;
    }

    const opportunityMix = Object.entries(mixCounter).map(([name, value]) => ({
      name,
      value,
      color: mixColors[name as keyof typeof mixColors],
    }));

    const recentActivity = [
      ...allIdeas.slice(0, 4).map((idea) => ({
        id: `idea-${idea.id}`,
        title:
          idea.status === "SAVED"
            ? "Snapshot Saved"
            : idea.status === "VALIDATED"
              ? "Idea Validated"
              : idea.status === "REJECTED"
                ? "Analysis Completed"
                : "New Idea Submitted",
        subtitle: idea.title,
        type:
          idea.status === "SAVED"
            ? "saved"
            : idea.status === "VALIDATED"
              ? "insight"
              : idea.status === "REJECTED"
                ? "alert"
                : "analysis",
        timeAgo: toTimeAgo(idea.updatedAt),
        timeMs: idea.updatedAt.getTime(),
      })),
      ...notes.slice(0, 2).map((note) => ({
        id: `note-${note.id}`,
        title: note.isPinned ? "Pinned Note Updated" : "Note Updated",
        subtitle: note.title,
        type: "insight" as const,
        timeAgo: toTimeAgo(note.updatedAt),
        timeMs: note.updatedAt.getTime(),
      })),
      ...tasks.slice(0, 2).map((task) => ({
        id: `task-${task.id}`,
        title: task.status === "DONE" ? "Task Completed" : "Task Updated",
        subtitle: task.title,
        type:
          task.status === "DONE" ? ("saved" as const) : ("analysis" as const),
        timeAgo: toTimeAgo(task.updatedAt),
        timeMs: task.updatedAt.getTime(),
      })),
    ]
      .sort((a, b) => b.timeMs - a.timeMs)
      .slice(0, 6);

    const industryMap = new Map<
      string,
      {
        totalDemand: number;
        count: number;
      }
    >();

    for (const idea of allIdeas) {
      const industry = idea.industry || "General";
      const prev = industryMap.get(industry) ?? { totalDemand: 0, count: 0 };
      industryMap.set(industry, {
        totalDemand: prev.totalDemand + (idea.marketDemand ?? 50),
        count: prev.count + 1,
      });
    }

    const marketTrends = [...industryMap.entries()]
      .map(([industry, entry]) => {
        const avgDemand = entry.totalDemand / entry.count;
        return {
          id: industry,
          category: industry.toUpperCase(),
          label: `${industry} opportunity landscape`,
          growth: Math.round(avgDemand),
          sample: entry.count,
          tag:
            avgDemand >= 75 ? "Hot" : avgDemand >= 60 ? "Trending" : "Emerging",
          color:
            avgDemand >= 75
              ? "#ea580c"
              : avgDemand >= 60
                ? "#8b5cf6"
                : "#06b6d4",
        };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 3);

    const quickInsight =
      marketTrends[0]?.label && marketTrends[0]?.growth
        ? `${marketTrends[0].label} shows ${marketTrends[0].growth}% demand momentum in your current idea portfolio.`
        : "Add your first idea analysis to unlock personalized trend insights.";

    return NextResponse.json({
      rangeDays,
      avg_novelty: avgNovelty,
      avg_market_pain: avgMarketPain,
      avg_opportunity: avgOpportunity,
      total_ideas: totalIdeas,
      top_keywords: topKeywords,
      distribution,
      stats: {
        totalIdeas: allIdeas.length,
        completedAnalyses,
        evidenceItems,
        indexedSources,
      },
      opportunityMix,
      recentActivity,
      marketTrends,
      quickInsight,
    });
  } catch (error: unknown) {
    console.error("DASHBOARD_OVERVIEW_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
