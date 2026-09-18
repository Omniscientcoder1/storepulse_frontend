/** Mirrors `storepulse_backend/app/schemas/customer.py`. */
export interface CustomerOrderSummary {
  id: string;
  product_id: string;
  quantity: number;
  status: string;
  total_price: string;
  created_at: string;
}

export interface CustomerRead {
  id: string;
  tenant_id: string;
  name: string | null;
  phone: string;
  whatsapp_id: string | null;
  address: string | null;
  created_at: string;
}

export interface CustomerDetail extends CustomerRead {
  orders: CustomerOrderSummary[];
}
