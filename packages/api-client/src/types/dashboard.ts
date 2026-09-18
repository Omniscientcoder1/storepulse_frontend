/**
 * Mirrors the backend's dashboard schemas (`storepulse_backend/app/schemas/dashboard.py`).
 * `revenue_this_month` is a string on the wire — FastAPI/Pydantic serializes
 * `Decimal` as a string, never a JS `number`, so precision isn't lost.
 * `unread_count` is intentionally absent — no `messages` table until the
 * inbox lands (backend BE-19); add it here once the backend does.
 */
export interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

export interface DashboardSummary {
  orders_today: number;
  revenue_this_month: string;
  low_stock_products: LowStockProduct[];
}
