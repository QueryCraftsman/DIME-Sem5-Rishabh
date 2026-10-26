import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

type RouteContext = {
  params: Promise<{
    ideaId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ideaId } = await context.params;
    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${fastApiUrl}/api/v1/analyses?idea_id=${ideaId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("FastAPI list analyses error:", err);
      return new NextResponse("Failed to fetch analyses", { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("IDEA_ANALYSES_FETCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
