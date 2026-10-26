import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search Ideas belonging to current user
    const ideasPromise = prisma.idea.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { industry: { contains: query, mode: "insensitive" } },
          { targetAudience: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        industry: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    // Search Notes belonging to current user
    const notesPromise = prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    const [ideas, notes] = await Promise.all([ideasPromise, notesPromise]);

    const results = [
      ...ideas.map((idea) => ({
        id: idea.id,
        type: "idea" as const,
        title: idea.title,
        subtitle: `${idea.industry || "General"} • ${idea.status || "Draft"}`,
        href: `/ideas/${idea.id}`,
        updatedAt: idea.updatedAt.toISOString(),
      })),
      ...notes.map((note) => ({
        id: note.id,
        type: "note" as const,
        title: note.title,
        subtitle: `Note in ${note.category || "General"}`,
        href: `/notes`,
        updatedAt: note.updatedAt.toISOString(),
      })),
    ];

    return NextResponse.json({ results, total: results.length });
  } catch (error: unknown) {
    console.error("SEARCH_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
