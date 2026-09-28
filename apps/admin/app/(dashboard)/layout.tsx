import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";
import { SessionRefresher } from "./session-refresher";

/**
 * Wraps every dashboard route. Redirects to /login when the session cookie
 * is missing or the backend rejects the token (expired, tampered, user
 * deleted) — the middleware only checks cookie presence, this is the actual
 * verification. Nothing here reads or forwards a raw tenant ID; `session.me`
 * carries only what `/auth/me` returned.
 *
 * `SessionRefresher` handles BE-36's proactive-refresh requirement: it's a
 * client component that calls `/api/auth/refresh` shortly before the access
 * token expires, so navigating between pages within the refresh token's
 * lifetime doesn't drop the admin to /login. It does not cover a long-idle
 * tab that makes no navigations at all — that gap is accepted for now (see
 * BACKEND_TASKS.md's BE-36 entry).
 */
export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <SessionRefresher expiresInSeconds={session.accessTokenExpiresInSeconds} />
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">StorePulse Admin</span>
          <NavLinks />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session.me.admin_user.email}</span>
          <LogoutButton />
        </div>
      </header>
      {!session.me.tenant_is_active ? (
        <div className="bg-destructive/10 text-destructive px-6 py-2 text-sm">
          This account&apos;s tenant is suspended. Contact support.
        </div>
      ) : null}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
