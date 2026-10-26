import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { getUserPreferences, updateUserPreferences, UserPreferencesData } from "@/lib/user-preferences";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const preferences = await getUserPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (error: unknown) {
    console.error("PREFERENCES_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updateData: Partial<UserPreferencesData> = {};

    if (body.theme && ["light", "dark", "system"].includes(body.theme)) {
      updateData.theme = body.theme;
    }
    if (typeof body.emailNotifications === "boolean") {
      updateData.emailNotifications = body.emailNotifications;
    }
    if (typeof body.analysisCompletedNotifications === "boolean") {
      updateData.analysisCompletedNotifications = body.analysisCompletedNotifications;
    }
    if (typeof body.analysisFailedNotifications === "boolean") {
      updateData.analysisFailedNotifications = body.analysisFailedNotifications;
    }
    if (typeof body.weeklyDigest === "boolean") {
      updateData.weeklyDigest = body.weeklyDigest;
    }
    if (body.defaultAnalysisDepth && ["STANDARD", "DEEP"].includes(body.defaultAnalysisDepth)) {
      updateData.defaultAnalysisDepth = body.defaultAnalysisDepth;
    }
    if (body.defaultWorkspaceView && ["overview", "activity"].includes(body.defaultWorkspaceView)) {
      updateData.defaultWorkspaceView = body.defaultWorkspaceView;
    }

    const updated = await updateUserPreferences(userId, updateData);
    return NextResponse.json({ preferences: updated });
  } catch (error: unknown) {
    console.error("PREFERENCES_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
