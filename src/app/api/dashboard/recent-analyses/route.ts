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
    const filter = url.searchParams.get("filter") || "all";
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    const whereClause: any = { userId };
    
    if (filter === "completed") {
      whereClause.status = { in: ["VALIDATED", "REJECTED", "COMPLETED"] };
    } else if (filter === "in_progress") {
      whereClause.status = "ANALYZING";
    } else if (filter === "draft") {
      whereClause.status = "DRAFT";
    }

    const [totalItems, ideas] = await Promise.all([
      prisma.idea.count({ where: whereClause }),
      prisma.idea.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        select: {
          id: true,
          title: true,
          status: true,
          innovationScore: true,
          marketDemand: true,
          competitionLevel: true,
          feasibilityScore: true,
          updatedAt: true,
        },
      }),
    ]);

    const ideaIds = ideas.map(i => i.id);
    const analysisMap = new Map<string, string>();
    if (ideaIds.length > 0) {
      try {
        const rows = await prisma.$queryRaw<Array<{ id: string; idea_id: string }>>`
          SELECT DISTINCT ON (idea_id) id, idea_id
          FROM analyses
          WHERE idea_id = ANY(${ideaIds})
          ORDER BY idea_id, created_at DESC
        `;
        for (const row of rows) {
          analysisMap.set(row.idea_id, row.id);
        }
      } catch {
        // Safe fallback if table is not yet populated
      }
    }

    const formattedIdeas = ideas.map(idea => {
      // Logic for high/med/low values based on score
      const getLabel = (score: number | null) => {
        if (score === null || score === undefined) return "N/A";
        if (score >= 70) return "High";
        if (score >= 40) return "Medium";
        return "Low";
      };

      const getStatusLabel = (status: string) => {
        switch(status) {
          case "VALIDATED":
          case "REJECTED": 
          case "COMPLETED": return "Completed";
          case "ANALYZING": return "In Progress";
          default: return "Draft";
        }
      };

      return {
        id: idea.id,
        analysisId: analysisMap.get(idea.id) ?? null,
        title: idea.title,
        status: getStatusLabel(idea.status),
        novelty: getLabel(idea.innovationScore),
        market: getLabel(idea.marketDemand),
        competition: getLabel(idea.competitionLevel),
        feasibility: getLabel(idea.feasibilityScore),
        updatedAt: idea.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      items: formattedIdeas,
      total: totalItems,
      page,
      totalPages: Math.ceil(totalItems / PAGE_SIZE)
    });
  } catch (error: unknown) {
    console.error("DASHBOARD_RECENT_ANALYSES_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
