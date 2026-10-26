import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const encoder = new TextEncoder();

  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Initial connection event
      try {
        const unreadCount = await prisma.notification.count({
          where: { userId, read: false },
        });

        const initialData = JSON.stringify({
          type: "connected",
          unreadCount,
          timestamp: new Date().toISOString(),
        });

        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));
      } catch (err) {
        console.error("SSE initial emit error", err);
      }

      // 2. Poll & Heartbeat ticker every 8 seconds
      let lastKnownUnread = -1;

      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }

        try {
          const currentUnread = await prisma.notification.count({
            where: { userId, read: false },
          });

          // If count changed or to send heartbeat
          if (currentUnread !== lastKnownUnread) {
            lastKnownUnread = currentUnread;

            // Fetch the latest 3 notifications for instant synchronization
            const recent = await prisma.notification.findMany({
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 5,
              select: {
                id: true,
                title: true,
                message: true,
                type: true,
                read: true,
                createdAt: true,
              },
            });

            const payload = JSON.stringify({
              type: "notifications_update",
              unreadCount: currentUnread,
              notifications: recent,
              timestamp: new Date().toISOString(),
            });

            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          } else {
            // Heartbeat comment ping to keep connection alive
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        } catch (err) {
          if (!isClosed) {
            console.error("SSE interval check error", err);
          }
        }
      }, 8000);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
