import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, type StorefrontOrderCreate } from "@storepulse/api-client";

import { apiClient } from "@/lib/api";
import { getDemoTenantId } from "@/lib/tenant";

/**
 * Mirrors `StorefrontOrderCreate` in the backend's `app/schemas/order.py` —
 * kept in sync manually until `packages/api-client` is generated from the
 * OpenAPI schema (FE-03's stated follow-up).
 */
const checkoutSchema = z.object({
  customer_phone: z.string().min(1, "Phone number is required").max(20),
  customer_name: z.string().max(255).optional(),
  customer_address: z.string().optional(),
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  selected_options: z.record(z.string(), z.unknown()).optional(),
  delivery_address: z.string().min(1, "Delivery address is required"),
  delivery_method: z.enum(["courier", "pickup"]),
  special_instructions: z.string().optional(),
});

/**
 * Public checkout submission. Unlike `apps/admin`'s BFF routes, this one
 * carries no session — the backend endpoint it calls
 * (`POST /tenants/{tenant_id}/orders`) is itself public and rate-limited
 * per (tenant, IP). This route still exists (rather than the browser calling
 * the backend directly) so the tenant id — resolved server-side, same as
 * every other read on this storefront — never has to be exposed to or
 * trusted from client code, matching FE-10/FE-12's tenant-resolution rule.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const tenantId = getDemoTenantId();
  if (!tenantId) {
    return NextResponse.json(
      { detail: "This storefront is not configured for checkout yet" },
      { status: 409 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { detail: parsed.error.issues[0]?.message ?? "Invalid checkout details" },
      { status: 422 },
    );
  }

  const payload: StorefrontOrderCreate = {
    customer_phone: parsed.data.customer_phone,
    customer_name: parsed.data.customer_name || undefined,
    customer_address: parsed.data.customer_address || undefined,
    product_id: parsed.data.product_id,
    quantity: parsed.data.quantity,
    selected_options: parsed.data.selected_options ?? {},
    delivery_address: parsed.data.delivery_address,
    delivery_method: parsed.data.delivery_method,
    special_instructions: parsed.data.special_instructions || undefined,
  };

  try {
    const order = await apiClient.storefront.createOrder(tenantId, payload);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { detail: "Could not reach the server, please try again" },
      { status: 502 },
    );
  }
}
