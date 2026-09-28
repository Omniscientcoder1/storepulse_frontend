import "server-only";

import { StorePulseApiClient } from "@storepulse/api-client";

function requireApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url;
}

/**
 * Server-side api-client for the mother site's public, unauthenticated calls
 * (signup). Unlike `apps/admin/lib/api.ts`'s `apiClientFor(token)`, there is
 * no session here — the mother site never authenticates a user, it only
 * provisions a tenant. Mirrors that file's shape so both apps' BFF layers
 * stay recognizable to each other.
 */
export function publicApiClient(): StorePulseApiClient {
  return new StorePulseApiClient({ baseUrl: requireApiUrl() });
}
