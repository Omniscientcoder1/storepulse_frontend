import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiClientFor } from "@/lib/api";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Clears the session cookie regardless of whether the backend call succeeds
 * — the backend's `/auth/logout` is stateless (no token blacklist yet, see
 * its docstring), so the cookie is the only thing that actually ends the
 * session client-side.
 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await apiClientFor(token)
      .auth.logout()
      .catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
