import { NextResponse, type NextRequest } from "next/server";

import { ApiError, StorePulseApiClient } from "@storepulse/api-client";

import { getCachedTenantLookup, setCachedTenantLookup } from "@/lib/tenant-cache";

/**
 * Resolves the tenant for every storefront request from the server-verified
 * `Host` header — the frontend half of the system's single non-negotiable
 * (CLAUDE.md / TECHNICAL_KNOWLEDGE_BASE.md §4): tenant identity is never
 * accepted from client input.
 *
 * `x-storepulse-tenant-id` is set here and *only* here. Any client-supplied
 * value of that header is always overwritten below (never merged), so a
 * request cannot smuggle a forged tenant id past this middleware — the
 * `NextRequest` header set middleware reads is the raw incoming request, but
 * the *outgoing* request handed to the app only ever carries the value this
 * function assigns.
 */
const TENANT_HEADER = "x-storepulse-tenant-id";
const CATEGORY_HEADER = "x-storepulse-tenant-category";
const THEME_HEADER = "x-storepulse-tenant-theme";

const apiClient = new StorePulseApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

async function resolveTenant(
  host: string,
): Promise<{ ok: true; tenantId: string; category: string; themeConfig: string } | { ok: false; status: number }> {
  const cached = getCachedTenantLookup(host);
  if (cached) {
    return cached.ok
      ? {
          ok: true,
          tenantId: cached.tenant.id,
          category: cached.tenant.category,
          themeConfig: JSON.stringify(cached.tenant.theme_config),
        }
      : cached;
  }

  try {
    const tenant = await apiClient.internal.tenantLookup(
      host,
      process.env.INTERNAL_API_SECRET,
    );
    setCachedTenantLookup(host, { ok: true, tenant });
    return {
      ok: true,
      tenantId: tenant.id,
      category: tenant.category,
      themeConfig: JSON.stringify(tenant.theme_config),
    };
  } catch (error) {
    const status = error instanceof ApiError && error.status > 0 ? error.status : 502;
    setCachedTenantLookup(host, { ok: false, status });
    return { ok: false, status };
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.rewrite(new URL("/store-unavailable", request.url));
  }

  const resolved = await resolveTenant(host);

  if (!resolved.ok) {
    if (resolved.status === 403) {
      return NextResponse.rewrite(new URL("/store-suspended", request.url));
    }
    // 404 (unknown host) and any backend failure both render the same
    // generic "unavailable" page — neither should look different from a
    // suspended store to a visitor, and a transient backend error must not
    // leak as a broken render or, worse, fall through to someone else's data.
    return NextResponse.rewrite(new URL("/store-unavailable", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER, resolved.tenantId);
  requestHeaders.set(CATEGORY_HEADER, resolved.category);
  requestHeaders.set(THEME_HEADER, resolved.themeConfig);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Every page request needs tenant resolution. Excluded: Next internals,
     * the storefront's own BFF routes (already public/tenant-scoped by their
     * own logic), and the two fallback pages this middleware itself rewrites
     * to (rewriting to them would otherwise re-enter this middleware).
     */
    "/((?!_next/static|_next/image|api|favicon.ico|store-unavailable|store-suspended).*)",
  ],
};
