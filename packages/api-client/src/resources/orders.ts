import type { ApiClient } from "../client";
import type { OrderCreate, OrderRead, OrderStatus, OrderUpdate } from "../types/order";
import type { Page } from "../types/pagination";

/** Mirrors `storepulse_backend/app/routers/orders.py`'s admin routes. */
export function listOrders(
  client: ApiClient,
  params: { status?: OrderStatus; limit?: number; offset?: number } = {},
): Promise<Page<OrderRead>> {
  return client.request<Page<OrderRead>>("/admin/orders", { query: params });
}

export function getOrder(client: ApiClient, orderId: string): Promise<OrderRead> {
  return client.request<OrderRead>(`/admin/orders/${orderId}`);
}

export function createOrder(client: ApiClient, body: OrderCreate): Promise<OrderRead> {
  return client.request<OrderRead>("/admin/orders", { method: "POST", json: body });
}

export function updateOrder(
  client: ApiClient,
  orderId: string,
  body: OrderUpdate,
): Promise<OrderRead> {
  return client.request<OrderRead>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    json: body,
  });
}
