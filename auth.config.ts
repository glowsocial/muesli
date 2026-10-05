import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { isGoogleEnabled } from "./lib/config";

// The session fields the callbacks below write. Type-only, so this file stays
// edge-safe for middleware.ts.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authConfig = {
  providers: [
    // Google sign-in is registered only when both Google vars are set.
    ...(isGoogleEnabled() ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
        }
      }
    })] : []),
    Credentials({
      name: "Muesli Local",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validEmail = process.env.AUTH_EMAIL;
        const validPassword = process.env.AUTH_PASSWORD;

        if (!validEmail || !validPassword) {
          throw new Error("Auth not configured — set AUTH_EMAIL and AUTH_PASSWORD env vars");
        }

        if (
          credentials?.email === validEmail &&
          credentials?.password === validPassword
        ) {
          return {
            id: "1",
            email: validEmail,
            name: validEmail.split("@")[0],
          };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        token.email = user.email;
        token.sub = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.provider = token.provider as string;
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
