/** Mirrors `storepulse_backend/app/schemas/product.py`. */
export type OptionType = "select" | "text" | "number";

export interface OptionDefinition {
  name: string;
  type: OptionType;
  choices: string[];
  required: boolean;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  base_price: string;
  stock_quantity?: number | null;
  images?: string[];
  is_active?: boolean;
  options_schema?: OptionDefinition[];
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  base_price?: string;
  stock_quantity?: number | null;
  images?: string[];
  is_active?: boolean;
  options_schema?: OptionDefinition[];
}

export interface ProductRead {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  base_price: string;
  stock_quantity: number | null;
  images: string[] | null;
  is_active: boolean;
  options_schema: OptionDefinition[];
  created_at: string;
}

/**
 * Public storefront catalog shape — mirrors `ProductPublic` in
 * `storepulse_backend/app/schemas/product.py`. Deliberately narrower than
 * `ProductRead`: no `tenant_id`, `stock_quantity`, or `is_active` (the public
 * list endpoint only ever returns active products for one already-known tenant).
 */
export interface ProductPublic {
  id: string;
  name: string;
  description: string | null;
  base_price: string;
  images: string[] | null;
  options_schema: OptionDefinition[];
}
