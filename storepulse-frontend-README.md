# storepulse-frontend

Turborepo monorepo containing every Next.js application in the StorePulse platform: the mother site, the admin dashboard, and the multi-tenant customer storefront.

**Read `TECHNICAL_KNOWLEDGE_BASE.md` (in the org/reference docs, not this repo) first** for system architecture, the data model, and the API contract this repo consumes. This file only covers what's specific to working in *this* repository.

---

## Apps in this repo

| App | Path | Deploys to | Purpose |
|---|---|---|---|
| Mother site | `apps/mother` | `storepulse.com` (Vercel) | Marketing, template gallery, self-serve signup, billing |
| Admin dashboard | `apps/admin` | `app.storepulse.com` (Vercel) | Order/product/customer/inbox management, all tenants, auth-gated |
| Storefront | `apps/storefront` | `*.storepulse.com` + tenant custom domains (Vercel) | Multi-tenant customer-facing storefront, themed per `tenant.category` |

Each app is its own **Vercel Project** with its Root Directory set to the app's path above, all pointing at this one repo. Pushing to `main` triggers all three; Vercel only rebuilds an app if files under its own path (or a shared package it depends on) changed.

## Packages

| Package | Contains |
|---|---|
| `packages/ui` | Shared shadcn/Tailwind components used by `admin` and `mother` |
| `packages/themes/*` | One folder per category (`fashion`, `beauty`, `electronics`, `home-kitchen`, `food`) — the existing 5 templates, restructured as importable theme packages the `storefront` app selects between based on `tenant.category` |
| `packages/api-client` | Typed fetch wrapper for the FastAPI backend; types generated/kept in sync with the backend's OpenAPI schema — **do not hand-write duplicate types here**, regenerate them |
| `packages/config` | Shared `tsconfig.json`, `eslint.config.js`, `tailwind.config.ts` base that each app extends |

## Getting started

```bash
pnpm install
pnpm dev            # runs all apps in parallel via Turborepo
pnpm dev --filter=admin   # run just one app
```

Each app needs its own `.env.local` — see `.env.example` in each app's folder. At minimum, every app needs `NEXT_PUBLIC_API_URL` pointing at the backend (local FastAPI dev server, or the VPS URL).

## Conventions

- **TypeScript strict mode** everywhere — no `any` without a comment explaining why.
- **Zod** for all form validation, mirroring the Pydantic schemas on the backend where the same data is validated on both sides.
- **Tenant ID is never read from `localStorage`, a client-set cookie, or a query param for anything that touches real data.** For the storefront, it comes from the `Host` header resolved server-side in middleware. For the admin dashboard, it comes from the authenticated session. This mirrors the backend's tenant-isolation rule (KB §4) — the frontend should never even have the *opportunity* to send a forged tenant ID, because it should never be holding one to send.
- **No business logic in components.** Data fetching and mutation go through `packages/api-client`; components render and dispatch, they don't decide.
- Commit convention: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) — keeps the changelog and CI both readable.

## Adding a new theme/category

1. Create `packages/themes/<new-category>/` following the structure of an existing theme package.
2. Register it in `apps/storefront`'s theme registry (maps `tenant.category` → theme package).
3. No backend changes needed — `tenant.category` and `product.options_schema` are already generic (KB §5.2).

## CI (`.github/workflows/`)

Every PR: lint, typecheck, build all three apps. Merges to `main` deploy automatically via Vercel's GitHub integration — no separate deploy step needed in this repo's own workflows beyond the checks above.

## Testing

- Component/unit tests: Vitest.
- Critical-path E2E (signup flow, checkout flow): Playwright, run in CI on `main` only (not every PR, to keep CI fast) until the suite is large enough to justify sharding.
