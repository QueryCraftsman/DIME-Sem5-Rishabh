import { prisma } from "@/lib/db";

export interface UserPreferencesData {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  analysisCompletedNotifications: boolean;
  analysisFailedNotifications: boolean;
  weeklyDigest: boolean;
  defaultAnalysisDepth: "STANDARD" | "DEEP";
  defaultWorkspaceView: "overview" | "activity";
}

export const DEFAULT_PREFERENCES: UserPreferencesData = {
  theme: "system",
  emailNotifications: true,
  analysisCompletedNotifications: true,
  analysisFailedNotifications: true,
  weeklyDigest: false,
  defaultAnalysisDepth: "STANDARD",
  defaultWorkspaceView: "overview",
};

export async function getUserPreferences(userId: string): Promise<UserPreferencesData> {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "theme", "emailNotifications", "analysisCompletedNotifications", "analysisFailedNotifications", "weeklyDigest", "defaultAnalysisDepth", "defaultWorkspaceView" 
       FROM "UserPreference" WHERE "userId" = $1 LIMIT 1`,
      userId
    );
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        theme: (r.theme as "light" | "dark" | "system") || "system",
        emailNotifications: r.emailNotifications ?? true,
        analysisCompletedNotifications: r.analysisCompletedNotifications ?? true,
        analysisFailedNotifications: r.analysisFailedNotifications ?? true,
        weeklyDigest: r.weeklyDigest ?? false,
        defaultAnalysisDepth: (r.defaultAnalysisDepth as "STANDARD" | "DEEP") || "STANDARD",
        defaultWorkspaceView: (r.defaultWorkspaceView as "overview" | "activity") || "overview",
      };
    }
  } catch (err) {
    console.error("Error fetching user preferences:", err);
  }
  return DEFAULT_PREFERENCES;
}

export async function updateUserPreferences(
  userId: string,
  data: Partial<UserPreferencesData>
): Promise<UserPreferencesData> {
  const current = await getUserPreferences(userId);
  const updated: UserPreferencesData = {
    ...current,
    ...data,
  };

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserPreference" ("id", "userId", "theme", "emailNotifications", "analysisCompletedNotifications", "analysisFailedNotifications", "weeklyDigest", "defaultAnalysisDepth", "defaultWorkspaceView", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT ("userId") DO UPDATE SET
         "theme" = EXCLUDED."theme",
         "emailNotifications" = EXCLUDED."emailNotifications",
         "analysisCompletedNotifications" = EXCLUDED."analysisCompletedNotifications",
         "analysisFailedNotifications" = EXCLUDED."analysisFailedNotifications",
         "weeklyDigest" = EXCLUDED."weeklyDigest",
         "defaultAnalysisDepth" = EXCLUDED."defaultAnalysisDepth",
         "defaultWorkspaceView" = EXCLUDED."defaultWorkspaceView",
         "updatedAt" = NOW()`,
      `pref_${userId}`,
      userId,
      updated.theme,
      updated.emailNotifications,
      updated.analysisCompletedNotifications,
      updated.analysisFailedNotifications,
      updated.weeklyDigest,
      updated.defaultAnalysisDepth,
      updated.defaultWorkspaceView
    );
  } catch (err) {
    console.error("Error updating user preferences:", err);
  }

  return updated;
}
