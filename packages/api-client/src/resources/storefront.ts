import type { ApiClient } from "../client";
import type { OrderRead, StorefrontOrderCreate } from "../types/order";
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

/**
 * Public checkout — mirrors `POST /tenants/{tenant_id}/orders` in
 * `app/routers/orders.py`. Unauthenticated by design (anonymous storefront
 * visitors); the backend rate-limits it per `(tenant_id, client_ip)`.
 */
export function createStorefrontOrder(
  client: ApiClient,
  tenantId: string,
  body: StorefrontOrderCreate,
): Promise<OrderRead> {
  return client.request<OrderRead>(`/tenants/${tenantId}/orders`, {
    method: "POST",
    json: body,
  });
}
