import type { ApiClient } from "../client";
import type { CustomerDetail, CustomerRead } from "../types/customer";
import type { Page } from "../types/pagination";

/** Mirrors `storepulse_backend/app/routers/customers.py`. */
export function listCustomers(
  client: ApiClient,
  params: { q?: string; limit?: number; offset?: number } = {},
): Promise<Page<CustomerRead>> {
  return client.request<Page<CustomerRead>>("/admin/customers", { query: params });
}

export function getCustomer(client: ApiClient, customerId: string): Promise<CustomerDetail> {
  return client.request<CustomerDetail>(`/admin/customers/${customerId}`);
}
