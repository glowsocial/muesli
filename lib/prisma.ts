import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Append the connect timeout with the right separator. Returns undefined when
// DATABASE_URL is unset or blank (password-only mode has no database).
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return undefined;
  return url + (url.includes("?") ? "&" : "?") + "connect_timeout=5";
}

function createClient(): PrismaClient {
  const url = databaseUrl();
  // With no DATABASE_URL, construct with no datasource override so importing
  // this module never throws. A query would fail, and none runs in
  // password-only mode.
  return url ? new PrismaClient({ datasources: { db: { url } } }) : new PrismaClient();
}

export const prisma = global.prisma || createClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
