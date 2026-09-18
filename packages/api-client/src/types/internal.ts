/** Mirrors `storepulse_backend/app/schemas/tenant.py`'s `TenantLookupResponse`. */
export interface TenantLookupResponse {
  id: string;
  category: string;
  theme_config: Record<string, unknown>;
  plan_tier: string;
  is_active: boolean;
}
