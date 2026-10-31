import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "../../../../../lib/prisma";

const PAGE_SIZE = 5;

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const filter = (url.searchParams.get("filter") || "all").toLowerCase();
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));

    // Raw SQL query joining Idea with the latest analysis and its persisted analysis_scores
    const rawRows = await prisma.$queryRaw<Array<{
      idea_id: string;
      idea_title: string;
      raw_idea_status: string;
      industry: string | null;
      idea_updated_at: Date;
      analysis_id: string | null;
      analysis_status: string | null;
      analysis_created_at: Date | null;
      analysis_completed_at: Date | null;
      score_map: Record<string, { score: number; status: string; explanation?: string }> | null;
    }>>`
      WITH latest_analyses AS (
        SELECT DISTINCT ON (idea_id)
          id as analysis_id,
          idea_id,
          status as analysis_status,
          current_stage,
          progress,
          created_at as analysis_created_at,
          completed_at as analysis_completed_at
        FROM analyses
        WHERE user_id = ${userId} OR user_id = 'anonymous' OR idea_id IS NOT NULL
        ORDER BY idea_id, created_at DESC
      ),
      aggregated_scores AS (
        SELECT 
          analysis_id,
          jsonb_object_agg(
            metric_name, 
            jsonb_build_object(
              'score', score,
              'status', status
            )
          ) as score_map
        FROM analysis_scores
        GROUP BY analysis_id
      )
      SELECT 
        i.id as idea_id,
        i.title as idea_title,
        i.status as raw_idea_status,
        i.industry,
        i."updatedAt" as idea_updated_at,
        la.analysis_id,
        la.analysis_status,
        la.analysis_created_at,
        la.analysis_completed_at,
        ascores.score_map
      FROM "Idea" i
      LEFT JOIN latest_analyses la ON la.idea_id = i.id
      LEFT JOIN aggregated_scores ascores ON ascores.analysis_id = la.analysis_id
      WHERE i."userId" = ${userId}
      ORDER BY i."updatedAt" DESC
    `;

    // Process and normalize rows
    const processedIdeas = rawRows.map((row) => {
      // 1. Resolve actual execution status
      let resolvedStatus: "Completed" | "In Progress" | "Draft" | "Failed" = "Draft";
      const aStat = (row.analysis_status || "").toUpperCase();

      if (aStat === "COMPLETED") {
        resolvedStatus = "Completed";
      } else if (aStat === "RUNNING" || aStat === "PENDING" || row.raw_idea_status === "ANALYZING") {
        resolvedStatus = "In Progress";
      } else if (aStat === "FAILED") {
        resolvedStatus = "Failed";
      } else if (row.raw_idea_status === "DRAFT" || !row.analysis_id) {
        resolvedStatus = "Draft";
      } else {
        resolvedStatus = "Draft";
      }

      // 2. Score mapping
      const sm = row.score_map || {};

      // Novelty
      const rawNovelty = sm["Novelty"]?.score;
      let noveltyScore: number | null = null;
      let noveltyLabel = "N/A";
      if (rawNovelty !== undefined && rawNovelty !== null) {
        // Normalize 0-1 or 0-100 to percentage
        noveltyScore = rawNovelty <= 1.0 ? Math.round(rawNovelty * 100) : Math.round(rawNovelty);
        noveltyLabel = noveltyScore >= 60 ? "High" : noveltyScore >= 35 ? "Medium" : "Low";
      }

      // Market Pain / Demand
      const rawMarket = sm["Market Pain"]?.score;
      let marketScore: number | null = null;
      let marketLabel = "N/A";
      if (rawMarket !== undefined && rawMarket !== null) {
        marketScore = Math.round(rawMarket);
        marketLabel = marketScore >= 60 ? "High" : marketScore >= 35 ? "Medium" : "Low";
      }

      // Competition / Saturation
      const rawSat = sm["Market Saturation"]?.score;
      let competitionScore: number | null = null;
      let competitionLabel = "N/A";
      if (rawSat !== undefined && rawSat !== null) {
        competitionScore = Math.round(rawSat);
        // Low saturation = High moat / Low incumbent density (favorable)
        competitionLabel = competitionScore <= 20 ? "Low" : competitionScore <= 50 ? "Medium" : "High";
      }

      // Feasibility
      const rawFeas = sm["Feasibility"]?.score;
      let feasibilityScore: number | null = null;
      let feasibilityLabel = "N/A";
      if (rawFeas !== undefined && rawFeas !== null) {
        feasibilityScore = Math.round(rawFeas);
        feasibilityLabel = feasibilityScore >= 70 ? "High" : feasibilityScore >= 45 ? "Medium" : "Low";
      }

      // Opportunity
      const rawOpp = sm["Opportunity"]?.score;
      const opportunityScore = rawOpp !== undefined && rawOpp !== null ? Math.round(rawOpp) : null;

      // Risk
      const rawRisk = sm["Risk Indicator"]?.score;
      const riskScore = rawRisk !== undefined && rawRisk !== null ? Math.round(rawRisk) : null;

      return {
        id: row.idea_id,
        analysisId: row.analysis_id,
        title: row.idea_title,
        industry: row.industry || "General",
        status: resolvedStatus,
        novelty: noveltyLabel,
        market: marketLabel,
        competition: competitionLabel,
        feasibility: feasibilityLabel,
        scores: {
          novelty: noveltyScore,
          market: marketScore,
          competition: competitionScore,
          feasibility: feasibilityScore,
          opportunity: opportunityScore,
          risk: riskScore,
        },
        hasScores: resolvedStatus === "Completed" && (noveltyScore !== null || feasibilityScore !== null),
        updatedAt: row.idea_updated_at.toISOString(),
      };
    });

    // Apply Filter & Search
    let filtered = processedIdeas;

    if (search) {
      filtered = filtered.filter((i) => i.title.toLowerCase().includes(search));
    }

    if (filter === "completed") {
      filtered = filtered.filter((i) => i.status === "Completed");
    } else if (filter === "in_progress") {
      filtered = filtered.filter((i) => i.status === "In Progress");
    } else if (filter === "draft") {
      filtered = filtered.filter((i) => i.status === "Draft" || i.status === "Failed");
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const paginatedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return NextResponse.json({
      items: paginatedItems,
      total,
      page,
      totalPages,
    });
  } catch (error: unknown) {
    console.error("DASHBOARD_RECENT_ANALYSES_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
