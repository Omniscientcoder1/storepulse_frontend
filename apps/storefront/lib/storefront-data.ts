import "server-only";

import { ApiError, type ProductPublic, type TenantStorefrontInfo } from "@storepulse/api-client";

import { apiClient } from "./api";
import { DEMO_PRODUCT, DEMO_STOREFRONT_INFO } from "./demo-content";
import { getDemoTenantId } from "./tenant";

export interface StorefrontData {
  info: TenantStorefrontInfo;
  product: ProductPublic | null;
  /** True when this is `lib/demo-content.ts`'s static fallback, not a real backend read. */
  isDemo: boolean;
}

/**
 * Loads the hardcoded tenant's storefront-info and first active product from
 * the real backend. Falls back to static demo content when no tenant id is
 * configured or the backend call fails, so the page always renders something
 * — this fallback path is what `data/content.ts` was in the original
 * template, not the primary way this page gets data.
 */
export async function loadStorefrontData(): Promise<StorefrontData> {
  const tenantId = getDemoTenantId();
  if (!tenantId) {
    return { info: DEMO_STOREFRONT_INFO, product: DEMO_PRODUCT, isDemo: true };
  }

  try {
    const [info, products] = await Promise.all([
      apiClient.storefront.getInfo(tenantId),
      apiClient.storefront.listProducts(tenantId, { limit: 1 }),
    ]);
    return { info, product: products.items[0] ?? null, isDemo: false };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Failed to load storefront data for tenant ${tenantId}:`, error.message);
    } else {
      throw error;
    }
    return { info: DEMO_STOREFRONT_INFO, product: DEMO_PRODUCT, isDemo: true };
  }
}
