import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const normalizePrivateKey = (raw: string): string => {
  // Strip surrounding quotes that some env var UIs may add
  let key = raw.replace(/^["']|["']$/g, "").trim();
  // Convert literal \n sequences to real newlines
  key = key.replace(/\\n/g, "\n");
  // Add PEM headers if missing (user pasted raw base64 only)
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
  }
  return key;
};

const getFirebaseAdminApp = () => {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    credential: cert({
      projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: normalizePrivateKey(getRequiredEnv("FIREBASE_PRIVATE_KEY")),
    }),
  });
};

export const getFirebaseAdminAuth = () => getAuth(getFirebaseAdminApp());
