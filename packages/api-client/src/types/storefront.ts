import type { TenantCategory, ThemeConfig } from "./settings";

/** Mirrors `storepulse_backend/app/schemas/tenant.py`'s `TenantStorefrontInfo`. */
export interface TenantStorefrontInfo {
  business_name: string;
  category: TenantCategory;
  theme_config: ThemeConfig;
  logo_url: string | null;
}
