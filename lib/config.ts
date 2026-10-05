// lib/config.ts — edge-safe: reads env only, imports nothing.
export function isGoogleEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}
