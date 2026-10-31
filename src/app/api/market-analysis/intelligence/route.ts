import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/server-auth";
import type { MarketIntelligencePayload } from "@/types/market-analysis";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedIdeaId = url.searchParams.get("ideaId");
    const requestedAnalysisId = url.searchParams.get("analysisId");

    const session = await auth();
    const userId = session?.user?.id;

    // Use 127.0.0.1 to avoid Windows Node.js 24 IPv6 (::1) lookup delay
    let rawFastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    if (rawFastApiUrl.includes("localhost")) {
      rawFastApiUrl = rawFastApiUrl.replace("localhost", "127.0.0.1");
    }
    const fastApiUrl = rawFastApiUrl;

    // 1. Resolve Target Analysis ID
    let resolvedAnalysisId: string | null = requestedAnalysisId;

    // Fast path: if analysisId was provided directly, query FastAPI immediately
    if (resolvedAnalysisId) {
      try {
        const miRes = await fetch(
          `${fastApiUrl}/api/v1/analyses/${resolvedAnalysisId}/market-intelligence`,
          {
            cache: "no-store",
            signal: AbortSignal.timeout(6000),
          }
        );

        if (miRes.ok) {
          const miData: MarketIntelligencePayload = await miRes.json();
          return NextResponse.json(miData);
        }
      } catch (fetchErr: any) {
        console.warn("Direct FastAPI fetch failed, falling back to database check:", fetchErr?.message || fetchErr);
      }
    }

    // If analysisId wasn't passed directly, resolve from database
    let targetIdea: any = null;
    if (!resolvedAnalysisId && requestedIdeaId) {
      targetIdea = await prisma.idea.findUnique({
        where: { id: requestedIdeaId },
      });

      if (targetIdea) {
        const dbAnalyses = await prisma.$queryRaw<Array<{ id: string; status: string }>>`
          SELECT id, status FROM analyses WHERE idea_id = ${targetIdea.id} ORDER BY created_at DESC LIMIT 1;
        `;
        if (dbAnalyses.length > 0) {
          resolvedAnalysisId = dbAnalyses[0].id;
        }
      }
    }

    // If neither ideaId nor analysisId was passed, resolve the user's most recent completed analysis
    if (!resolvedAnalysisId) {
      if (userId) {
        const userAnalyses = await prisma.$queryRaw<Array<{ id: string; idea_id: string }>>`
          SELECT id, idea_id FROM analyses 
          WHERE user_id = ${userId} AND UPPER(status::text) = 'COMPLETED' 
          ORDER BY created_at DESC LIMIT 1;
        `;
        if (userAnalyses.length > 0) {
          resolvedAnalysisId = userAnalyses[0].id;
        }
      }

      // Global fallback to most recent completed analysis in system
      if (!resolvedAnalysisId) {
        const recentCompleted = await prisma.$queryRaw<Array<{ id: string; idea_id: string }>>`
          SELECT id, idea_id FROM analyses 
          WHERE UPPER(status::text) = 'COMPLETED' 
          ORDER BY created_at DESC LIMIT 1;
        `;
        if (recentCompleted.length > 0) {
          resolvedAnalysisId = recentCompleted[0].id;
        }
      }
    }

    if (!resolvedAnalysisId) {
      return NextResponse.json(
        { error: "No completed analysis found for this concept. Run validation to generate intelligence." },
        { status: 404 }
      );
    }

    // 2. Fetch Dynamic Market Intelligence from FastAPI Backend
    let miRes: Response | null = null;
    let fastApiErrorDetail: any = null;

    try {
      miRes = await fetch(
        `${fastApiUrl}/api/v1/analyses/${resolvedAnalysisId}/market-intelligence`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        }
      );

      if (miRes.ok) {
        const miData: MarketIntelligencePayload = await miRes.json();
        return NextResponse.json(miData);
      } else {
        try {
          fastApiErrorDetail = await miRes.json();
        } catch (_) {
          fastApiErrorDetail = await miRes.text();
        }
      }
    } catch (fetchErr: any) {
      console.warn("FastAPI backend connection warning:", fetchErr?.message || fetchErr);
    }

    // If FastAPI returned an error or is unreachable, inspect the analysis status in DB
    const [dbAnalysis] = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      status: string;
      domain: string | null;
      created_at: Date;
    }>>`
      SELECT id, title, status, domain, created_at FROM analyses WHERE id = ${resolvedAnalysisId} LIMIT 1;
    `;

    if (!dbAnalysis) {
      return NextResponse.json(
        { error: "Analysis record not found." },
        { status: 404 }
      );
    }

    const normalizedStatus = String(dbAnalysis.status || "").toUpperCase();
    if (normalizedStatus !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `Market intelligence pipeline is currently ${dbAnalysis.status.toLowerCase()}. Please wait for research acquisition and scoring to complete.`,
          status: dbAnalysis.status,
          analysisId: dbAnalysis.id,
        },
        { status: 202 }
      );
    }

    if (!miRes) {
      return NextResponse.json(
        {
          error: `FastAPI service unreachable at ${fastApiUrl}. Ensure the Python backend is running on port 8000.`,
          status: "SERVICE_UNREACHABLE",
          analysisId: dbAnalysis.id,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to load market intelligence from intelligence service.",
        detail: fastApiErrorDetail,
      },
      { status: miRes?.status || 500 }
    );
  } catch (error: any) {
    console.error("Market Intelligence API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error retrieving market intelligence." },
      { status: 500 }
    );
  }
}
