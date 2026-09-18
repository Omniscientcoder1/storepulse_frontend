import { z } from "zod";

import { withAdminApi } from "@/lib/api-route";

// Mirrors the backend's OptionDefinition/ProductCreate (storepulse_backend/app/schemas/product.py).
const optionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["select", "text", "number"]).default("select"),
  choices: z.array(z.string()).default([]),
  required: z.boolean().default(false),
});

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  base_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a price like 100 or 100.00"),
  stock_quantity: z.number().int().min(0).nullable().optional(),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  options_schema: z.array(optionSchema).default([]),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { detail: parsed.error.issues[0]?.message ?? "Invalid product details" },
      { status: 422 },
    );
  }

  return withAdminApi((client) => client.products.create(parsed.data));
}
