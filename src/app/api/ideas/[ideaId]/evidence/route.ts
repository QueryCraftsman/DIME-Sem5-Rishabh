import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> },
) {
  try {
    const { ideaId } = await params;
    const analysisId = ideaId; // Treating ideaId from path as analysisId for Phase 12

    // Proxy the request to the FastAPI backend
    const response = await fetch(
      `${FASTAPI_URL}/api/v1/analyses/${analysisId}/evidence`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `FastAPI error: ${response.status} - ${text}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error proxying to FastAPI /evidence:", error);
    return NextResponse.json(
      { error: "Internal Server Error during evidence proxy" },
      { status: 500 },
    );
  }
}
