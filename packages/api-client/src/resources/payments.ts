import type { ApiClient } from "../client";
import type { ManualPaymentRequest, PaymentRead } from "../types/payment";

/** Mirrors `storepulse_backend/app/routers/payments.py`'s admin-facing routes used by the dashboard. */
export function recordManualPayment(
  client: ApiClient,
  body: ManualPaymentRequest,
): Promise<PaymentRead> {
  return client.request<PaymentRead>("/payments/manual", { method: "POST", json: body });
}

export function listOrderPayments(
  client: ApiClient,
  orderId: string,
): Promise<PaymentRead[]> {
  return client.request<PaymentRead[]>(`/admin/orders/${orderId}/payments`);
}
