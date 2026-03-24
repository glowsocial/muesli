import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const isProtected =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth"));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/upload/:path*",
    "/api/recordings/:path*",
    "/api/notes/:path*",
    "/api/process/:path*",
  ],
};
