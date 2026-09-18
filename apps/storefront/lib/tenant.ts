import "server-only";

/**
 * FE-10 interim tenant resolution: a single tenant ID read from a server-only
 * env var, never from client input (query param, cookie, header the browser
 * could set). FE-12 replaces this with `middleware.ts` resolving the tenant
 * from the verified `Host` header via `/internal/tenant-lookup` — at that
 * point this function's body changes, but nothing that calls it should need
 * to, since the shape (a server-resolved tenant id, unavailable to the
 * client) stays the same.
 */
export function getDemoTenantId(): string | null {
  return process.env.STOREFRONT_DEMO_TENANT_ID?.trim() || null;
}
