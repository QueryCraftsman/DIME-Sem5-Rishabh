import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ unreadCount });
  } catch (error: unknown) {
    console.error("NOTIFICATIONS_UNREAD_COUNT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
