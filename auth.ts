import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { getFirebaseAdminAuth } from "./src/lib/firebase-admin";

export class DatabaseUnavailableError extends CredentialsSignin {
  code = "DatabaseUnavailable";
}

export class InvalidTokenError extends CredentialsSignin {
  code = "InvalidToken";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error("NEXTAUTH_ERROR", code, ...message);
    },
    warn(code, ...message) {
      console.warn("NEXTAUTH_WARN", code, ...message);
    },
  },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "firebase-google",
      name: "Firebase Google",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken =
          typeof credentials?.idToken === "string" ? credentials.idToken : "";

        if (!idToken) {
          return null;
        }

        let decodedToken;
        try {
          decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
        } catch (tokenError) {
          console.error("FIREBASE_AUTH_TOKEN_VERIFY_ERROR:", tokenError);
          throw new InvalidTokenError();
        }

        const email = decodedToken.email?.trim().toLowerCase();
        const firebaseUid = decodedToken.uid?.trim();

        if (!email || !firebaseUid) {
          console.error("FIREBASE_AUTH_ERROR: Missing email or uid in token", decodedToken);
          return null;
        }

        console.log("FIREBASE_AUTH: Upserting user", email);

        try {
          const user = await prisma.user.upsert({
            where: { email },
            update: {
              name: decodedToken.name ?? undefined,
              image: decodedToken.picture ?? undefined,
              emailVerified: decodedToken.email_verified
                ? new Date()
                : undefined,
            },
            create: {
              email,
              name: decodedToken.name ?? email.split("@")[0],
              image: decodedToken.picture,
              emailVerified: decodedToken.email_verified ? new Date() : null,
            },
          });

          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "firebase",
                providerAccountId: firebaseUid,
              },
            },
            update: {
              userId: user.id,
              type: "oauth",
            },
            create: {
              userId: user.id,
              type: "oauth",
              provider: "firebase",
              providerAccountId: firebaseUid,
            },
          });

          console.log("FIREBASE_AUTH: Upserted account successfully");

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image ?? undefined,
          };
        } catch (dbError) {
          console.error(
            "FIREBASE_AUTH_DATABASE_ERROR: Database unavailable or failed to upsert user. Check if PostgreSQL container is running on localhost:5433.",
            dbError
          );
          throw new DatabaseUnavailableError();
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = String(credentials.email).trim().toLowerCase();
        const rawPassword = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          rawPassword,
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
});
