import "server-only";

import { NextResponse } from "next/server";

import { ApiError, type StorePulseApiClient } from "@storepulse/api-client";

import { apiClientFor } from "./api";
import { getSessionToken } from "./auth";

/**
 * Shared body for admin API route handlers that proxy one authenticated
 * backend call: resolves the session token (401 if missing — client
 * components can't hold the token themselves, so every mutation from one
 * goes through a route like this), runs `fn`, and turns any `ApiError` into
 * a same-shaped JSON response instead of an unhandled 500. The backend's own
 * status code and `detail` message are passed through verbatim so a 409
 * transition-rejection (or similar) reaches the UI clearly, not as a generic
 * error.
 */
export async function withAdminApi<T>(
  fn: (client: StorePulseApiClient) => Promise<T>,
): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await fn(apiClientFor(token));
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { detail: "Could not reach the server, please try again" },
      { status: 502 },
    );
  }
}
