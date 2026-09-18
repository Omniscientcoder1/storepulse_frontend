import type { ApiClient } from "../client";
import type { DashboardSummary } from "../types/dashboard";

/** Mirrors `storepulse_backend/app/routers/dashboard.py`. Admin-only, tenant-scoped via the caller's JWT. */
export function getDashboardSummary(client: ApiClient): Promise<DashboardSummary> {
  return client.request<DashboardSummary>("/admin/dashboard/summary");
}
