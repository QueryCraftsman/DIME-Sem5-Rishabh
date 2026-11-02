import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "Untitled Idea";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const targetAudience = typeof body?.targetAudience === "string" ? body.targetAudience.trim().toLowerCase() : "";
    const industrySource = typeof body?.industry === "string" ? body.industry : body?.domain;
    const industry = typeof industrySource === "string" ? industrySource.trim() : "";
    
    // New validation fields
    const formFactors = Array.isArray(body?.formFactors) ? JSON.stringify(body.formFactors) : null;
    const budget = typeof body?.budget === "string" ? body.budget : null;
    const teamSize = typeof body?.teamSize === "string" ? body.teamSize : null;
    const timeline = typeof body?.timeline === "string" ? body.timeline : null;
    const preferredTechnologies = Array.isArray(body?.preferredTechnologies) 
      ? JSON.stringify(body.preferredTechnologies) 
      : (typeof body?.preferredTechnologies === "string" ? body.preferredTechnologies : null);
    const analysisDepth = typeof body?.analysisDepth === "string" ? body.analysisDepth : "STANDARD";

    if (!title) {
      return new NextResponse("Missing title", { status: 400 });
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        targetAudience,
        industry,
        formFactors,
        budget,
        teamSize,
        timeline,
        preferredTechnologies,
        analysisDepth,
        status: "DRAFT",
        userId: session.user.id,
      },
    });

    return NextResponse.json(idea);
  } catch (error: unknown) {
    console.error("IDEA_CREATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);

    const ideas = await prisma.idea.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50,
    });

    if (ideas.length === 0) {
      return NextResponse.json([]);
    }

    // Retrieve latest live analysis status and calibrated scores directly from backend tables
    const ideaIds = ideas.map((i) => i.id);
    try {
      const analysesData: Array<{
        idea_id: string;
        analysis_id: string;
        analysis_status: string;
        feasibility_score: number | null;
        demand_score: number | null;
        opportunity_score: number | null;
        novelty_score: number | null;
      }> = await prisma.$queryRaw`
        WITH latest_analyses AS (
          SELECT DISTINCT ON (idea_id)
            id AS analysis_id, idea_id, status AS analysis_status
          FROM analyses
          WHERE idea_id = ANY(${ideaIds})
          ORDER BY idea_id, created_at DESC
        ),
        scores_agg AS (
          SELECT 
            analysis_id,
            MAX(CASE WHEN metric_name ILIKE '%feasibility%' THEN score END) AS feasibility_score,
            MAX(CASE WHEN metric_name ILIKE '%market demand%' OR metric_name ILIKE '%market pain%' THEN score END) AS demand_score,
            MAX(CASE WHEN metric_name ILIKE '%opportunity%' THEN score END) AS opportunity_score,
            MAX(CASE WHEN metric_name ILIKE '%novelty%' THEN score END) AS novelty_score
          FROM analysis_scores
          GROUP BY analysis_id
        )
        SELECT 
          la.idea_id,
          la.analysis_id,
          la.analysis_status,
          sa.feasibility_score,
          sa.demand_score,
          sa.opportunity_score,
          sa.novelty_score
        FROM latest_analyses la
        LEFT JOIN scores_agg sa ON sa.analysis_id = la.analysis_id;
      `;

      const analysisMap = new Map(analysesData.map((a) => [a.idea_id, a]));

      // Merge real live status and calibrated intelligence metrics
      const enrichedIdeas = ideas.map((idea) => {
        const analysis = analysisMap.get(idea.id);
        if (!analysis) {
          return idea;
        }

        let effectiveStatus = idea.status;
        const aStatus = (analysis.analysis_status || "").toUpperCase();
        if (aStatus === "COMPLETED") {
          effectiveStatus = "VALIDATED";
        } else if (
          [
            "RUNNING",
            "PLANNING",
            "RESEARCHING",
            "COMPETING",
            "RETRIEVING",
            "SYNTHESIZING",
            "SCORING",
            "PENDING",
          ].includes(aStatus)
        ) {
          effectiveStatus = "ANALYZING";
        } else if (aStatus === "FAILED") {
          effectiveStatus = "FAILED";
        }

        return {
          ...idea,
          status: effectiveStatus,
          feasibilityScore: analysis.feasibility_score ?? idea.feasibilityScore,
          marketDemand: analysis.demand_score ?? idea.marketDemand,
          opportunityScore: analysis.opportunity_score ?? idea.opportunityScore,
          noveltyScore: analysis.novelty_score ?? idea.noveltyScore,
        };
      });

      return NextResponse.json(enrichedIdeas);
    } catch (dbErr) {
      console.warn("Could not query raw analysis statuses, falling back to prisma idea records:", dbErr);
      return NextResponse.json(ideas);
    }
  } catch (error: unknown) {
    console.error("IDEAS_FETCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
