import type { ApiClient } from "../client";
import type {
  LoginRequest,
  LogoutRequest,
  MeResponse,
  RefreshRequest,
  TokenResponse,
} from "../types/auth";

/**
 * Auth resource — mirrors `storepulse_backend/app/routers/auth.py`. Login and
 * refresh return both a short-lived access token and a longer-lived, rotated
 * refresh token (BE-36); callers on the admin app are responsible for
 * deciding where those tokens live (see `apps/admin/lib/session.ts` — the
 * backend itself has no cookie support, it only issues tokens).
 */
export function login(client: ApiClient, body: LoginRequest): Promise<TokenResponse> {
  return client.request<TokenResponse>("/auth/login", { method: "POST", json: body });
}

export function refresh(client: ApiClient, body: RefreshRequest): Promise<TokenResponse> {
  return client.request<TokenResponse>("/auth/refresh", { method: "POST", json: body });
}

export function logout(client: ApiClient, body: LogoutRequest): Promise<void> {
  return client.request<void>("/auth/logout", { method: "POST", json: body });
}

export function me(client: ApiClient): Promise<MeResponse> {
  return client.request<MeResponse>("/auth/me");
}
