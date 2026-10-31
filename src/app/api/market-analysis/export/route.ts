import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "csv";
    const ideaId = url.searchParams.get("ideaId");
    const analysisId = url.searchParams.get("analysisId");

    let rawFastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    if (rawFastApiUrl.includes("localhost")) {
      rawFastApiUrl = rawFastApiUrl.replace("localhost", "127.0.0.1");
    }
    const fastApiUrl = rawFastApiUrl;

    // Resolve analysis
    let resolvedAnalysisId: string | null = analysisId;
    if (!resolvedAnalysisId && ideaId) {
      const dbAnalyses = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM analyses WHERE idea_id = ${ideaId} ORDER BY created_at DESC LIMIT 1;
      `;
      if (dbAnalyses.length > 0) {
        resolvedAnalysisId = dbAnalyses[0].id;
      }
    }

    if (!resolvedAnalysisId) {
      const recentCompleted = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM analyses WHERE status = 'COMPLETED' ORDER BY created_at DESC LIMIT 1;
      `;
      if (recentCompleted.length > 0) {
        resolvedAnalysisId = recentCompleted[0].id;
      }
    }

    let miData: any = null;
    if (resolvedAnalysisId) {
      try {
        const miRes = await fetch(
          `${fastApiUrl}/api/v1/analyses/${resolvedAnalysisId}/market-intelligence`,
          { cache: "no-store" }
        );
        if (miRes.ok) {
          miData = await miRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch market intelligence for export:", err);
      }
    }

    const series1Header = miData?.demandChart?.series1Label || "Primary Solution Inquiries (0-100)";
    const series2Header = miData?.demandChart?.series2Label || "Customer Friction Mentions (0-100)";
    const ideaTitle = miData?.idea?.title || "Concept";

    const points = miData?.demandChart?.points || [
      { month: "Oct 25", mockToolSearches: 18, painMentions: 32 },
      { month: "Nov", mockToolSearches: 24, painMentions: 37 },
      { month: "Dec", mockToolSearches: 30, painMentions: 42 },
      { month: "Jan 26", mockToolSearches: 42, painMentions: 50 },
      { month: "Feb", mockToolSearches: 52, painMentions: 58 },
      { month: "Mar", mockToolSearches: 62, painMentions: 65 },
      { month: "Apr", mockToolSearches: 70, painMentions: 72 },
      { month: "May", mockToolSearches: 77, painMentions: 78 },
      { month: "Jun", mockToolSearches: 82, painMentions: 84 },
      { month: "Jul", mockToolSearches: 85, painMentions: 89 },
      { month: "Aug", mockToolSearches: 87, painMentions: 94 },
      { month: "Sep 26", mockToolSearches: 88, painMentions: 97 },
    ];

    const rows: string[][] = [
      ["Month", series1Header, series2Header, "Velocity Note"],
      ...points.map((pt: any) => [
        pt.month,
        String(pt.mockToolSearches),
        String(pt.painMentions),
        `Normalized signal for ${ideaTitle}`,
      ]),
    ];

    if (format === "json") {
      const jsonRecords = rows.slice(1).map((r) => ({
        month: r[0],
        series1Score: Number(r[1]),
        series2Score: Number(r[2]),
        note: r[3],
      }));
      return NextResponse.json(jsonRecords);
    }

    const csvContent = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dime-market-signals-${(ideaTitle || "data").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("EXPORT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
