/**
 * Mirrors the backend's order schemas (`storepulse_backend/app/schemas/order.py`).
 * `OrderRead` only carries `customer_id`/`product_id` — no denormalized name,
 * so a detail view resolves those separately via the customer/product
 * resources. Decimal fields (`total_price`, `deposit_amount`) are strings on
 * the wire, same reasoning as the dashboard's `revenue_this_month`.
 */
export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "courier" | "pickup";

/**
 * Mirrors `ALLOWED_TRANSITIONS` in `app/services/orders.py` — the backend is
 * the source of truth; this only lets the UI avoid offering a transition it
 * knows the backend will reject. Keep in sync if the backend graph changes.
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_payment", "confirmed", "cancelled"],
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export interface OrderCreate {
  customer_phone: string;
  customer_name?: string | null;
  customer_address?: string | null;
  product_id: string;
  quantity?: number;
  selected_options?: Record<string, unknown>;
  delivery_address?: string | null;
  delivery_method?: DeliveryMethod;
  total_price?: string | null;
  deposit_amount?: string;
  special_instructions?: string | null;
  status?: "draft" | "pending_payment";
}

export interface OrderUpdate {
  status?: OrderStatus;
  quantity?: number;
  selected_options?: Record<string, unknown>;
  delivery_address?: string | null;
  delivery_method?: DeliveryMethod;
  total_price?: string;
  deposit_amount?: string;
  special_instructions?: string | null;
}

export interface OrderRead {
  id: string;
  tenant_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  selected_options: Record<string, unknown>;
  delivery_address: string | null;
  delivery_method: string;
  total_price: string;
  deposit_amount: string;
  deposit_paid_at: string | null;
  balance_paid_at: string | null;
  status: string;
  special_instructions: string | null;
  created_at: string;
}
