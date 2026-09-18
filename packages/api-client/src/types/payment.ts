/** Mirrors `storepulse_backend/app/schemas/payment.py`. */
export type PaymentStatus = "pending" | "success" | "failed" | "cancelled" | "refunded";
export type ManualPaymentProvider = "cod" | "bkash" | "bank" | "other";

export interface ManualPaymentRequest {
  order_id: string;
  provider: ManualPaymentProvider;
  amount: string;
  reference?: string | null;
  status?: "pending" | "success";
}

export interface PaymentRead {
  id: string;
  tenant_id: string;
  order_id: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  provider_payment_ref: string | null;
  provider_transaction_id: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}
