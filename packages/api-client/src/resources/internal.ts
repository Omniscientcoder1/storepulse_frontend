import type { ApiClient } from "../client";
import type { TenantLookupResponse } from "../types/internal";

/**
 * Mirrors `storepulse_backend/app/routers/internal.py`'s `GET /internal/tenant-lookup`.
 *
 * Server-to-server only — called from the storefront's `middleware.ts`, never
 * from browser code. The caller must supply the `X-Internal-Secret` header via
 * `headers` (a server-only secret, never bundled to the client); this
 * function does not read it from anywhere itself.
 */
export function lookupTenantByHost(
  client: ApiClient,
  host: string,
  internalSecret: string | undefined,
): Promise<TenantLookupResponse> {
  return client.request<TenantLookupResponse>("/internal/tenant-lookup", {
    query: { host },
    headers: internalSecret ? { "X-Internal-Secret": internalSecret } : {},
  });
}
