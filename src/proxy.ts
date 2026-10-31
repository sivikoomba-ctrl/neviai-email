import { NextRequest, NextResponse } from "next/server";

// Cloudflare Access guards email.neviai.ai, but the app has no login of its own, so every
// request must come through the neviai-proxy Worker or the CRM app (both send this
// header). Without it the run.app address would skip Access. Resend's webhook and the
// open-tracking pixel are called by outsiders, so they stay open.
const PUBLIC_PATHS = ["/api/webhooks/resend", "/api/track/"];

export function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const expected = process.env.PROXY_SECRET;
  if (!expected || request.headers.get("x-neviai-proxy") !== expected) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}
