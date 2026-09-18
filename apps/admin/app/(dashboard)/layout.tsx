import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";

/**
 * Wraps every dashboard route. Redirects to /login when the session cookie
 * is missing or the backend rejects the token (expired, tampered, user
 * deleted) — the middleware only checks cookie presence, this is the actual
 * verification. Nothing here reads or forwards a raw tenant ID; `session`
 * carries only what `/auth/me` returned.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">StorePulse Admin</span>
          <NavLinks />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session.admin_user.email}</span>
          <LogoutButton />
        </div>
      </header>
      {!session.tenant_is_active ? (
        <div className="bg-destructive/10 text-destructive px-6 py-2 text-sm">
          This account&apos;s tenant is suspended. Contact support.
        </div>
      ) : null}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
