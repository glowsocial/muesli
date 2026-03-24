import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
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
    }),
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
    async jwt({ token, account }) {
      // Persist the Google OAuth access_token right in the token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      // @ts-ignore
      session.accessToken = token.accessToken as string;
      // @ts-ignore
      session.refreshToken = token.refreshToken as string;
      // @ts-ignore
      session.provider = token.provider as string;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
