import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  try {
    const { comparisonId } = await params;
    const targetUrl = `${FASTAPI_URL}/api/v1/comparisons/${comparisonId}`;
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
    console.error("COMPARISON_DETAIL_GET_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  try {
    const { comparisonId } = await params;
    const body = await req.json();

    const targetUrl = `${FASTAPI_URL}/api/v1/comparisons/${comparisonId}`;
    const res = await fetch(targetUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new NextResponse(errText, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("COMPARISON_DETAIL_PATCH_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  try {
    const { comparisonId } = await params;
    const targetUrl = `${FASTAPI_URL}/api/v1/comparisons/${comparisonId}`;
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new NextResponse(errText, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("COMPARISON_DETAIL_DELETE_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
