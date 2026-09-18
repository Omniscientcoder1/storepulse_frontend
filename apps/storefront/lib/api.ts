import { StorePulseApiClient } from "@storepulse/api-client";

/**
 * The storefront never authenticates as an admin — every call it makes is a
 * public, unauthenticated read, so unlike apps/admin's client this one has no
 * `getAuthToken`.
 */
export const apiClient = new StorePulseApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});
