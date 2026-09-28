import { NextResponse } from "next/server";

import { ApiError } from "@storepulse/api-client";

import { publicApiClient } from "@/lib/api";

/**
 * BFF proxy for the read-only `GET /billing/check-subdomain` pre-submit
 * check (FE-15) — the signup wizard's subdomain step debounces on this, never
 * calling the backend directly, same reasoning as `../route.ts`.
 */
export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("value");
  if (!value) {
    return NextResponse.json({ detail: "Missing 'value' query param" }, { status: 422 });
  }

  const client = publicApiClient();

  try {
    const result = await client.billing.checkSubdomain(value);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Could not check availability" }, { status: 502 });
  }
}
