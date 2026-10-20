import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { signalTitle, evidenceId, reason } = body;

    const userId = session?.user?.id;
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: `Signal Flagged: ${signalTitle || "Evidence"}`,
          message: `Evidence citation ${evidenceId || "N/A"} was flagged: ${reason || "User verification requested."}`,
          type: "SIGNAL_FLAGGED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Signal flagged for review and verification.",
      flaggedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("FLAG_SIGNAL_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
