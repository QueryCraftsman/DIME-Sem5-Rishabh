import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";


const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    if (session?.user?.id && !url.searchParams.has("user_id")) {
      url.searchParams.set("user_id", session.user.id);
    }
    const searchParams = url.searchParams.toString();

    const targetUrl = `${FASTAPI_URL}/api/v1/comparisons/eligible-ideas${searchParams ? `?${searchParams}` : ""}`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new NextResponse(errText, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ELIGIBLE_IDEAS_GET_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
