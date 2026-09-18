import type { ApiClient } from "../client";
import type { HealthResponse } from "../types/health";

/**
 * One function per backend resource, taking the shared `ApiClient` — the
 * pattern every new resource follows as backend endpoints come online
 * (FE-03). Add `resources/<resource>.ts` + `types/<resource>.ts` next to
 * this file rather than growing a god-object client class.
 */
export function getHealth(client: ApiClient): Promise<HealthResponse> {
  return client.request<HealthResponse>("/health");
}
