import { auth } from "../../auth";
import { prisma } from "@/lib/db";

export { auth };

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  if (process.env.NODE_ENV === "development") {
    const devUser =
      (await prisma.user.findFirst({
        where: { email: "vivekchaurasiya943@gmail.com" },
        select: { id: true },
      })) || (await prisma.user.findFirst({ select: { id: true } }));

    if (devUser) return devUser.id;
  }

  return null;
}
