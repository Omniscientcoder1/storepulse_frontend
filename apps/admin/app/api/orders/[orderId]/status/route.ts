import { z } from "zod";

import { withAdminApi } from "@/lib/api-route";

const bodySchema = z.object({
  status: z.enum(["draft", "pending_payment", "confirmed", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ detail: "Invalid status value" }, { status: 422 });
  }

  return withAdminApi((client) => client.orders.update(orderId, { status: parsed.data.status }));
}
