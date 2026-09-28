import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ApiError, StorePulseApiClient } from "@storepulse/api-client";

import { REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Kept identical to login/route.ts's constants — see that file's comments.
const SESSION_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * BFF refresh endpoint (BE-36): reads the refresh cookie, exchanges it with
 * the backend server-to-server, and on success rewrites both cookies with
 * the rotated values. On failure (expired/revoked/reused token) clears both
 * cookies — a dead refresh cookie left in place would otherwise cause every
 * subsequent refresh attempt to silently fail without ever prompting login.
 */
export async function POST() {
  if (!API_URL) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  const client = new StorePulseApiClient({ baseUrl: API_URL });

  try {
    const { access_token: accessToken, refresh_token: newRefreshToken } =
      await client.auth.refresh({ refresh_token: refreshToken });
    cookieStore.set(SESSION_COOKIE_NAME, accessToken, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));
    cookieStore.set(
      REFRESH_COOKIE_NAME,
      newRefreshToken,
      sessionCookieOptions(REFRESH_MAX_AGE_SECONDS),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.json({ detail: "Refresh token invalid or expired" }, { status: 401 });
    }
    return NextResponse.json({ detail: "Refresh failed" }, { status: 502 });
  }
}
