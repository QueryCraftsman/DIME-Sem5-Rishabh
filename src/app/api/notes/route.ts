import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/server-auth";

const normalize = (value: string | null) => (value ?? "").trim().toLowerCase();

const allowedTones = new Set(["orange", "blue", "green", "purple", "amber", "rose"]);

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  if (process.env.NODE_ENV === "development") {
    const devUser = await prisma.user.findFirst({ select: { id: true } });
    if (devUser) return devUser.id;
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const category = normalize(url.searchParams.get("category"));
    const search = normalize(url.searchParams.get("search"));
    const sort = normalize(url.searchParams.get("sort")) || "updated";
    const ideaId = url.searchParams.get("ideaId");

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(ideaId ? { ideaId } : {}),
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            industry: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      take: 200,
    });

    let filtered = notes;

    if (category && category !== "all" && category !== "all notes") {
      filtered = filtered.filter(
        (note) => note.category.toLowerCase() === category,
      );
    }

    if (search) {
      filtered = filtered.filter((note) => {
        const haystack = `${note.title} ${note.content} ${note.category} ${note.idea?.title || ""}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    if (sort === "title") {
      filtered = filtered
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "oldest") {
      filtered = filtered
        .slice()
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    }

    // Default presets + user custom categories
    const categorySet = new Set<string>([
      "All Notes",
      "Market Research",
      "Tech Stack",
      "User Feedback",
      "Design Ideas",
      "Competitive Intel",
      "General",
    ]);

    notes.forEach((n) => {
      if (n.category && n.category.trim()) {
        categorySet.add(n.category.trim());
      }
    });

    return NextResponse.json({
      items: filtered,
      total: filtered.length,
      categories: Array.from(categorySet),
    });
  } catch (error: unknown) {
    console.error("NOTES_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

type CreatePayload = {
  title?: string;
  content?: string;
  category?: string;
  tone?: string;
  isPinned?: boolean;
  ideaId?: string | null;
};

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as CreatePayload;
    const title = (body.title ?? "").trim();
    const content = (body.content ?? "").trim();

    if (title.length < 2 || content.length < 2) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title,
        content,
        category: (body.category ?? "General").trim() || "General",
        tone: allowedTones.has((body.tone ?? "").trim())
          ? (body.tone ?? "orange")
          : "orange",
        isPinned: Boolean(body.isPinned),
        ideaId: body.ideaId?.trim() || null,
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            industry: true,
          },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error: unknown) {
    console.error("NOTES_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
