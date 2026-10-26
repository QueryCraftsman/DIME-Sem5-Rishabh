import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Conversation history must be a non-empty array." },
        { status: 400 }
      );
    }

    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${fastApiUrl}/api/v1/ideas/builder-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: body.messages }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Builder Chat Error:", errorText);
      return new NextResponse(errorText || "Builder chat service failed", { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("BUILDER_CHAT_API_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
