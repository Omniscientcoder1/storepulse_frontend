import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiClientFor } from "@/lib/api";
import { REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Clears both cookies regardless of whether the backend call succeeds. The
 * backend's `/auth/logout` now revokes the refresh token (BE-36), so a
 * replayed refresh token fails after this — but it cannot invalidate the
 * still-outstanding access token before its own (<=1h) expiry; that's a
 * documented, accepted limitation pending a Redis-backed blacklist (BE-28).
 * Clearing the cookies here is what actually ends the session client-side.
 */
export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    await apiClientFor(accessToken)
      .auth.logout({ refresh_token: refreshToken })
      .catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
