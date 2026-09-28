/**
 * Mirrors the backend's auth schemas (`storepulse_backend/app/schemas/auth.py`).
 * Hand-written for now — see CLAUDE.md "Cross-repo contract" on codegen from
 * `/openapi.json` eventually replacing these.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface AdminUserRead {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  created_at: string;
}

export interface MeResponse {
  admin_user: AdminUserRead;
  tenant_id: string;
  tenant_is_active: boolean;
}
