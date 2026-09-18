import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, StorePulseApiClient } from "@storepulse/api-client";

import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

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
    const { access_token: accessToken } = await client.auth.login(parsed.data);
    (await cookies()).set(
      SESSION_COOKIE_NAME,
      accessToken,
      sessionCookieOptions(SESSION_MAX_AGE_SECONDS),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ detail: "Login failed, please try again" }, { status: 502 });
  }
}
