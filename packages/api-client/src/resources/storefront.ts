import type { ApiClient } from "../client";
import type { Page } from "../types/pagination";
import type { ProductPublic } from "../types/product";
import type { TenantStorefrontInfo } from "../types/storefront";

/** Mirrors `storepulse_backend/app/routers/products.py` and `tenants.py`'s public reads. */
export function listPublicProducts(
  client: ApiClient,
  tenantId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<Page<ProductPublic>> {
  return client.request<Page<ProductPublic>>(`/tenants/${tenantId}/products`, {
    query: params,
  });
}

export function getStorefrontInfo(
  client: ApiClient,
  tenantId: string,
): Promise<TenantStorefrontInfo> {
  return client.request<TenantStorefrontInfo>(`/tenants/${tenantId}/storefront-info`);
}
