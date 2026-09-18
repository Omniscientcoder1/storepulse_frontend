import { z } from "zod";

import { withAdminApi } from "@/lib/api-route";

// Mirrors the backend's ManualPaymentRequest (storepulse_backend/app/schemas/payment.py).
const bodySchema = z.object({
  order_id: z.string().uuid(),
  provider: z.enum(["cod", "bkash", "bank", "other"]),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 100 or 100.00"),
  reference: z.string().max(255).optional(),
  status: z.enum(["pending", "success"]).default("pending"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { detail: parsed.error.issues[0]?.message ?? "Invalid payment details" },
      { status: 422 },
    );
  }

  return withAdminApi((client) => client.payments.recordManual(parsed.data));
}
