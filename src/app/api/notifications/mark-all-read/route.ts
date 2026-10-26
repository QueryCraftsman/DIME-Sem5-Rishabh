import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/notifications/mark-all-read
 *
 * Marks every unread notification for the authenticated user as read.
 * Returns the count of notifications that were updated.
 */
export async function POST() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error: unknown) {
    console.error("NOTIFICATIONS_MARK_ALL_READ_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
