import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { isGoogleEnabled } from "./lib/config";

// The session fields the callbacks below write. Type-only, so this file stays
// edge-safe for middleware.ts.
declare module "next-auth" {
  interface Session {
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
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.sub = user.id;
      }
      // Google credentials belong to the server-side Account record. Remove
      // copies from cookies created before this change as each session is read.
      delete token.accessToken;
      delete token.refreshToken;
      delete token.provider;
      return token;
    },
    async session({ session, token }) {
      const publicSession = { expires: session.expires, user: session.user };
      if (publicSession.user) {
        if (token.sub) publicSession.user.id = token.sub;
        if (token.email) publicSession.user.email = token.email as string;
      }
      return publicSession;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
