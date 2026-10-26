import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        createdAt: true,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: unknown) {
    console.error("NOTIFICATIONS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
