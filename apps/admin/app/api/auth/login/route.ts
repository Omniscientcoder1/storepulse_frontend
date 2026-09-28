import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, StorePulseApiClient } from "@storepulse/api-client";

import { REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mirrors the backend's LoginRequest (storepulse_backend/app/schemas/auth.py).
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(1024),
});

// Matches the backend's own JWT lifetime so the cookie never outlives the
// token it holds (a stale-but-present cookie would otherwise look "logged
// in" client-side while every request 401s).
const SESSION_MAX_AGE_SECONDS = 60 * 60;

// Matches the backend's REFRESH_TOKEN_EXPIRE_DAYS default (BE-36). Kept in
// lockstep the same way SESSION_MAX_AGE_SECONDS is kept in lockstep with the
// access token's lifetime — if the backend's expiry changes, update this too.
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * BFF login endpoint: the browser never talks to the FastAPI backend
 * directly for auth. This route calls it server-to-server and stores the
 * returned JWT in an httpOnly cookie — the backend itself only returns the
 * token in a JSON body, it has no cookie support (FE-04 non-negotiable).
 */
export async function POST(request: Request) {
  if (!API_URL) {
    return NextResponse.json({ detail: "Server misconfigured" }, { status: 500 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Invalid email or password" }, { status: 422 });
  }

  const client = new StorePulseApiClient({ baseUrl: API_URL });

  try {
    const { access_token: accessToken, refresh_token: refreshToken } =
      await client.auth.login(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, accessToken, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));
    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, sessionCookieOptions(REFRESH_MAX_AGE_SECONDS));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ detail: "Login failed, please try again" }, { status: 502 });
  }
}
