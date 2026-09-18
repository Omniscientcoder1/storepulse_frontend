/**
 * Mirrors `storepulse_backend/app/schemas/tenant.py`'s `TenantSettingsRead`/
 * `TenantSettingsUpdate`. `theme_config` is free-form JSONB on the backend
 * with no pinned key contract yet — `primary_color` is the convention this
 * frontend introduces (FE-09) for "theme color"; the storefront (FE-10+)
 * must read the same key back.
 */
export type TenantCategory =
  | "fashion"
  | "beauty"
  | "electronics"
  | "home_kitchen"
  | "food"
  | "other";

export interface ThemeConfig {
  primary_color?: string;
  [key: string]: unknown;
}

export interface TenantSettingsRead {
  business_name: string;
  category: TenantCategory;
  subdomain: string;
  logo_url: string | null;
  theme_config: ThemeConfig;
  whatsapp_number: string | null;
  custom_domain: string | null;
}

export interface TenantSettingsUpdate {
  business_name?: string;
  category?: TenantCategory;
  logo_url?: string | null;
  theme_config?: ThemeConfig;
  whatsapp_number?: string | null;
  custom_domain?: string | null;
}
