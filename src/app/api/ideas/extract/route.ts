import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const rawDescription = typeof body?.raw_description === "string" ? body.raw_description.trim() : "";

    if (!rawDescription || rawDescription.length < 15) {
      return NextResponse.json(
        { error: "Description must be at least 15 characters long." },
        { status: 400 }
      );
    }

    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${fastApiUrl}/api/v1/ideas/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Idea Extract Error:", errorText);
      return new NextResponse(errorText || "Extraction service failed", { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("IDEA_EXTRACT_API_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
