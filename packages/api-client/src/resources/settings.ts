import type { ApiClient } from "../client";
import type { TenantSettingsRead, TenantSettingsUpdate } from "../types/settings";

/** Mirrors `storepulse_backend/app/routers/settings.py`. */
export function getSettings(client: ApiClient): Promise<TenantSettingsRead> {
  return client.request<TenantSettingsRead>("/admin/settings");
}

export function updateSettings(
  client: ApiClient,
  body: TenantSettingsUpdate,
): Promise<TenantSettingsRead> {
  return client.request<TenantSettingsRead>("/admin/settings", {
    method: "PATCH",
    json: body,
  });
}
