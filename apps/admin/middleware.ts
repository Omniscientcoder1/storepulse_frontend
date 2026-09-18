import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Route gate: redirects to /login when the session cookie is absent.
 *
 * This is a cheap presence check only — middleware runs on the edge and
 * shouldn't make a backend round-trip on every request. Actual JWT
 * validation happens once per navigation in the `(dashboard)` layout via
 * `/auth/me`; that's what catches an expired/forged/tampered token and
 * redirects too. A request with no cookie at all never needs to reach that
 * check, hence the short-circuit here.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/settings/:path*",
  ],
};
