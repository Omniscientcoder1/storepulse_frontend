import type { ApiClient } from "../client";
import type { SubdomainCheckResponse, SubscribeRequest, SubscribeResponse } from "../types/billing";

/**
 * Mother-site signup (FE-15). Both endpoints are public — mirrors
 * `storepulse_backend/app/routers/billing.py`.
 */
export function subscribe(client: ApiClient, body: SubscribeRequest): Promise<SubscribeResponse> {
  return client.request<SubscribeResponse>("/billing/subscribe", {
    method: "POST",
    json: body,
  });
}

/** Read-only pre-submit availability check the signup wizard debounces on. */
export function checkSubdomain(client: ApiClient, value: string): Promise<SubdomainCheckResponse> {
  return client.request<SubdomainCheckResponse>("/billing/check-subdomain", {
    query: { value },
  });
}
