import type { ApiClient } from "../client";
import type { LoginRequest, MeResponse, TokenResponse } from "../types/auth";

/**
 * Auth resource — mirrors `storepulse_backend/app/routers/auth.py`. Login
 * returns only the bearer token; callers on the admin app are responsible for
 * deciding where that token lives (see `apps/admin/lib/session.ts` — the
 * backend itself has no cookie support, it only issues JWTs).
 */
export function login(client: ApiClient, body: LoginRequest): Promise<TokenResponse> {
  return client.request<TokenResponse>("/auth/login", { method: "POST", json: body });
}

export function logout(client: ApiClient): Promise<void> {
  return client.request<void>("/auth/logout", { method: "POST" });
}

export function me(client: ApiClient): Promise<MeResponse> {
  return client.request<MeResponse>("/auth/me");
}
