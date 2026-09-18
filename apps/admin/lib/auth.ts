import "server-only";

import { cookies } from "next/headers";

import { ApiError, type MeResponse } from "@storepulse/api-client";

import { apiClientFor } from "./api";
import { SESSION_COOKIE_NAME } from "./session";

/**
 * Resolves the current admin session by validating the session cookie's JWT
 * against the backend's `/auth/me` — the token itself is never decoded here.
 * Returns `null` for "no cookie" or "backend rejected the token" alike, so
 * callers (middleware, the dashboard layout) have one check for both.
 *
 * Deliberately does not expose the raw JWT or a bare tenant ID to callers;
 * only the verified `MeResponse` from the backend.
 */
export async function getSession(): Promise<MeResponse | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await apiClientFor(token).auth.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/**
 * Raw session token for server components/routes that need to call other
 * authenticated backend endpoints beyond `/auth/me` (e.g. the dashboard
 * summary). Callers still go through `apiClientFor`, never the cookie's
 * value directly — this only centralizes *where* the cookie is read.
 */
export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}
