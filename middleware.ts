export { auth as middleware } from "@/auth";

export const config = {
  // Protect /dashboard and all API routes except auth
  matcher: ["/dashboard/:path*", "/api/upload/:path*", "/api/recordings/:path*", "/api/notes/:path*", "/api/process/:path*"],
};
