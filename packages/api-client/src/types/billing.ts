import type { TenantCategory } from "./settings";

/**
 * Mirrors `storepulse_backend/app/schemas/subscription.py`. `TenantCategory`
 * is reused from `./settings` rather than redefined here — same enum, one
 * source of truth.
 */
export type PlanTier = "starter" | "growth" | "pro";

export interface SubscribeRequest {
  business_name: string;
  category: TenantCategory;
  /** Single DNS label: lower-case letters/digits/hyphens, 1-63 chars, no leading/trailing hyphen. */
  subdomain: string;
  plan_tier: PlanTier;
}

export interface SubscriptionRead {
  id: string;
  tenant_id: string;
  plan_tier: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

export interface SubscribeResponse {
  tenant_id: string;
  subdomain: string;
  subscription: SubscriptionRead;
}

/**
 * Response of the read-only `GET /billing/check-subdomain` pre-submit check
 * (FE-15) — `reason` is `null` when `available` is `true`.
 */
export interface SubdomainCheckResponse {
  subdomain: string;
  available: boolean;
  reason: "invalid" | "reserved" | "taken" | null;
}
