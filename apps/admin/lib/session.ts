import "server-only";

/**
 * The admin session lives *only* in this httpOnly cookie — never in
 * localStorage or a client-readable cookie (FE-04 non-negotiable). The value
 * is the raw backend JWT; nothing here decodes it or extracts claims like
 * `tenant_id` for client use — that only ever happens server-side via
 * `getSession` (see `lib/auth.ts`).
 */
export const SESSION_COOKIE_NAME = "sp_admin_session";

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
