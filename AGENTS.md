# AGENTS.md — storepulse-frontend

Turborepo monorepo: `apps/mother`, `apps/admin`, `apps/storefront`, plus shared `packages/*`. Full detail in `README.md` — this file is the short version every agent loads every turn, so it stays short on purpose.

## Non-negotiables

- Tenant ID is never read from `localStorage`, a client cookie, or a query param for anything real. Storefront: resolved server-side from `Host` header in middleware. Admin: from the authenticated session only.
- No business logic in components. Data access goes through `packages/api-client` only.
- TypeScript strict mode, no untyped `any` without a comment explaining why.
- Zod for form validation.
- pnpm, not npm/yarn.

## Where things live

- New UI shared by admin+mother → `packages/ui`
- New/changed category template → `packages/themes/<category>/`
- New API call → add to `packages/api-client`, typed from the backend's OpenAPI schema — don't hand-write duplicate types
- Shared config (eslint/tailwind/tsconfig) → `packages/config`, apps extend it, don't fork it

## Before you start a task

1. Read the relevant app's own code first (`apps/<app>`), not the whole monorepo.
2. Check `packages/api-client` for whether the endpoint you need already has a typed client method.
3. For anything touching tenant resolution or auth, read `TECHNICAL_KNOWLEDGE_BASE.md` §4 before writing code — this is the one area where getting it wrong is a real security bug, not a style nit.

## Definition of done

- `pnpm lint && pnpm typecheck && pnpm build --filter=<app>` passes for whatever you touched.
- New logic has a test. No test, no merge.
- Conventional Commits format for the commit message.

## Do not

- Add a new top-level app without discussing it first — three apps is the deliberate shape.
- Introduce a new state-management library, CSS approach, or component library without checking `packages/ui` first.
- Duplicate a type that already exists in `packages/api-client`.
