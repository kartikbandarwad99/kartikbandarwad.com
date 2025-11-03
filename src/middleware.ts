// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow Next internals, API routes, and static files
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

  // send everything else to /Lvlup
  if (pathname === "/" || !pathname.startsWith("/Lvlup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/Lvlup";
    url.search = search; // keep query params (remove this if you don't want them)
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// match all routes except static files and next internals
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};