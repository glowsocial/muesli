import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { authConfig } from "./auth.config";
import { isGoogleEnabled } from "./lib/config";

// The Session type augmentation lives in auth.config.ts, next to the callbacks
// that write those fields.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  // The database adapter is used only with Google sign-in. Password-only mode
  // runs on JWT sessions (auth.config.ts) with no adapter and no database.
  ...(isGoogleEnabled() ? { adapter: PrismaAdapter(prisma) } : {}),
});
