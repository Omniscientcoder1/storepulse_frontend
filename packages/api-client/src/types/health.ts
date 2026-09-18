/**
 * Mirrors the backend's `HealthResponse` Pydantic schema
 * (`storepulse_backend/app/main.py`). Hand-written for now because the
 * backend is still small — once codegen from `/openapi.json` is wired up
 * (FE-03 follow-up), this file is generated output and should not be
 * hand-edited; see CLAUDE.md "Cross-repo contract".
 */
export interface HealthResponse {
  status: string;
}
