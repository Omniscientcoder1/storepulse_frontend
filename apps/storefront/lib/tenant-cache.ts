import "server-only";

import type { TenantLookupResponse } from "@storepulse/api-client";

/**
 * In-memory cache for `/internal/tenant-lookup` results, keyed by normalized
 * `Host`. Middleware runs on (effectively) every request, so this avoids a
 * backend round-trip per page load — but the TTL is short on purpose: a
 * tenant flipping `is_active` false (suspended) must stop resolving within
 * seconds, not hours, so this is a freshness bound, not a long-lived cache.
 *
 * Module-level state in an edge/serverless runtime is per-instance, not
 * shared across replicas — acceptable here since a stale positive only ever
 * lasts one TTL window, and BE-28 (Redis) is the follow-up for anything that
 * needs true cross-instance consistency.
 */
const TTL_MS = 30_000;

interface CacheEntry {
  expiresAt: number;
  result: { ok: true; tenant: TenantLookupResponse } | { ok: false; status: number };
}

const cache = new Map<string, CacheEntry>();

export function getCachedTenantLookup(host: string): CacheEntry["result"] | undefined {
  const entry = cache.get(host);
  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(host);
    return undefined;
  }
  return entry.result;
}

export function setCachedTenantLookup(host: string, result: CacheEntry["result"]): void {
  cache.set(host, { result, expiresAt: Date.now() + TTL_MS });
}
