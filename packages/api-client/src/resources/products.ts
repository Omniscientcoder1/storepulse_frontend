import type { ApiClient } from "../client";
import type { Page } from "../types/pagination";
import type { ProductCreate, ProductRead, ProductUpdate } from "../types/product";

/** Mirrors `storepulse_backend/app/routers/products.py`'s admin routes. */
export function listAdminProducts(
  client: ApiClient,
  params: { is_active?: boolean; limit?: number; offset?: number } = {},
): Promise<Page<ProductRead>> {
  return client.request<Page<ProductRead>>("/admin/products", { query: params });
}

export function getAdminProduct(client: ApiClient, productId: string): Promise<ProductRead> {
  return client.request<ProductRead>(`/admin/products/${productId}`);
}

export function createProduct(client: ApiClient, body: ProductCreate): Promise<ProductRead> {
  return client.request<ProductRead>("/admin/products", { method: "POST", json: body });
}

export function updateProduct(
  client: ApiClient,
  productId: string,
  body: ProductUpdate,
): Promise<ProductRead> {
  return client.request<ProductRead>(`/admin/products/${productId}`, {
    method: "PATCH",
    json: body,
  });
}

export function deleteProduct(client: ApiClient, productId: string): Promise<void> {
  return client.request<void>(`/admin/products/${productId}`, { method: "DELETE" });
}
