import { NextRequest, NextResponse } from "next/server";
import { getCanonicalSiteUrl } from "@/lib/site-url";

export function middleware(request: NextRequest) {
  const canonicalUrl = new URL(getCanonicalSiteUrl());
  const requestHost = request.nextUrl.hostname;

  if (requestHost === "noesis.studio" && canonicalUrl.hostname === "www.noesis.studio") {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalUrl.origin);
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|icons).*)"]
};
