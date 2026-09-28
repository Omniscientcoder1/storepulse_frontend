import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@storepulse/api-client";

import { publicApiClient } from "@/lib/api";

// Mirrors the backend's SubscribeRequest (storepulse_backend/app/schemas/subscription.py),
// including its `extra: "forbid"` behavior via .strict().
const signupSchema = z
  .object({
    business_name: z.string().min(1).max(255),
    category: z.enum(["fashion", "beauty", "electronics", "home_kitchen", "food", "other"]),
    subdomain: z
      .string()
      .min(1)
      .max(63)
      .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/),
    plan_tier: z.enum(["starter", "growth", "pro"]),
  })
  .strict();

/**
 * BFF signup endpoint (FE-15): the browser never calls the FastAPI backend
 * directly for signup. Public/unauthenticated, same reasoning as
 * `apps/admin/app/api/auth/login/route.ts` — this keeps `packages/api-client`
 * as the only HTTP call site (FE-03 non-negotiable) even though the backend
 * endpoint itself has no auth to route around.
 */
export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Invalid signup details" }, { status: 422 });
  }

  const client = publicApiClient();

  try {
    const result = await client.billing.subscribe(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 409 || error.status === 422)) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Signup failed, please try again" }, { status: 502 });
  }
}
