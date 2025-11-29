// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow Next internals, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[\w]+$/.test(pathname) // any file with an extension
  ) {
    return NextResponse.next();
  }

  // 1) Root: send "/" -> "/lvlup"
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/lvlup"; // <— make sure your route folder is "lvlup"
    url.search = search;
    return NextResponse.redirect(url);
  }

  // 2) Only allow /lvlup and /submit.
  // Any other path (e.g. /about, /random) -> redirect to /lvlup
  if (pathname !== "/lvlup" && pathname !== "/submit") {
    const url = req.nextUrl.clone();
    url.pathname = "/lvlup";
    url.search = search;
    return NextResponse.redirect(url);
  }

  // 3) /lvlup and /submit go through
  return NextResponse.next();
}

// match all routes except static files and next internals
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};