import "server-only";

import { cookies } from "next/headers";

import { ApiError, type MeResponse } from "@storepulse/api-client";

import { apiClientFor } from "./api";
import { SESSION_COOKIE_NAME } from "./session";

export interface Session {
  me: MeResponse;
  /**
   * Seconds until the access token's `exp` claim, read from the JWT payload
   * without verifying its signature — this is a freshness hint only, used to
   * decide when to proactively call `/api/auth/refresh` (BE-36). The backend
   * verifies signature + expiry on every real request regardless; nothing
   * security-relevant depends on this number being trustworthy.
   */
  accessTokenExpiresInSeconds: number | null;
}

/**
 * Resolves the current admin session by validating the session cookie's JWT
 * against the backend's `/auth/me`. Returns `null` for "no cookie" or
 * "backend rejected the token" alike, so callers (middleware, the dashboard
 * layout) have one check for both.
 *
 * Deliberately does not expose the raw JWT or a bare tenant ID to callers;
 * only the verified `MeResponse` and a derived expiry hint.
 */
export async function getSession(): Promise<Session | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const me = await apiClientFor(token).auth.me();
    return { me, accessTokenExpiresInSeconds: getTokenExpiresInSeconds(token) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/**
 * Reads the `exp` claim out of a JWT's payload without verifying its
 * signature. Malformed input yields `null` rather than throwing — this is
 * only ever used for the proactive-refresh freshness hint above, never for
 * an authorization decision.
 */
function getTokenExpiresInSeconds(token: string): number | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const json = Buffer.from(payloadSegment, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    return Math.floor(payload.exp - Date.now() / 1000);
  } catch {
    return null;
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
