import "server-only";

import { StorePulseApiClient } from "@storepulse/api-client";

function requireApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url;
}

/** Server-side api-client bound to one request's session token. */
export function apiClientFor(token: string | null | undefined): StorePulseApiClient {
  return new StorePulseApiClient({
    baseUrl: requireApiUrl(),
    getAuthToken: () => token,
  });
}
