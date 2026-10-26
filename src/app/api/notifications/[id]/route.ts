import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
      select: { id: true, read: true },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("NOTIFICATION_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error("NOTIFICATION_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
