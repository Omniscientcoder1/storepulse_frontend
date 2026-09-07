# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This repo is **pre-build**. It currently contains only planning documents — no application code, no `package.json`, and it is not yet a git repository. The three source-of-truth documents are:

- `TECHNICAL_KNOWLEDGE_BASE.md` — architecture, data model, API contract, security rules, and the 10-step build order. Read this before writing any code.
- `storepulse-frontend-README.md` — the intended monorepo layout and conventions for *this* frontend repo specifically.
- `BUSINESS_PLAN.md` — market context and pricing; rarely needed for implementation.

When scaffolding, follow the structure and build phases defined in these docs rather than inventing a new layout.

## What this repo is meant to become

A **Turborepo + pnpm monorepo** of Next.js 14+ (App Router) apps for the StorePulse multi-tenant e-commerce SaaS. Three apps, each its own Vercel Project pointing at this repo with a distinct Root Directory:

| App | Path | Domain | Purpose |
|---|---|---|---|
| Mother site | `apps/mother` | `storepulse.com` | Marketing, template gallery, signup, billing |
| Admin dashboard | `apps/admin` | `app.storepulse.com` | Order/product/customer/inbox management, all tenants, auth-gated |
| Storefront | `apps/storefront` | `*.storepulse.com` + custom domains | Multi-tenant customer storefront, themed per `tenant.category` |

Shared packages: `packages/ui` (shadcn/Tailwind, used by admin + mother), `packages/themes/<category>` (one importable theme package per category — the 5 existing landing-page templates restructured), `packages/api-client` (typed fetch wrapper for the FastAPI backend), `packages/config` (shared tsconfig/eslint/tailwind base).

The FastAPI backend and Postgres DB live in a separate repo/service (`services/api` in the KB's overall layout) on a Hetzner VPS. This repo only consumes that API.

## Commands (per README — no `package.json` exists yet to verify)

```bash
pnpm install
pnpm dev                    # all apps in parallel via Turborepo
pnpm dev --filter=admin     # single app
```

- Component/unit tests: **Vitest**. Critical-path E2E (signup, checkout): **Playwright**, CI-run on `main` only.
- CI (`.github/workflows/`): every PR runs lint, typecheck, build for all three apps. Merges to `main` auto-deploy via Vercel's GitHub integration.
- Each app needs its own `.env.local` (see per-app `.env.example`); every app requires `NEXT_PUBLIC_API_URL`.

## Non-negotiable conventions

- **Tenant ID is never held or sent by client code.** Storefront tenant identity is resolved server-side in middleware from the verified `Host` header; admin tenant identity comes from the authenticated session's JWT claim. Never read tenant ID from `localStorage`, a client cookie, or a query param for anything touching real data — the frontend should never even hold a tenant ID it could forge. Mirrors the backend's tenant-isolation rule (KB §4, §8).
- **No business logic in components.** All data fetching and mutation go through `packages/api-client`; components render and dispatch only.
- **`packages/api-client` types are generated from the backend's OpenAPI schema** — regenerate them, never hand-write duplicate types.
- **TypeScript strict mode** everywhere; no `any` without a comment explaining why.
- **Zod** on every form, mirroring the backend's Pydantic schemas where the same data is validated on both sides.
- **AI provider calls are backend-only** — never call an AI API from frontend code. AI output is suggestion-only (human-in-the-loop).
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, …).

## Adding a new storefront theme/category

1. Create `packages/themes/<new-category>/` mirroring an existing theme package.
2. Register it in `apps/storefront`'s theme registry (`tenant.category` → theme package).
3. No backend changes — `tenant.category` and `product.options_schema` are already generic.

## Build order

`TECHNICAL_KNOWLEDGE_BASE.md` §10 defines a 10-step sequence (backend skeleton → products/orders → admin shell → single-tenant storefront → payments → multi-tenant routing → inbox → AI → billing → hardening). Each step should be independently testable before moving on.
