import "server-only";

import { headers } from "next/headers";

/**
 * FE-12: the tenant id resolved by `middleware.ts` from the verified `Host`
 * header, forwarded as a request header only `middleware.ts` can set (any
 * client-supplied value of the same header is always overwritten there, so
 * this can never carry a forged id). Returns `null` only when middleware
 * didn't run for this request at all (e.g. a route excluded by its
 * `matcher`) — an unresolvable/suspended tenant never reaches the page in
 * the first place, since middleware rewrites those to `/store-unavailable`
 * or `/store-suspended` before rendering starts.
 */
export async function getResolvedTenantId(): Promise<string | null> {
  const store = await headers();
  return store.get("x-storepulse-tenant-id");
}

/**
 * FE-10's original single-hardcoded-tenant mechanism, kept only as a local
 * development convenience for running this app *without* also running
 * `middleware.ts` against a live backend (e.g. component work in isolation).
 * `loadStorefrontData` prefers `getResolvedTenantId()`; this is the fallback
 * when that returns `null`.
 */
export function getDemoTenantId(): string | null {
  return process.env.STOREFRONT_DEMO_TENANT_ID?.trim() || null;
}
