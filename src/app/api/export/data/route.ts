import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import { getUserPreferences } from "@/lib/user-preferences";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Fetch preferences
    const preferences = await getUserPreferences(userId);

    // Fetch user ideas
    const ideas = await prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user notes
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const exportPayload = {
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      platform: "DIME AI Product Intelligence",
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      preferences,
      summary: {
        totalIdeas: ideas.length,
        totalNotes: notes.length,
      },
      ideas,
      notes,
    };

    const filename = `dime_workspace_export_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("DATA_EXPORT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
