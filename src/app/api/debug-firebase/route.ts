import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

export async function GET() {
  const diagnostics: Record<string, string> = {};

  // Check env vars exist
  diagnostics.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ? "SET" : "MISSING";
  diagnostics.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ? "SET" : "MISSING";
  diagnostics.FIREBASE_PRIVATE_KEY_LENGTH = process.env.FIREBASE_PRIVATE_KEY
    ? `${process.env.FIREBASE_PRIVATE_KEY.length} chars`
    : "MISSING";
  diagnostics.FIREBASE_PRIVATE_KEY_START = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 30)
    : "MISSING";
  diagnostics.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "SET" : "MISSING";
  diagnostics.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "MISSING";

  // Try initializing Firebase Admin
  try {
    const auth = getFirebaseAdminAuth();
    diagnostics.firebase_admin_init = "SUCCESS";

    // Try a simple operation to verify credentials work
    try {
      await auth.getUser("test-nonexistent-uid").catch((err: { code?: string }) => {
        // "user-not-found" means the SDK is working correctly
        if (err.code === "auth/user-not-found") {
          diagnostics.firebase_admin_auth = "WORKING (credentials valid)";
        } else {
          diagnostics.firebase_admin_auth = `ERROR: ${String(err)}`;
        }
      });
    } catch (err) {
      diagnostics.firebase_admin_auth = `ERROR: ${String(err)}`;
    }
  } catch (err) {
    diagnostics.firebase_admin_init = `FAILED: ${String(err)}`;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
