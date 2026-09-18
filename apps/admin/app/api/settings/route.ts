import { z } from "zod";

import { withAdminApi } from "@/lib/api-route";

// Mirrors the backend's TenantSettingsUpdate (storepulse_backend/app/schemas/tenant.py).
// No `subdomain` field — it's immutable, same as the backend's own contract.
const bodySchema = z.object({
  business_name: z.string().min(1).max(255).optional(),
  category: z.enum(["fashion", "beauty", "electronics", "home_kitchen", "food", "other"]).optional(),
  logo_url: z.string().max(500).nullable().optional(),
  theme_config: z.record(z.string(), z.unknown()).optional(),
  whatsapp_number: z.string().max(20).nullable().optional(),
  custom_domain: z.string().max(255).nullable().optional(),
});

export async function PATCH(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { detail: parsed.error.issues[0]?.message ?? "Invalid settings" },
      { status: 422 },
    );
  }

  return withAdminApi((client) => client.settings.update(parsed.data));
}
