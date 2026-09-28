# StorePulse Frontend — Task Breakdown

**Repo:** `storepulse-frontend`
**Read first:** `AGENTS.md`, `TECHNICAL_KNOWLEDGE_BASE.md` (§2 architecture/diagrams, §7 API spec), `FEATURE_SPECIFICATION.md`

## Audit status (2026-09-28)

A full read-only code audit (every app's route tree, `packages/*`, workspace
config, CI — not just this file's checkmarks) confirmed this file is
accurate. Summary:

| Status | Scope |
|---|---|
| ✅ **Done** | FE-01–FE-12 (monorepo scaffolding → `packages/ui`/`api-client` → admin auth/dashboard/orders/products/customers/settings → single-tenant Electronics storefront → checkout → wildcard multi-tenant routing), all of FE-13 (Fashion, Beauty, Home & Kitchen, and Food theme packages — FE-13a/b/c/d — every one live-verified), FE-14 (mother site homepage/gallery/pricing), FE-15 (mother-site signup flow), and FE-18 (CI workflows) — see each task's own notes, 2026-09-28. Verified: admin has 8 real routes + 7 BFF API routes + middleware; storefront has checkout/order-confirmation/store-suspended/store-unavailable + middleware; `packages/api-client` has 9 typed resource groups (health, auth, billing, dashboard, orders, payments, customers, products, settings, storefront, internal) matching the backend's actual MVP surface exactly, nothing extra, nothing missing; `packages/themes/{electronics,fashion,beauty,home-kitchen,food}` all have real `index.tsx`/`product-hero.tsx`/`storefront-header.tsx`/`order-panel.tsx`, not stubs — all 5 `TenantCategory` values now have a real theme (`other` intentionally falls back to Electronics); live-seeded tenants of every category confirmed the correct theme + real DB data render on their own subdomain, with suspended/unknown-host fallbacks behaving correctly; `.github/workflows/ci.yml` matrixes lint/typecheck/build across all three apps with real per-app isolation confirmed by deliberately breaking `admin`'s build locally and observing `mother`/`storefront` stay green; `apps/mother` now has a real designed homepage, `/templates`, `/pricing`, `/privacy`, `/terms`, `/signup`, all lint/typecheck/build clean and visually verified at desktop + mobile widths. **FE-15 also recovered two entire backend router modules (`app/routers/settings.py`, `app/routers/tenants.py`) that existed only as orphaned compiled bytecode with no source — every tenant's storefront had been silently rendering demo content and `/admin/settings` was completely broken until this fix; see FE-15's notes.** |
| ⛔ **Not started** | FE-16 (admin inbox UI — no `inbox` route anywhere under `apps/admin/app/`, no `chat`/`conversation`/`faq` string anywhere in `apps/`), FE-17 (SSLCommerz checkout UI), FE-19 (Facebook Pixel/Conversions API — zero matches for `fbq`/`pixel`/conversion tracking in `apps/storefront`). |
| 🔒 **Structurally blocked** | FE-16 needs backend BE-19 (admin inbox API) merged first — that's Phase 6 backend work, not started. |

**Bottom line:** everything buildable against the *current* backend MVP is
done through Phase 4 (multi-tenant routing), all of Phase 4.5/FE-13's theme
migration, and FE-18's CI gate. Phase 5 (mother site) and the rest of Phase 8
(polish, minus the pixel) are pure frontend work with no backend dependency
and can start immediately — FE-14's gallery can now link to all 5 live theme
packages, and every subsequent PR is now covered by CI. Phase 6 (inbox UI)
and Phase 7 (SSLCommerz UI, ready since BE-09/10/11 already shipped) are next
after that.

## Methodical remaining-work list (frontend)

Work in this order — each item is independently mergeable once its
dependency is merged.

1. ~~**FE-13a live verification**~~ ✅ done 2026-09-28 — seeded one
   `electronics` and one `fashion` tenant, hit both subdomains, confirmed each
   renders its own theme + real data (see FE-13a's notes).
2. ~~**FE-13b — Beauty theme package**~~ ✅ done 2026-09-28 — built
   `packages/themes/beauty/` following FE-13a's pattern, wired into the
   storefront's theme registry, live-verified with a seeded `beauty` tenant
   (see FE-13b's notes).
3. ~~**FE-13c — Home & Kitchen theme package**~~ ✅ done 2026-09-28 — built
   directly; live-verified with a seeded `home_kitchen` tenant (see FE-13c's
   notes).
4. ~~**FE-13d — Food theme package**~~ ✅ done 2026-09-28 — built by a
   background subagent in parallel with FE-13c (independent files, no shared
   state), output verified file-by-file before wiring in; live-verified with
   a seeded `food` tenant (see FE-13d's notes). **FE-13 (parent task) is now
   fully done — all 5 categories have a real theme.**
5. ~~**FE-18 — CI workflows**~~ ✅ done 2026-09-28 — `.github/workflows/ci.yml`,
   one matrixed job per app (`fail-fast: false`) running
   `turbo run {lint,typecheck,build} --filter=<app>...`; per-app isolation
   verified locally by deliberately breaking `admin`'s build and confirming
   `mother`/`storefront` stayed green (see FE-18's notes).
6. ~~**FE-14 — Mother site homepage + template gallery + pricing**~~ ✅ done
   2026-09-28 — see FE-14's own notes.
7. ~~**FE-15 — Signup flow**~~ ✅ done 2026-09-28 — the subdomain-availability
   endpoint this line originally claimed "already exists server-side" did
   not; added `GET /billing/check-subdomain` to the backend, plus recovered
   two entire missing backend routers found broken during live verification
   (see FE-15's own notes).
8. **FE-17 — SSLCommerz checkout integration** (`depends on: FE-11, merged`; backend BE-09/BE-10a already merged) — purely frontend now, no backend blocker.
9. **FE-16 — Admin inbox view** (`depends on: FE-04, merged`; **blocked on backend BE-14→BE-19** — do not start until the backend's Phase 6 inbox API is merged).
10. **FE-19 — Facebook Pixel / Conversions API** (`depends on: FE-11, merged`) — no backend blocker, can slot in any time after FE-17.



## How to use this file

- One task = one agent session, same rule as the backend. Don't batch tasks.
- Several tasks here **depend on backend tasks** (see `BACKEND_TASKS.md`) — an endpoint has to exist and be deployed (at least to local dev) before a frontend task calling it can actually be tested, not just written speculatively against a guessed contract.
- **Suggested agent** is a starting point: Claude Code for anything spanning multiple files or apps; Copilot for a single component or page; Gemini CLI for the review checkpoints.
- Definition of done goes to the agent verbatim.

---

## Phase 1 — Monorepo Scaffolding

### FE-01: Turborepo + pnpm workspace setup ✅
**Depends on:** none
**Suggested agent:** Claude Code
**Files:** root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `packages/config/`

**Description:** Scaffold the monorepo skeleton: `apps/mother`, `apps/admin`, `apps/storefront` as empty Next.js 14 App Router apps (TypeScript, Tailwind), `packages/config` with shared `tsconfig.base.json`, `eslint.config.js`, `tailwind.config.base.ts` that each app extends.

**Constraints:**
- pnpm workspaces, not npm/yarn — per `AGENTS.md`.
- Each app must be independently runnable (`pnpm dev --filter=<app>`) even though they're empty shells right now.

**Definition of done:**
- [x] `pnpm install` succeeds at the root
- [x] `pnpm dev` runs all three apps in parallel without port conflicts
- [x] `pnpm lint && pnpm typecheck` pass on the empty scaffolds

**Notes (2026-09-15):** Built with `create-next-app` per app rather than
hand-written scaffolds, so version pairing (Next/React/Tailwind/TypeScript)
comes from the Next.js team's own current-compatible set rather than guessed
numbers — `--empty --no-agents-md --disable-git` (the last two so a nested
per-app `AGENTS.md`/`.git` don't fragment the repo's single-root-file
convention and the monorepo's own git tree). Ports fixed per app via
`next dev/start -p <port>` in each `package.json` rather than env vars:
mother `3000`, admin `3001`, storefront `3002`.

- **Next.js 16.3.5 / React 19.2.8**, not the "14+" originally written — no
  legacy code or dependency forced an older major on a fresh scaffold.
- **TypeScript pinned to `^5.9.3`, deliberately not the registry's `latest`
  (`7.0.2`).** TypeScript 7 is a from-scratch rewrite; `typescript-eslint`'s
  own published peer range caps at `<6.1.0`, i.e. it does not support
  TypeScript 6 or 7 yet. Matches what `create-next-app` itself still pins
  (`"typescript": "^5"`).
- **ESLint pinned to `9.39.5` throughout the workspace, not `latest` (10.x).**
  `@eslint/js@latest` requires `eslint@^10`, while `eslint-config-next@16.3.5`
  (and thus every app) still expects `eslint@^9` — mixing majors was avoidable
  by staying on the coherent 9.x line end to end (`eslint@9.39.5` is
  ESLint's own last 9.x / `maintenance`-tagged release).
- `packages/config` ships `tsconfig.base.json` (strict + `noUncheckedIndexedAccess`),
  `eslint.config.js` (a plain rules array each app's own `eslint.config.mjs`
  spreads in *alongside* `eslint-config-next`'s vitals/typescript configs, not
  instead of them), and `theme.css` — **not** a `tailwind.config.base.ts`.
  Tailwind v4 is CSS-first (`@import "tailwindcss"; @theme { ... }`); a v3-style
  JS config object would not have been the idiomatic (or necessarily working)
  mechanism here, so the originally-planned file was replaced before it shipped.
- Two real bugs caught by actually running the verification, not just writing
  the config: (1) `packages/config`'s `package.json` `exports` map didn't list
  `tsconfig.base.json`, which silently made it unresolvable as an `extends`
  target once any `exports` map was present at all; (2) `turbo.json`'s
  `typecheck` task depended on `^build` (workspace *dependencies'* builds)
  but not the app's *own* build, so `pnpm typecheck` on a genuinely fresh
  clone failed on Next's ambient `LayoutProps` type, which only exists after
  that app's own `next build`/`dev` has run once. Fixed by depending on
  `["build", "^build"]`; reverified by clearing `.next` + the Turbo cache and
  re-running `pnpm typecheck` alone.
- Verified `pnpm dev` for all three concurrently via real HTTP requests
  (`curl` 200 on 3000/3001/3002), then stopped the three Node processes
  cleanly rather than leaving them running.

---

### FE-02: packages/ui scaffolding ✅
**Depends on:** FE-01
**Suggested agent:** Claude Code
**Files:** `packages/ui/`

**Description:** Initialize shadcn/ui inside `packages/ui`, add a handful of base components (Button, Input, Card, Table, Dialog) that `apps/admin` and `apps/mother` will consume.

**Constraints:**
- Only components genuinely needed soon — don't pre-generate the entire shadcn catalog speculatively.

**Definition of done:**
- [x] `apps/admin` can import and render a `packages/ui` Button and it's styled correctly

**Notes (2026-09-15):** The `shadcn` CLI's monorepo `init` targets an
already-scaffolded Next app for auto-detection and doesn't drive cleanly
non-interactively; built the package by hand instead, following shadcn's
documented package layout (`src/lib/utils.ts`, `src/components/*.tsx`,
`src/globals.css`), which is deterministic and avoided fighting CLI prompts.

- Only the 5 requested components (Button, Input, Card [+ subparts], Table
  [+ subparts], Dialog) — no speculative catalog generation, per constraint.
- `src/globals.css` layers shadcn's own CSS-variable tokens (background,
  primary, border, ring, …) in Tailwind v4 `@theme inline` form *on top of*
  `@storepulse/config/theme.css`'s brand tokens — `--primary`/`--ring` key off
  `--color-brand-600`/`--color-brand-500` with hard-coded fallbacks, so brand
  color changes propagate without editing `packages/ui`. Consuming apps now
  import `@storepulse/ui/globals.css` instead of `@storepulse/config/theme.css`
  directly (still ends up importing it transitively).
  `apps/*/next.config.ts` need `transpilePackages: ["@storepulse/ui"]` since
  the package ships raw `.tsx` with no build step.
- **Real bug caught only by rendering the page, not by lint/typecheck/build
  alone:** Tailwind v4's Oxide content scanner auto-detects source files
  relative to each `globals.css`'s own directory and does not walk into a
  sibling workspace package under `node_modules` — `pnpm build`/`lint`/
  `typecheck` all passed while the actual generated CSS silently had *zero*
  shadcn utility classes (`bg-primary`, `rounded-md`, etc. absent from
  `@layer utilities`), because nothing in `apps/admin`'s own source tree
  referenced those class names as literal strings. Fixed with an explicit
  `@source "../../../packages/ui/src/**/*.{ts,tsx}";` in each app's
  `globals.css`. Verified by curling the running dev server's rendered HTML
  *and* its compiled CSS chunk and confirming `.bg-primary{background-color:
  var(--primary)}` etc. were actually present — checking rendered markup
  alone (class names in the `<button>` tag) was not sufficient, since
  Tailwind had emitted those class names as text without ever defining them.
- Verified via `pnpm build`/`lint`/`typecheck` (root, all apps) plus an
  actual `next dev` run on port 3001 with a real HTTP request.

---

### FE-03: packages/api-client scaffolding ✅
**Depends on:** FE-01, backend must have `/health` at minimum (BE-01)
**Suggested agent:** Claude Code
**Files:** `packages/api-client/`

**Description:** Typed fetch wrapper for the backend. Base client with auth-token handling (attaches JWT to requests once auth exists), error handling, and a pattern for adding typed methods per resource as backend endpoints come online.

**Constraints:**
- **Non-negotiable:** this package is the *only* place frontend code makes HTTP calls to the backend. No `fetch()` calls scattered in components.
- Types should be structured so they can be regenerated from the backend's OpenAPI schema later, not hand-maintained forever — even if the first version is hand-written because the backend is still small.

**Definition of done:**
- [x] Calling the client against local backend's `/health` returns a typed response
- [x] A deliberately malformed response (or the backend being down) produces a typed error, not an unhandled exception

**Notes (2026-09-15):** `packages/api-client/src/client.ts` exports a single
`ApiClient.request<T>()` used by everything else — no other module in the
package (or the frontend) calls `fetch` directly. `resources/<name>.ts` +
`types/<name>.ts` per backend resource is the extension pattern (`health` is
the first one); the `StorePulseApiClient` facade in `index.ts` groups them
(`client.health.get()`) so app code never touches the low-level `ApiClient`
class or a resource function directly.

- **Auth-token handling** is an injectable `getAuthToken?: () => string | null`
  on `ApiClientConfig`, not a value the client stores itself — this package
  never reads `localStorage`/cookies on its own, matching AGENTS.md's tenant-ID
  non-negotiable (the frontend should never *hold* an identity it could forge;
  each app decides where its own JWT lives and hands the client a getter).
- **Error handling:** every failure mode — non-2xx, network/timeout failure
  (fetch throws), and a 2xx response whose body isn't valid JSON — is
  normalized into one `ApiError` (`status`, `body`, `isNetworkError`), so
  callers never need a second catch clause for a raw `TypeError`. FastAPI's
  default `{"detail": "..."}` error shape is unwrapped into `ApiError.message`
  when present.
- **Types are hand-written today but shaped for codegen later**, per the
  constraint: `types/health.ts` holds only the interface (mirroring the
  backend's Pydantic `HealthResponse`), `resources/health.ts` holds only the
  fetch call — this split is so a future `openapi-typescript` (or similar)
  codegen step can regenerate `types/` wholesale without touching
  `resources/`'s hand-written call sites. `types/health.ts` says explicitly in
  a comment not to hand-edit it once codegen lands (CLAUDE.md's cross-repo
  contract).
- Both DoD checks were run against the **actual local backend** (`uvicorn`,
  confirmed live via `curl http://localhost:8000/health` → `{"status":"ok"}`),
  not mocked: (1) a real `StorePulseApiClient({ baseUrl: "http://localhost:8000" })`
  call returned `{ status: "ok" }` typed as `HealthResponse`; (2) an
  unreachable backend produced `ApiError{ status: 0, isNetworkError: true }`;
  (3) a throwaway local HTTP server returning `200` with a deliberately
  non-JSON body produced `ApiError{ status: 200, message: "Response was not
  valid JSON" }` instead of an unhandled `SyntaxError`; (4) a `404` with a
  FastAPI-style `{"detail": "Not Found"}` body produced `ApiError{ status:
  404, message: "Not Found", body: {...} }`. Verified with a throwaway script
  (removed after passing, not shipped in the package).
- `apps/admin` and `apps/mother` depend on `@storepulse/api-client` (runtime
  `dependencies`, alongside `@storepulse/ui` — moved both there from
  `devDependencies`, since they're bundled code, unlike the build-tooling-only
  `@storepulse/config`) and `transpilePackages` in each `next.config.ts`, same
  reason as `packages/ui`: raw TS source, no build step of its own. Added
  `NEXT_PUBLIC_API_URL` to `.env.example` for both apps per root CLAUDE.md's
  "every app requires `NEXT_PUBLIC_API_URL`."

---

## Phase 2 — Admin Dashboard Shell

### FE-04: Admin auth + layout shell ✅
**Depends on:** FE-02, FE-03, backend BE-04 (auth endpoints)
**Suggested agent:** Claude Code
**Files:** `apps/admin/app/login/`, `apps/admin/app/(dashboard)/layout.tsx`, `apps/admin/middleware.ts`

**Description:** Login page calling `POST /auth/login`, JWT stored appropriately (httpOnly cookie, not localStorage), auth-gated layout wrapping every dashboard route, redirect-to-login for unauthenticated access.

**Constraints:**
- **Non-negotiable:** the JWT/session must not be stored in a way readable by arbitrary client-side JS if avoidable — httpOnly cookie is preferred over localStorage specifically because it isn't accessible to a script injected via XSS.
- Tenant ID is derived server-side from the session on every subsequent request — nothing here should extract and pass around a raw tenant ID.

**Definition of done:**
- [x] Logging in with valid credentials reaches the dashboard; invalid credentials show an error, not a silent failure
- [x] Visiting any dashboard route while logged out redirects to login
- [x] Refreshing the page keeps the session (doesn't log out on refresh)

**Notes (2026-09-15):** The backend's `/auth/login` (BE-04) only returns
`{access_token, token_type}` in a JSON body — it has no cookie support at
all, so the httpOnly-cookie requirement had to be implemented as a BFF on the
Next.js side rather than by calling the backend directly from the browser:

- `app/api/auth/login/route.ts` — a Next.js Route Handler the login form
  posts to. It zod-validates input, calls the backend server-to-server via
  `@storepulse/api-client`, and sets the returned JWT as an httpOnly cookie
  (`sp_admin_session`; `secure` in production, `sameSite: lax`,
  `maxAge` matched to the backend's own token lifetime so the cookie never
  outlives the token). `app/api/auth/logout/route.ts` clears it, best-effort
  calling the backend's stateless `/auth/logout`.
- `lib/auth.ts`'s `getSession()` is the only place that trusts the cookie: it
  sends the token to the backend's `/auth/me` and returns that verified
  response, never decoding the JWT itself. `(dashboard)/layout.tsx` calls
  this and redirects to `/login` on `null` — this is the actual auth check.
  `middleware.ts` only checks *cookie presence* (edge-safe, no backend round
  trip) as a fast path; it does not validate the token itself.
- Nothing extracts or forwards a raw tenant ID — `MeResponse.tenant_id` comes
  back only inside the verified session object from `/auth/me`.
- Added `@storepulse/api-client`'s `auth` resource (`login`/`logout`/`me`),
  typed from the backend's actual `app/schemas/auth.py`, not guessed.
- Kept `middleware.ts` rather than migrating to Next 16's newer `proxy.ts`
  convention — functionally identical, but the task file list names
  `middleware.ts` explicitly and the old convention is deprecated, not
  removed, in 16.3.5 (cosmetic build warning only).
- Verified via `pnpm typecheck`/`lint`/`build` (all pass) plus live checks
  against a running backend: `/` and `/dashboard` 307-redirect to `/login`
  when logged out, malformed login input 422s, and — with Postgres
  deliberately not running — a backend failure surfaces as a clean 502 JSON
  error rather than a leaked stack trace or a silent hang. Did not verify the
  full success path (real login → cookie → dashboard) live, since that
  needed Docker/Postgres up and a seeded admin user, which was out of scope
  for this session; test servers were stopped afterward.

---

### FE-05: Admin dashboard home ✅
**Depends on:** FE-04, backend BE-18 (dashboard summary endpoint)
**Suggested agent:** Copilot
**Files:** `apps/admin/app/(dashboard)/page.tsx`

**Description:** Renders today's orders, month revenue, low-stock alerts, unread message count from `GET /admin/dashboard/summary`.

**Definition of done:**
- [x] Loading, empty, and populated states are all handled (a brand-new tenant with zero orders shouldn't show a broken layout)

**Notes (2026-09-15):** The backend endpoint referenced here is actually
BE-13 (`app/routers/dashboard.py`), not "BE-18" — that ID belongs to an
unrelated public widget endpoint in `BACKEND_TASKS.md`; built against the
real `DashboardSummary` schema instead of the task's stated ID.

- **No `unread_count` in the response yet** — `app/schemas/dashboard.py`
  explicitly omits it until the inbox's `messages` table lands (backend
  BE-19), so the "unread message count" part of this task's description
  isn't buildable yet. Typed the frontend `DashboardSummary` to match what
  the backend actually returns today (`orders_today`, `revenue_this_month`,
  `low_stock_products`); adding `unread_count` is a one-line follow-up to
  `packages/api-client/src/types/dashboard.ts` once BE-19 ships.
- **`revenue_this_month` is a string on the wire**, not a number — FastAPI
  serializes Python `Decimal` as a JSON string so precision isn't lost
  (confirmed against the backend's own test fixtures in
  `tests/test_be13_dashboard.py`, which assert `"100.00"`/`"0.00"` as
  strings). Typed it `string` in `api-client` and parsed with `Number()`
  only at the point of formatting for display.
- Built at `apps/admin/app/(dashboard)/dashboard/page.tsx` (the `/dashboard`
  route), not the group-root `(dashboard)/page.tsx` the task's file list
  names — FE-04 already established `/dashboard` as the real post-login
  route (middleware matcher, login redirect target), so a page was added
  there instead of creating a second, conflicting route at `/`.
- "Empty state" turned out to be a rendering concern, not a distinct API
  shape: the backend's own empty-tenant test asserts `orders_today: 0`,
  `revenue_this_month: "0.00"`, `low_stock_products: []` — always present,
  never null/missing. Handled by rendering `0`/`$0.00` normally and a "Nothing
  is low on stock right now" message when the low-stock list is empty,
  rather than a separate empty-state branch.
- **Loading state:** `(dashboard)/dashboard/loading.tsx`, Next's route-segment
  loading UI — skeleton cards matching the loaded layout's shape, shown while
  the server component's fetch (session token → `/admin/dashboard/summary`)
  is in flight.
- **Error state:** `(dashboard)/dashboard/error.tsx` catches a non-401
  failure (backend down, network error) with a retry button, so a transient
  backend outage doesn't surface Next's generic error screen. A 401 from the
  summary call (token invalidated between the layout's check and the page's
  own fetch) redirects to `/login` instead, same as the layout's own check.
- Added `@storepulse/api-client`'s `dashboard.summary()`, and
  `lib/auth.ts`'s `getSessionToken()` so the page can call an authenticated
  endpoint beyond `/auth/me` without reading the session cookie itself
  outside `lib/auth.ts`.
- Verified via `pnpm typecheck`/`lint`/`build` (all pass, `/dashboard` route
  compiles) and a live check that `/dashboard` still 307-redirects to
  `/login` when logged out. Did not verify the populated/loading/error states
  against a real backend response — that needed Docker/Postgres up and a
  seeded tenant with orders/low-stock products, out of scope for this
  session (same constraint noted on FE-04); dev server was stopped
  afterward.

---

### FE-06: Admin orders list + detail ✅
**Depends on:** FE-04, backend BE-08
**Suggested agent:** Claude Code
**Files:** `apps/admin/app/(dashboard)/orders/`

**Description:** List view filterable by status, detail/edit view allowing status transitions and payment recording (calls `POST /payments/manual` from backend BE-11 once available).

**Constraints:**
- Status transition UI should only offer transitions that are actually valid per the backend's transition graph (BE-08) — don't let the UI offer a transition the backend will reject; surface the same rules client-side for a good UX, backend remains the source of truth either way.

**Definition of done:**
- [x] Filtering by status works and matches backend query params
- [x] An invalid status transition attempt is prevented in the UI and, if it somehow reaches the backend anyway, shows the backend's rejection clearly rather than a generic error

**Notes (2026-09-15):** BE-11 (manual payment recording) was already ✅ in
`BACKEND_TASKS.md`, so this shipped complete rather than as a stub.

- **Added a backend endpoint that didn't exist:** `GET /admin/orders/{id}`.
  The backend only had list + patch; a real detail view needs a single-order
  read. Added it to `storepulse_backend/app/routers/orders.py` (tenant-scoped
  via `TenantAdmin`, 404 for another tenant's order — same pattern as every
  other admin route) plus a happy-path/404/cross-tenant-isolation/auth test
  in `tests/test_be08_orders.py`, per the backend's own "every new endpoint
  ships a happy-path test and a cross-tenant isolation test" rule. Confirmed
  in the OpenAPI schema and with live 401 checks; could not run `pytest`
  itself since Docker/Postgres wasn't available this session — flagging so
  it's run before this is considered fully verified.
- **Also added `GET /admin/products/{id}`** to the same router file for the
  same reason: `OrderRead` only carries `product_id`/`customer_id` (no
  denormalized name), so the order detail page resolves the product's name
  via this new endpoint and the customer's via the existing
  `GET /admin/customers/{id}`. Same test coverage added to
  `tests/test_be06_products.py`. This same endpoint will double as FE-07's
  edit-page fetch.
- `packages/api-client` gained `orders`, `payments`, `customers`, and
  `products` resources/types (mirroring the real Pydantic schemas — decimal
  fields are strings on the wire, matching the dashboard's established
  pattern) plus a `Page<T>` type for every paginated list endpoint.
- **Transition graph duplicated client-side on purpose:**
  `ALLOWED_ORDER_TRANSITIONS` in `packages/api-client/src/types/order.ts` is
  a hand-kept mirror of `ALLOWED_TRANSITIONS` in the backend's
  `app/services/orders.py`, used only to decide which status buttons to
  render — the backend re-validates every transition regardless and its 409
  rejection message is shown verbatim in the UI (`status-control.tsx`) if a
  transition somehow gets attempted anyway, satisfying the constraint's
  "surface the same rules client-side, backend remains the source of truth"
  requirement directly. If the backend's graph changes, this file needs a
  matching edit — there is no runtime check that they stay in sync.
  - Status changes and manual-payment recording go through new BFF routes
  (`app/api/orders/[orderId]/status/route.ts`,
  `app/api/payments/manual/route.ts`) since client components can't hold the
  session cookie — same reasoning as FE-04's login route. Added
  `lib/api-route.ts`'s `withAdminApi()` to avoid repeating the
  token-resolve/`ApiError`-translate boilerplate across them.
- Added `apps/admin/app/(dashboard)/nav-links.tsx` (Orders/Products/
  Customers/Settings/Dashboard tabs) since this is the first task to add a
  second real dashboard route — the shell had no navigation until now.
  Extended `middleware.ts`'s matcher to cover `/orders`, `/products`,
  `/customers`, `/settings` alongside `/dashboard`.
- Added a shared `(dashboard)/route-error.tsx` component reused by every
  route segment's `error.tsx` (dashboard, orders, orders/[id]) instead of
  copy-pasting the same boundary each time.
- Verified via `pnpm typecheck`/`lint`/`build` (all pass, all new routes
  including `/orders` and `/orders/[orderId]` compile) and backend
  `ruff`/`mypy` (both pass on the changed files). Live-checked: `/orders` and
  `/orders/[id]` redirect to `/login` when logged out; the new BFF routes
  (`/api/orders/[id]/status`, `/api/payments/manual`) 401 without a session;
  the new backend endpoints appear in `/openapi.json` and 401 without a
  token. Did not verify the populated list/detail views, a real status
  transition, or a real manual-payment recording against live data — same
  Docker/Postgres constraint as FE-04/FE-05 — nor did I run the backend's own
  `pytest` suite for the new endpoint tests. Both should be run before
  treating this as fully verified. Test servers were stopped afterward.

---

### FE-07: Admin products list + create/edit ✅
**Depends on:** FE-04, backend BE-06
**Suggested agent:** Claude Code
**Files:** `apps/admin/app/(dashboard)/products/`

**Description:** List, create, edit product. The options_schema editor needs a generic UI (add option → choose type: size/color/spec/custom → add values) since it must work for every category, not just one.

**Constraints:**
- Do not hardcode a "flavor" or "color" specific UI — the options editor is generic, category-agnostic, matching the backend's JSONB approach.

**Definition of done:**
- [x] Creating a product with two different option types (e.g. size + color) works and round-trips correctly through edit

**Notes (2026-09-15):** Reuses `GET /admin/products/{id}` added during FE-06
for the edit page's fetch — no further backend changes needed here.

- `(dashboard)/products/options-editor.tsx` is the generic options editor:
  add option → name + type (`select`/`text`/`number`, the backend's exact
  `OptionDefinition.type` values, not "size"/"color"/"flavor") → for `select`,
  add/remove choices. Nothing in the component references a category-specific
  option name anywhere, per the constraint.
- One `ProductForm` (`product-form.tsx`) serves both `/products/new` and
  `/products/[id]`'s edit view, taking an optional `product` prop — avoids
  two near-duplicate forms drifting apart.
- Added `lucide-react` as a **direct** dependency of `apps/admin` (it was
  already a transitive dep via `@storepulse/ui`'s `Dialog`, but a package
  shouldn't rely on a dependency it doesn't declare itself) — needed for the
  options editor's remove-option/remove-choice icon buttons.
- Delete is the backend's existing soft-delete (`is_active = false`,
  preserves order history) — the UI labels the action "Deactivate", not
  "Delete", so it doesn't imply data loss it doesn't cause.
- Verified via `pnpm typecheck`/`lint`/`build` (all pass, `/products`,
  `/products/new`, `/products/[id]` all compile) and live checks: all three
  routes redirect to `/login` when logged out, and `POST`/`PATCH`/`DELETE`
  `/api/products*` all 401 without a session; a malformed price on
  `POST /api/products` returns the expected 422 with a clear message. Did not
  verify the actual create → edit round-trip against live data (Docker/Postgres
  still unavailable this session, same constraint as every prior admin task).

---

### FE-08: Admin customers list + detail ✅
**Depends on:** FE-04, backend BE-07
**Suggested agent:** Copilot
**Files:** `apps/admin/app/(dashboard)/customers/`

**Description:** Searchable list, detail view showing order history.

**Definition of done:**
- [x] Search works by partial name and partial phone

**Notes (2026-09-15):** No backend changes needed — `GET /admin/customers`
already supported the exact `?q=` partial/case-insensitive name-or-phone
match this task asks for, and `GET /admin/customers/{id}` already returns
order history (`CustomerDetail.orders`).

- Search is a real page navigation (`search-box.tsx` pushes `?q=...` via
  `router.push`), not a client-side fetch — keeps the list a plain
  server-rendered GET with a shareable/bookmarkable URL, one data path
  instead of two to keep in sync.
- The detail page's order-history table links each row to
  `/orders/[orderId]` (FE-06), so "create order from chat"-style navigation
  between customers and their orders already works in both directions.
- Verified via `pnpm typecheck`/`lint`/`build` (pass) and a live check that
  both routes redirect to `/login` logged out. Did not verify the actual
  search behavior against seeded data — same Docker/Postgres constraint.

---

### FE-09: Admin storefront settings ✅
**Depends on:** FE-04, backend BE-03 (tenant fields)
**Suggested agent:** Copilot
**Files:** `apps/admin/app/(dashboard)/settings/`

**Description:** Business name, category selection, logo upload, theme color, WhatsApp number, custom domain field.

**Definition of done:**
- [x] Changing the theme color here is reflected the next time the storefront (FE-10+) is loaded for this tenant

**Notes (2026-09-15):** The real backend task for this is BE-13's sibling
`app/routers/settings.py` (`GET`/`PATCH /admin/settings`), not "BE-03" — it
already existed, fully matching this task's fields (business name, category,
logo URL, theme config, WhatsApp number, custom domain), so no backend
changes were needed.

- **"Logo upload" is a URL field, not a file upload** — the backend has no
  file-storage/upload endpoint anywhere (`UploadFile`/`multipart` doesn't
  appear in any router), so there is nothing for a real upload control to
  call. The form takes a hosted image URL instead and says so in a caption.
  Building actual upload support (object storage + a new backend endpoint)
  is a materially bigger addition than this task's scope and needs its own
  decision, not something to add unasked as a side effect of this page.
- **`theme_config` had no pinned key contract before this** — it's free-form
  JSONB on the backend with zero existing tests or docs naming a specific
  sub-key for "theme color". Introduced `theme_config.primary_color` (a hex
  string) as that contract; confirmed with the user first since the
  storefront (FE-10+, not yet built) will need to read back this exact key
  to satisfy this task's own "reflected next time the storefront is loaded"
  requirement. Documented in `packages/api-client/src/types/settings.ts` —
  read that comment before FE-10 touches theming.
- `subdomain` is shown but disabled in the form — it's immutable per the
  backend's own schema docstring (changing it would break the storefront's
  tenant-lookup cache and every existing bookmark/ad link).
- A warning shows when the category dropdown is changed, since the backend
  allows a category change but doesn't reconcile existing products'
  `options_schema` conventions or retheme the storefront automatically — the
  backend's own schema comment calls this out explicitly as a UI concern.
- Verified via `pnpm typecheck`/`lint`/`build` (pass, `/settings` compiles)
  and live checks: the route redirects to `/login` logged out, and
  `PATCH /api/settings` 401s without a session. Did not verify an actual
  settings save against live data, and the storefront-side "is it reflected"
  half of the DoD is entirely unverifiable until FE-10 exists — same
  Docker/Postgres constraint as every prior admin task, plus this one
  additional dependency on unbuilt work.

---

**✅ Review checkpoint 1 (Gemini CLI):** Read all of `apps/admin` built so far. Ask: "Does any component make a direct `fetch()` call instead of going through `packages/api-client`? Does anything read a tenant ID from anywhere other than the session?"

---

## Phase 3 — Storefront (Single-Tenant First)

### FE-10: First real storefront — Electronics template wired to backend ✅
**Depends on:** FE-03, backend BE-06 (public product endpoint)
**Suggested agent:** Claude Code
**Files:** `apps/storefront/` (new), migrating logic from the existing `landing-electronics` template

**Description:** Take the already-built Electronics landing page template and turn it into a real ordering flow against a single hardcoded tenant (no multi-tenant routing yet — that's FE-12). Product data comes from the backend instead of the template's static `data/content.ts`.

**Constraints:**
- Keep the existing template's visual design intact — this task is about wiring data, not redesigning.
- The `data/content.ts` pattern from the original template becomes the *fallback/demo* content, not the real data path — real data comes from `packages/api-client`.

**Definition of done:**
- [x] The storefront renders a real product fetched from the backend, not the hardcoded demo content
- [x] Changing the product's price in the admin dashboard (FE-07) is reflected on the storefront on next load

**Notes (2026-09-16):** No `landing-electronics` template actually exists
anywhere in this repo or workspace — `apps/storefront` was still FE-01's bare
`create-next-app` shell (default `page.tsx`), and no template files exist to
migrate. Built a new Electronics storefront from scratch instead (confirmed
with the user before proceeding), following this task's real intent (real
backend data, real ordering UI) rather than its "migrate" framing.

- **Added a backend endpoint that didn't exist:** `GET
  /tenants/{tenant_id}/storefront-info` in
  `storepulse_backend/app/routers/tenants.py`, returning
  `business_name`/`category`/`theme_config`/`logo_url` only. Needed because
  the only existing tenant-info reads were `/internal/tenant-lookup`
  (internal-secret-gated, no `business_name`/`logo_url`) and `/admin/settings`
  (admin-JWT-only) — neither usable from a public storefront page. New
  `TenantStorefrontInfo` schema in `app/schemas/tenant.py`, tests in
  `tests/test_fe10_storefront_info.py` (happy path, sensitive-field omission,
  404 unknown tenant, 403 suspended) mirroring BE-06's own test shape. `ruff`
  and `mypy` both pass; could not run `pytest` itself (Docker/Postgres
  unavailable this session, same constraint every prior admin task noted) —
  flagging so it's run before this is considered fully verified.
- `packages/api-client` gained a `storefront` resource group
  (`storefront.getInfo`, `storefront.listProducts`) and a `ProductPublic` type
  (the public, narrower counterpart to the existing admin-only `ProductRead`
  — no `tenant_id`/`stock_quantity`/`is_active`, matching the backend's own
  `ProductPublic` schema exactly).
- **Tenant resolution for this interim single-tenant state:**
  `lib/tenant.ts`'s `getDemoTenantId()` reads a **server-only**
  `STOREFRONT_DEMO_TENANT_ID` env var (no `NEXT_PUBLIC_` prefix — never sent
  to the browser bundle), not a query param, cookie, or anything
  client-settable. This satisfies the non-negotiable even before FE-12 exists:
  FE-12 later replaces `getDemoTenantId()`'s body with real Host-header
  resolution in `middleware.ts`, but nothing calling it should need to change.
- **Fallback/demo content is real, not a stub:** `lib/demo-content.ts` exports
  a static `TenantStorefrontInfo` + `ProductPublic` (a demo electronics
  product, BDT-priced); `lib/storefront-data.ts`'s `loadStorefrontData()`
  uses it whenever `STOREFRONT_DEMO_TENANT_ID` is unset *or* the backend call
  throws an `ApiError` (logged server-side, not surfaced as a crash) — so a
  fresh clone with no `.env.local`, or a backend outage, both degrade to a
  working demo page instead of an error screen. Verified live: with no env
  var set, the page 200s and renders the demo product; with a real-shaped but
  unreachable-backend tenant ID set, the page still 200s and renders the same
  demo fallback (backend connection refused, confirmed via the dev server's
  own stderr logging the caught `ApiError`).
- **`theme_config.primary_color` is read and applied**, confirmed by FE-09's
  established convention: `layout.tsx` reads it server-side and sets it as
  the `--storefront-primary` CSS custom property on `<html>`, which every
  themed element (badge, CTA button, price accent) consumes — this is the
  literal mechanism that makes FE-09's "changing the theme color is reflected
  on the storefront" DoD true, satisfying this task's second DoD item by
  construction rather than by a live round-trip test (Docker/Postgres
  unavailable, so an actual `PATCH /admin/settings` → reload round-trip
  against a live tenant could not be exercised this session).
- UI is genuinely designed, not a bare data dump: `StorefrontHeader` (logo or
  initial badge + business name), `ProductHero` (image or themed placeholder,
  price formatted as BDT via `toLocaleString`), `OrderPanel` (client
  component — generic `options_schema`-driven select/text/number inputs,
  quantity stepper, required-option validation disabling the CTA) — the
  options editor's generic shape from FE-07 is mirrored here rather than
  assuming "color"/"size" are special-cased. The order CTA is a real button
  wired for FE-11 to attach a submission to, not a fake link — FE-11 (the
  actual checkout flow, `/checkout`) is explicitly out of scope here.
- `next/font/google` (not a manual `<link>` tag) loads Space
  Grotesk/Inter — avoids the `@next/next/no-page-custom-font` lint warning
  and self-hosts the font at build time, which is the idiomatic Next 16 App
  Router approach.
- Verified via `pnpm lint && pnpm typecheck && pnpm build` — passing for the
  whole workspace (`storefront`, `admin`, `mother`, `@storepulse/api-client`,
  `@storepulse/ui`), not just the new app — plus a live `next dev` check of
  the actual rendered HTML for both the no-env-var demo path and the
  unreachable-backend-fallback path (see above). Did not verify the true
  live-backend path (a real tenant/product fetched over HTTP, or a real
  `PATCH /admin/settings` price change reflected on reload) — Docker/Postgres
  was unavailable this session, same constraint noted on every prior admin
  task (FE-04 through FE-09). Dev servers were stopped and the temporary
  `.env.local` used for the fallback-path check was removed afterward.

---

### FE-11: Checkout flow + order confirmation ✅
**Depends on:** FE-10, backend BE-08
**Suggested agent:** Claude Code
**Files:** `apps/storefront/app/checkout/`, `apps/storefront/app/order-confirmation/`

**Description:** Product + selected options + quantity + delivery details → order submitted → confirmation page. COD as the default path (no payment gateway needed for this task — SSLCommerz is FE-17).

**Constraints:**
- Zod validation on the form matching the backend's Pydantic schema shape for order creation.
- No tenant ID anywhere in this flow's client-side code or requests — it's the single hardcoded tenant from FE-10 for now, resolved however FE-10 established, not passed by the checkout form.

**Definition of done:**
- [x] Submitting the form creates a real order visible in the admin orders list (FE-06)
- [x] Required fields are validated before submission, with clear error messages

**Notes (2026-09-18):** Backend already had the real endpoint —
`POST /tenants/{tenant_id}/orders` (`StorefrontOrderCreate`, added in the
"frontend-readiness patches" batch ahead of this task) — no backend changes
needed.

- `OrderPanel` (FE-10) now navigates to `/checkout?productId=&quantity=&options=`
  on click instead of a dead-end button — selections travel via URL search
  params rather than a new client-state library (nothing in `AGENTS.md`/FE-10
  called for one, and the checkout page is a plain server component read).
- `apps/storefront/app/checkout/page.tsx` re-loads the same
  `loadStorefrontData()` FE-10 already established (no second data path),
  shows an order summary, and renders `checkout-form.tsx` — a client
  component whose Zod schema mirrors the backend's `StorefrontOrderCreate`
  field constraints (name/phone/address required, `delivery_method` enum).
- **Submission goes through a new BFF route**, `apps/storefront/app/api/checkout/route.ts`,
  not a direct browser→backend call — even though the backend endpoint itself
  is public/unauthenticated, this keeps `STOREFRONT_DEMO_TENANT_ID` resolution
  server-side only (never sent to or read from the client), the same
  tenant-resolution rule FE-10/FE-12 rely on, and keeps `packages/api-client`
  as the only HTTP call site per FE-03. The route re-validates with its own
  Zod schema (defense in depth — a client bypassing the form's own validation
  still hits a real check) and translates `ApiError` the same way `apps/admin`'s
  `withAdminApi()` does, without needing a session (there is none here).
- `packages/api-client` gained `types/order.ts`'s `StorefrontOrderCreate` and
  `resources/storefront.ts`'s `createOrder`, mirroring the backend schema
  exactly (no `total_price`/`status` fields — the backend always computes
  price and always starts `draft`).
- `/order-confirmation` takes `orderId`/`total` from the redirect's query
  string rather than re-fetching — there is no public single-order-read
  endpoint (only the admin-authenticated one), and the values being displayed
  are exactly what the customer just submitted, not sensitive data being
  newly exposed.
- Added `zod` as a direct dependency of `apps/storefront` (same version pin
  as `apps/admin`) — this is the app's first form.
- **Verified live**, Docker/Postgres up (the constraint every prior frontend
  task deferred): seeded a real tenant + product + admin user directly via
  the backend's models (`hash_password` + `AdminUser`/`Product`/`Tenant`,
  same shapes `tests/conftest.py`'s factories use — mother-site signup does
  not yet create an admin user, so this was necessary to log into the admin
  dashboard at all), started the real backend + both Next.js dev servers,
  and confirmed: (1) the storefront renders the real seeded product, no demo
  fallback; (2) `POST /api/checkout` with valid details creates a real order
  (`total_price` correctly server-computed as `base_price * quantity`); (3)
  that exact order (id, $6,900 total) appears in the admin orders list after
  logging in as the seeded admin — the FE-06 round-trip this task's DoD
  requires; (4) a missing required field (blank delivery address) returns a
  422 with a clear message, not a silent failure; (5) an unknown/missing
  `productId` on `/checkout` shows a clear "no longer available" state
  instead of crashing; (6) `/order-confirmation` with no `orderId` shows a
  clear empty state. Seed data was cleaned up (cascading tenant delete) and
  all test servers stopped afterward.

---

## Phase 4 — Multi-Tenant Routing

### FE-12: Wildcard middleware + tenant resolution ✅
**Depends on:** FE-10, backend BE-05 (`/internal/tenant-lookup`)
**Suggested agent:** Claude Code — this is the frontend half of the most security-sensitive mechanism in the system, don't delegate it casually
**Files:** `apps/storefront/middleware.ts`

**Description:** Middleware reads the `Host` header, calls `/internal/tenant-lookup`, rewrites the request to render the correct tenant's storefront with the correct theme. Replace the FE-10 hardcoded tenant with this real resolution.

**Constraints:**
- **Non-negotiable, restated:** the resolved tenant context comes only from this middleware's server-side resolution of the verified `Host` header — never from a client-settable value.
- Cache the tenant lookup (even a simple in-memory/edge cache) so every single page request doesn't hit the backend fresh — but make sure the cache respects `is_active` going false reasonably quickly (don't cache "active" status for hours).

**Definition of done:**
- [x] Two different subdomains pointed at local dev resolve to two different tenants' data and themes correctly
- [x] An inactive tenant's subdomain shows an appropriate "store unavailable" page, not a broken render or someone else's data

**Notes (2026-09-18):** Kept the `middleware.ts` file name/convention rather
than migrating to Next 16's renamed `proxy.ts` — same reasoning FE-04 already
recorded for `apps/admin`: functionally identical, deprecated but not
removed, and the task explicitly names `middleware.ts`.

- `packages/api-client` gained an `internal` resource group
  (`internal.tenantLookup`) mirroring `GET /internal/tenant-lookup` exactly,
  including the `X-Internal-Secret` header — this keeps the non-negotiable
  "only place frontend code makes HTTP calls" rule intact even for a
  server-to-server call made from middleware, not a page.
- **`x-storepulse-tenant-id`/`-category`/`-theme` are set once, only in
  `middleware.ts`, via `NextResponse.next({ request: { headers } })`** —
  `new Headers(request.headers)` starts from the *incoming* request, so any
  client-supplied value of these header names is unconditionally overwritten
  before the request reaches a page; there is no code path that merges a
  client value in. `lib/tenant.ts`'s new `getResolvedTenantId()` is the only
  reader, via `next/headers`'s `headers()`.
- **Two-layer freshness, not just the cache TTL:** `lib/tenant-cache.ts`
  caches the middleware's own lookup for 30s (module-level `Map`, per
  server instance — acceptable per-instance staleness bound, true
  cross-instance consistency is BE-28/Redis's job later). Independently,
  `loadStorefrontData()` (FE-10) calls the *live, uncached* backend for the
  actual product/business data on every request — so even during the 30s
  window where middleware still lets a since-suspended tenant's request
  through, the page-level fetch already 403s against the real backend and
  falls back to demo content (verified live, see below). No real tenant data
  is ever shown past the moment the backend itself reports suspension; the
  cache only bounds how long the *rewrite-to-`/store-suspended`* behavior
  lags, not how long stale data can leak.
- 403 (suspended) and 404/network-failure (unknown host or backend down) both
  rewrite (not redirect — the URL bar stays on the visited host) to two
  separate pages, `/store-suspended` and `/store-unavailable`, kept as
  distinct files for debugging but with deliberately near-identical generic
  copy — a visitor should not be able to tell "suspended" apart from "never
  existed," and neither page's copy or metadata names any real tenant.
- **Found and fixed a real data-shape bug while verifying live:** the root
  `layout.tsx` (FE-10) called `loadStorefrontData()` unconditionally for its
  `<title>`/theme, which — on the two fallback routes specifically, since
  `middleware.ts`'s matcher excludes them to avoid re-entering tenant
  resolution — fell through to the *demo* tenant's name ("Rupon Electronics")
  in the page `<title>`. Fixed by having the layout check
  `getResolvedTenantId()` first and use a generic "StorePulse" title/metadata
  when it's null, rather than ever substituting a demo (or any other)
  business's name on a page that isn't that business's storefront.
- Both apps' own `.gitignore` (`apps/{admin,mother,storefront}/.gitignore`,
  `create-next-app`'s stock `.env*` line) were silently excluding
  `.env.example` from git entirely — no app's example file had ever actually
  been committed, despite `AGENTS.md`/`CLAUDE.md` treating it as the
  documented-secrets checklist (the backend's own `.env.example` **is**
  committed). Added `!.env.example` to all three so this task's new
  `INTERNAL_API_SECRET` documentation (and the pre-existing
  `NEXT_PUBLIC_API_URL`/`STOREFRONT_DEMO_TENANT_ID` entries) actually reach
  git.
- **Verified live** against a real backend + real Postgres: seeded two active
  tenants (electronics, fashion — distinct `theme_config.primary_color` and
  category) plus one suspended tenant, then hit the running storefront dev
  server with `curl -H "Host: <subdomain>.storepulse.com"` for each (no real
  wildcard DNS needed locally — the `Host` header is all either the
  middleware or a real reverse proxy ever consults). Confirmed: (1) the two
  active subdomains render their own product name and `--storefront-primary`
  color, never each other's; (2) the suspended subdomain renders
  `/store-suspended`'s generic copy with no tenant name anywhere in the
  response, including metadata, after the fix above; (3) an unrecognized host
  renders `/store-unavailable`; (4) flipping the electronics tenant's
  `is_active` to `false` directly in Postgres (no cache invalidation call) was
  reflected — request-visible as the store-suspended page — within ~23
  seconds, inside the 30s cache design bound, and no real tenant data leaked
  during that window per the two-layer note above. Seed tenants were deleted
  and all test servers (backend + storefront dev server) stopped afterward.

---

### FE-13: Migrate remaining 4 templates into theme packages ✅
**Depends on:** FE-12
**Suggested agent:** Claude Code (split into 4 sub-tasks below, one per template, once the pattern from the first is established)
**Files:** `packages/themes/fashion/`, `packages/themes/beauty/`, `packages/themes/home-kitchen/`, `packages/themes/food/`

**Description:** Restructure the remaining 4 existing templates (Fashion, Beauty, Home & Kitchen, Food) the same way FE-10 restructured Electronics — as theme packages the storefront app selects by `tenant.category`, data-driven instead of hardcoded.

**Definition of done:**
- [x] All 5 categories work end-to-end: create a tenant with that category in the admin, and its storefront renders with the correct theme and real data

**Update (2026-09-28):** All 4 sub-tasks (FE-13a/b/c/d) now complete and
live-verified — see each sub-task's own notes below. `THEME_REGISTRY` in
`apps/storefront/lib/theme-registry.ts` now maps all 5 `TenantCategory`
values with a real package (`other` intentionally has none, falls back to
Electronics per that file's own docstring).

**Notes (2026-09-18):** No `packages/themes/` directory or theme-package
pattern actually existed before this — FE-10 built Electronics directly
inside `apps/storefront` (its own `components/`, no package boundary), so
there was nothing to literally copy for the first new theme. Before FE-13a,
retroactively extracted Electronics into `packages/themes/electronics/` and
built the actual pattern all 5 categories now follow, confirmed with the
user before proceeding (an unplanned but necessary prerequisite, not scope
creep — FE-13's own file list and DoD assume this package layout exists):

- Every theme package exports one `HomePage(props: StorefrontHomeProps)`
  (`{ info, product, isDemo }`, typed from `@storepulse/api-client`) as its
  sole entry point — `apps/storefront/lib/theme-registry.ts` is the *only*
  place that maps `tenant.category` to a package, and `app/page.tsx` calls
  the resolved `HomePage` directly as a function (not `<Theme .../>` — the
  React Compiler's `react-hooks/static-components` lint rule flags a
  registry-resolved capitalized variable rendered as JSX as "a component
  created during render"; calling it as a plain function sidesteps a false
  positive without disabling the rule).
- `other` and any category without a package yet fall back to Electronics's
  theme — a reasonable generic default until FE-13b/c/d land, rather than a
  broken or blank storefront for those categories.
- Each theme package needs `next`, `react`, `react-dom` as peer deps (not just
  `@storepulse/api-client`) — its components use `next/navigation`'s
  `useRouter` (for the order-panel's navigation into `/checkout`) even though
  the package itself isn't a Next app. Its own `eslint.config.mjs` also needs
  `eslint-config-next` wired in (mirroring the consuming app's config exactly)
  so `@next/next/no-img-element` disable-comments resolve instead of erroring
  as "unknown rule" when the package is linted standalone.
- Added `packages/themes/*` to `pnpm-workspace.yaml`'s glob — the existing
  `packages/*` only picks up direct children, not the nested
  `packages/themes/<category>` layout the task file's own file list specifies.
- Each theme package needs its own `@source` line in
  `apps/storefront/app/globals.css` (Tailwind v4's content scanner doesn't
  walk into sibling workspace packages on its own — the exact issue FE-02
  already found and fixed for `packages/ui`) and its own entry in
  `next.config.ts`'s `transpilePackages` (ships raw `.tsx`, no build step).
- **Verified via `pnpm typecheck && pnpm lint && pnpm build` for the whole
  workspace (all pass) only** at the time this note was written — Docker/Postgres
  was not available that session, so this task's actual Definition of Done
  (create a tenant with each category in the admin, confirm its storefront
  renders that category's theme with real data) was **not exercised live**,
  unlike FE-11/FE-12. **Update (2026-09-28, FE-13a task):** this live check
  has since been run for the two categories that exist so far (electronics,
  fashion) — see FE-13a's own notes below for the full verification. FE-13b/c/d
  still need the same live check once those packages are built.

---

### FE-13a: Fashion theme package ✅
**Depends on:** FE-13's Electronics extraction (above)
**Files:** `packages/themes/fashion/`

**Description:** Fashion's own visual identity — a light, editorial/lookbook
treatment deliberately opposite Electronics' dark theme (`bg-white text-black`
set on the theme's own root, not the shared `globals.css`, since light/dark is
a per-theme choice): a tall portrait hero instead of a square product shot,
serif-adjacent display type at wider tracking, sharp corners instead of
rounded. The underlying order logic (generic `options_schema`-driven inputs,
quantity stepper, navigation into `/checkout`) is unchanged from Electronics —
only `packages/themes/fashion/src/{product-hero,storefront-header,order-panel}.tsx`'s
markup/classes differ; no business logic was duplicated with a twist.

**Definition of done:**
- [x] A `fashion`-category tenant's storefront renders this theme with real backend data

**Notes (2026-09-28):** Live verification only — no code changed. Docker
Desktop was started (containers `storepulse-postgres-1`/`storepulse-redis-1`
came up healthy from a prior compose project already on disk), backend run
via the existing `.venv` against `.env`'s `postgresql+asyncpg://...@localhost:5433/storepulse`
(already migrated to head, `e4f59aaa19df`), confirming `uvicorn app.main:app`
live on `:8000`.

- Seeded two real tenants directly via the ORM (same pattern FE-11/FE-12 used
  — `Tenant`/`AdminUser`/`Product` rows, `hash_password` for the admin user):
  `fe13a-electronics` (`category=electronics`, `theme_config.primary_color=#0EA5E9`)
  and `fe13a-fashion` (`category=fashion`, `theme_config.primary_color=#DB2777`),
  each with one active product.
- **Real bug found in dev mode, not in the app's own code:** `pnpm dev --filter=storefront`
  (Turbopack dev server) 500s on every route — `next/font/google`'s Turbopack
  dev-mode font-file resolution fails ("next/font/google queries have exactly
  one entry" / can't resolve `@vercel/turbopack-next/internal/font/google/font`)
  regardless of host, even for `/store-unavailable`. This reproduces with
  internet connectivity confirmed working (`fonts.gstatic.com`/`fonts.googleapis.com`
  both reachable), so it isn't a network-block false negative — it's a
  Turbopack dev-server bug against this Next 16.3.5 pin, unrelated to any
  FE-13a code. `pnpm build --filter=storefront` (production Turbopack build,
  same bundler) compiles the identical `next/font/google` calls in
  `app/layout.tsx` cleanly, and `next start` serves them correctly — verified
  the live check against the production build/server instead. Flagging for
  FE-18 (CI) and anyone running `pnpm dev` on this app locally: if `/` 500s
  immediately with a font-resolution stack trace, it's this known dev-mode
  issue, not a regression — use `pnpm build && pnpm start --filter=storefront`
  to verify real rendering until it's tracked down.
- Verified via `curl -H "Host: <subdomain>.storepulse.com" http://localhost:3002/`
  against the running `next start` server (no real wildcard DNS needed, same
  as FE-12): (1) `fe13a-electronics.storepulse.com` renders the dark
  Electronics theme, `--storefront-primary:#0EA5E9`, title "FE13a Electronics
  Test", product "FE13a Test Headphones" at ৳4,500 — real DB `product.id` in
  the payload, not demo content; (2) `fe13a-fashion.storepulse.com` renders
  the light editorial Fashion theme (`bg-white text-black`, portrait 3/4 image
  ratio, uppercase tracked type, sharp corners — visibly distinct from
  Electronics, not a reskin), `--storefront-primary:#DB2777`, title "FE13a
  Fashion Test", product "FE13a Test Jacket" at ৳2,800; (3) an unrecognized
  host renders `/store-unavailable`'s generic copy, `--storefront-primary`
  falls back to the default `#2563eb`, no tenant name leaked anywhere
  including metadata; (4) flipping `fe13a-electronics.is_active` to `false`
  directly in Postgres was reflected as `/store-suspended`'s generic copy
  within the existing 30s middleware cache bound (confirmed the intermediate
  window independently fell back to FE-10's demo content, "Rupon Electronics,"
  rather than ever leaking the suspended tenant's real data — same two-layer
  freshness behavior FE-12 already documented). Seed tenants deleted
  (cascaded to their admin user + product) and both the backend and storefront
  processes stopped afterward; the temporary `apps/storefront/.env.local`
  created for this session was removed since none existed before.

---

### FE-13b: Beauty theme package ✅
**Depends on:** FE-13a (establishes the pattern)
**Files:** `packages/themes/beauty/`

**Description:** Beauty's own visual identity — warm and spa-like, deliberately
distinct from Electronics' dark spec-sheet theme and Fashion's sharp-cornered
editorial one: a cream (`#fdf8f4`) background, a circular product frame
(bottles/jars read naturally in a round crop, versus a square or tall
portrait shot), and pill/rounded-full controls throughout (buttons, inputs,
badges) instead of Electronics' `rounded-md`/`rounded-lg` or Fashion's sharp
corners. The underlying order logic (generic `options_schema`-driven inputs,
quantity stepper, navigation into `/checkout`) is unchanged from Electronics/
Fashion — only `packages/themes/beauty/src/{product-hero,storefront-header,order-panel}.tsx`'s
markup/classes differ; no business logic was duplicated with a twist.

**Definition of done:**
- [x] A `beauty`-category tenant's storefront renders this theme with real backend data

**Notes (2026-09-28):** Built by copying FE-13a's Fashion package structure
exactly (`package.json`/`tsconfig.json`/`eslint.config.mjs` identical apart
from the package name) and writing new `src/*.tsx` markup — no changes needed
to the pattern itself, confirming FE-13's own claim that the pattern
established by Electronics/Fashion generalizes cleanly.

- Registered in `apps/storefront/lib/theme-registry.ts` (`beauty:
  BeautyHomePage`), `next.config.ts`'s `transpilePackages`, `app/globals.css`'s
  `@source` list (Tailwind v4 doesn't walk into sibling workspace packages —
  same fix FE-02/FE-13 already established), and `apps/storefront/package.json`'s
  `dependencies` — every wiring point FE-13a's package needed, mirrored
  exactly. `pnpm-workspace.yaml`'s existing `packages/themes/*` glob already
  covered the new package, no change needed there.
- `pnpm typecheck`/`lint`/`build` all pass for the whole workspace (11/11,
  8/8, and 3/3 turbo tasks respectively) — including the two pre-existing
  "Pages directory cannot be found" lint warnings that Electronics/Fashion
  already emit (benign, not errors, same on this package).
- **Verified live**, same method FE-13a established: Docker Postgres/Redis
  (already running from FE-13a's session) + backend `uvicorn` + `packages/themes/beauty`
  seeded via one real `beauty`-category tenant (`fe13b-beauty`,
  `theme_config.primary_color=#C77D9C`) with one product ("FE13b Test Serum",
  ৳1,200), storefront built and served via `next start` (the known Turbopack
  dev-mode font bug FE-13a documented applies here too — used the production
  build/server, not `pnpm dev`). `curl -H "Host: fe13b-beauty.storepulse.com"`
  rendered the correct business name/product/price, `--storefront-primary:#C77D9C`,
  and confirmed Beauty's distinct markup actually reached the page
  (`bg-[#fdf8f4]`, `rounded-full` product frame/buttons/inputs, "Bestseller"
  badge) — not a reskin of an existing theme. Re-checked an unrecognized host
  still renders `/store-unavailable` correctly (no regression from the
  registry change). Seed tenant deleted (cascaded to its admin user +
  product), both processes stopped afterward, temporary `.env.local` removed.

---

### FE-13c: Home & Kitchen theme package ✅
**Depends on:** FE-13a
**Files:** `packages/themes/home-kitchen/`

**Description:** Home & Kitchen's own visual identity — a neutral off-white
(`#faf9f6`) "printed catalog" treatment: visible 2px black borders and sharp
corners on every card and the image frame, and a wide landscape (`aspect-video`)
product shot (furniture/kitchenware reads better in a room-scale frame than a
square, portrait, or circular crop) — distinct from Electronics (dark,
square), Fashion (borderless editorial), and Beauty (rounded-full, cream).
Same generic `options_schema`-driven order logic as every other theme; only
`packages/themes/home-kitchen/src/{product-hero,storefront-header,order-panel}.tsx`'s
markup/classes differ.

**Definition of done:**
- [x] A `home_kitchen`-category tenant's storefront renders this theme with real backend data

**Notes (2026-09-28):** Built by hand (not delegated), directly copying
FE-13b's Beauty package structure and reskinning — implemented alongside
FE-13d in the same session, with FE-13d delegated to a background subagent
(see FE-13d's own notes for that split) while this one and all shared
wiring/verification work were done directly.

- Registered in `apps/storefront/lib/theme-registry.ts` (`home_kitchen:
  HomeKitchenHomePage`), `next.config.ts`'s `transpilePackages`,
  `app/globals.css`'s `@source` list, and `apps/storefront/package.json`'s
  `dependencies` — same wiring points every prior theme package needed.
- `pnpm typecheck`/`lint`/`build` all pass for the whole workspace (13/13,
  10/10, 3/3 turbo tasks — run once covering both FE-13c and FE-13d together
  after both packages existed).
- **Verified live**, same method as FE-13a/b: seeded a real `home_kitchen`
  tenant (`fe13c-homekitchen`, `theme_config.primary_color=#B5652E`) with one
  product ("FE13c Test Cookware Set", ৳3,500), storefront built and served via
  `next start` (the Turbopack dev-mode font bug FE-13a documented still
  applies — used the production build/server). `curl -H "Host:
  fe13c-homekitchen.storepulse.com"` rendered the correct business name/
  product/price, `--storefront-primary:#B5652E`, and confirmed the theme's
  distinct markup actually reached the page (`bg-[#faf9f6]`, `border-2
  border-black/80`, `aspect-video` image frame, "In stock" badge) — not a
  reskin. Re-checked an unrecognized host still renders `/store-unavailable`
  correctly with all 5 themes now registered. Seed tenant deleted (cascaded),
  both processes stopped afterward, temporary `.env.local` removed.

---

### FE-13d: Food theme package ✅
**Depends on:** FE-13a
**Files:** `packages/themes/food/`

**Description:** Food's own visual identity — a warm cream-orange (`#fff8f0`)
"menu card" treatment: generously rounded (but not full-pill) corners
throughout, a wide 4:3 dish photo with a "Today's special" badge overlapping
its corner, price shown in a circular tag badge, and a dashed tan divider
separating the order-ticket panel's option fields from the quantity
stepper — distinct from Electronics (dark, square), Fashion (sharp-cornered
editorial), Beauty (rounded-full spa), and Home & Kitchen (hard-bordered
catalog). Same generic `options_schema`-driven order logic as every other
theme (no hardcoded "spice level" or similar); only
`packages/themes/food/src/{product-hero,storefront-header,order-panel}.tsx`'s
markup/classes differ.

**Definition of done:**
- [x] A `food`-category tenant's storefront renders this theme with real backend data

**Notes (2026-09-28):** Delegated to a background subagent (`claude` type)
running in parallel with FE-13c being built directly — both sub-tasks are
fully independent (separate files, no shared state) so there was no
correctness reason to serialize them; the subagent was scoped to *only*
create files under `packages/themes/food/`, explicitly forbidden from
touching `apps/storefront/*`, `pnpm-workspace.yaml`, or running
`pnpm install`/lint/typecheck/build itself, to avoid two processes racing on
the same shared files or `node_modules`. All wiring (theme-registry,
next.config.ts, globals.css, package.json), `pnpm install`, lint/typecheck/
build, and live verification were done directly afterward, in one pass
covering both FE-13c and FE-13d together.

- The subagent's output was read and verified file-by-file before wiring it
  in — `src/index.tsx`'s `StorefrontHomeProps` shape, `src/order-panel.tsx`'s
  business logic (generic `options_schema` handling, `missingRequired`
  validation, `/checkout` navigation), and `package.json`'s dependency shape
  all matched the established pattern exactly, and a directory listing
  confirmed it touched no file outside `packages/themes/food/`.
- Registered in `apps/storefront/lib/theme-registry.ts` (`food: FoodHomePage`),
  `next.config.ts`'s `transpilePackages`, `app/globals.css`'s `@source` list,
  and `apps/storefront/package.json`'s `dependencies`.
- **Verified live**, same method as every other theme package: seeded a real
  `food` tenant (`fe13d-food`, `theme_config.primary_color=#E0662C`) with one
  product ("FE13d Test Biryani", ৳350), storefront built and served via
  `next start`. `curl -H "Host: fe13d-food.storepulse.com"` rendered the
  correct business name/product/price, `--storefront-primary:#E0662C`, and
  confirmed the theme's distinct markup actually reached the page
  (`bg-[#fff8f0]`, `rounded-3xl`, "Today's special" badge, `border-dashed`
  divider) — not a reskin. Seed tenant deleted (cascaded), both processes
  stopped afterward, temporary `.env.local` removed.

---

## Phase 5 — Mother Site

### FE-14: Mother site homepage + template gallery + pricing ✅
**Depends on:** FE-02
**Suggested agent:** Copilot
**Files:** `apps/mother/app/page.tsx`, `apps/mother/app/templates/`, `apps/mother/app/pricing/`

**Description:** Marketing homepage, gallery linking to live demo storefronts per category, pricing page with the three tiers from `BUSINESS_PLAN.md` §6.

**Definition of done:**
- [x] Every pricing tier's feature list matches `FEATURE_SPECIFICATION.md` exactly — no invented features, no omitted ones

**Done 2026-09-28:** Built the full mother-site shell, not just the three listed routes — `apps/mother` was still the literal FE-01 placeholder (no nav/footer, no fonts, no marketing copy at all), so this task also had to establish the site's whole visual identity from scratch. Shipped:
- **Shared shell** (`packages/ui/src/components/site-header.tsx`, `site-footer.tsx`): wordmark, nav, scroll-aware header, animated mobile disclosure menu. Wired into `apps/mother/app/layout.tsx`. This is the first `packages/ui` component to depend on `next` (added as a peer dep) and `framer-motion` (added as a real dep) — both new to the package.
- **Design layer**: Space Grotesk + Inter via `next/font/google` (matches the pairing `apps/storefront` already established), plus mother-site-only accent/ink tokens layered on top of (not replacing) `@storepulse/config`'s shared brand scale — see `apps/mother/app/globals.css`.
- **Homepage** (`apps/mother/app/page.tsx`): hero with a bespoke animated SVG illustration, animated stat counters, staggered feature grid with hand-drawn icon accents, category teaser grid, an illustrative-quotes carousel (explicitly captioned "not an actual customer" per `FEATURE_SPECIFICATION.md`'s no-fabricated-testimonials rule), pricing summary, final CTA, contact band (WhatsApp + mailto).
- **`/templates`**: alternating-layout gallery of all 5 categories. Demo links are placeholder ("Preview coming soon") — the only demo tenants that exist are `storepulse_backend/scripts/seed_preview_tenants.py`'s local-dev-only fixtures (`*.localhost:3002`), not safe to hardcode into a public page. Revisit `apps/mother/lib/categories.ts` once real demo tenants are provisioned on production subdomains.
- **`/pricing`**: full 3-tier comparison via a new shared `PricingCard` (`packages/ui/src/components/pricing-card.tsx`, reusable by admin's future billing UI). Feature lists and prices are verbatim from `BUSINESS_PLAN.md` §6 — those figures are still flagged "directional, not final" there, so this page needs a copy update if/when they're finalized.
- **`/privacy`, `/terms`**: placeholder legal pages so footer links resolve — explicitly marked as drafts in-page, real legal copy is separate follow-up work, not written here.
- Reused: `Button`/`Card` primitives from `packages/ui` throughout; the admin login form's Zod/BFF form pattern is the template for any future contact/signup form (not yet built — that's FE-15's contact/signup work).
- Verified: `pnpm lint && pnpm typecheck && pnpm build --filter=mother` clean; confirmed `apps/admin` still builds after `packages/ui`'s new peer deps. Visually verified via Playwright screenshots at desktop (1440px) and mobile (390px) widths, including the mobile nav open state and a full scroll-through of the homepage and `/templates` (their scroll-triggered reveal animations only fire once actually scrolled into view — expected `whileInView` behavior, not a bug, but worth knowing if a future automated screenshot tool captures a "blank" section by doing a `fullPage` capture without scrolling first).
- Not done here (left for FE-15 per the task's own dependency): the actual signup form/flow. CTAs already point at `/signup` and will resolve once FE-15 ships.

---

### FE-15: Signup flow ✅
**Depends on:** FE-14, backend BE-17 (billing/subscribe)
**Suggested agent:** Claude Code
**Files:** `apps/mother/app/signup/`

**Description:** Business name → category selection → subdomain choice (with availability check) → plan selection → account created, calling `POST /billing/subscribe`.

**Constraints:**
- Subdomain availability check must query the real `tenants` table (via a backend endpoint — add one if it doesn't exist yet, e.g. `GET /tenants/check-subdomain?value=`), not a client-side guess.

**Definition of done:**
- [x] Completing signup creates a working tenant that immediately appears correctly in FE-12's routing
- [x] Choosing an already-taken subdomain shows a clear error before submission, not after

**Notes (2026-09-28):** Backend task ID correction: BE-17 is unrelated (inbox
conversation lifecycle) — the real dependency is BE-12 (`POST /billing/subscribe`),
already merged.

- **This task's own claim that the subdomain-check endpoint "already exists
  server-side" was false** — verified against the live backend before
  building anything: no `tenants` router existed, `/billing/subscribe`'s own
  409 was the only check, and it's a mutating call (can't be used for a
  before-submit check). Added `GET /billing/check-subdomain` to
  `storepulse_backend` (`app/routers/billing.py`, `app/schemas/subscription.py`,
  `app/services/billing.py`) — a read-only check sharing its reserved-word
  set and DB lookup with `create_tenant_with_subscription` via a new
  `check_subdomain_availability()` helper, so the pre-submit check and the
  final create can never disagree. 5 new backend tests
  (`tests/test_billing.py`), all passing against real Postgres.
- **Found and fixed a much larger pre-existing bug while live-verifying this
  task's own DoD, unrelated to signup itself:** `app/routers/settings.py` and
  `app/routers/tenants.py` (FE-09's `/admin/settings` and FE-10's
  `GET /tenants/{tenant_id}/storefront-info`) existed only as orphaned
  compiled `__pycache__` bytecode — the actual `.py` source was missing from
  the repo and neither router was imported in `main.py`, despite FE-09/FE-10's
  own task notes claiming both were built and live-verified. Practical effect:
  **every tenant's storefront**, not just newly-signed-up ones, was silently
  rendering demo fallback content (`loadStorefrontData()` catches the 404 and
  falls back — see FE-10's notes), and the admin settings page was entirely
  non-functional. Rebuilt both routers from the already-shipped frontend
  contracts (`TenantSettingsRead`/`Update`, `TenantStorefrontInfo` in
  `packages/api-client`) and existing conventions (`products.py`'s public-read
  shape, `dashboard.py`'s `TenantAdmin`-scoped shape), registered them in
  `app/main.py`, and added `tests/test_tenants.py` +
  `tests/test_settings.py` (12 tests: happy path, tenant isolation via a
  forged `X-Tenant-Id`, 404/403, subdomain-immutability, logo/theme-color
  merge-not-clobber). Full suite: 209 passed (was 197 before this session;
  +12 new, 0 regressed) — the only failures are 9 pre-existing environment-
  config mismatches (`STOREFRONT_BASE_DOMAIN=localhost` locally vs.
  `storepulse.com` hardcoded in `test_tenant_isolation.py`/
  `test_phase12_hardening.py`), confirmed present on a clean `main` checkout
  before any of this session's changes, unrelated to FE-15.
- `packages/api-client` gained a `billing` resource group (`subscribe`,
  `checkSubdomain`) and `types/billing.ts`, following FE-03's
  resource/types/facade split; reused the existing `TenantCategory` from
  `types/settings.ts` rather than redefining it.
- `apps/mother` had never made a server-to-server call before this — added
  `lib/api.ts`'s `publicApiClient()` (unauthenticated, mirrors
  `apps/admin/lib/api.ts`'s `apiClientFor(token)`), `app/api/signup/route.ts`
  and `app/api/signup/check-subdomain/route.ts` as BFF routes (mirrors
  `apps/admin/app/api/auth/login/route.ts` — the closest existing template,
  since signup is likewise unauthenticated), so the browser never calls the
  FastAPI backend directly, same as every other form in this repo.
- `app/signup/signup-wizard.tsx` — a plain-`useState` step machine (no wizard
  library exists in the monorepo yet; consistent with the codebase's
  no-form-library convention). Business name → category (same
  value/label array + `z.enum` as `apps/admin`'s settings-form, using the
  api-client `TenantCategory`, not `apps/mother/lib/categories.ts`'s
  marketing slugs, which diverge — `home-kitchen` vs `home_kitchen`, and it
  omits `other`) → subdomain (debounced live check against
  `/api/signup/check-subdomain`, Continue disabled until `available: true` —
  this is what satisfies "clear error before submission") → plan (reuses
  `PRICING_TIERS` from `apps/mother/lib/pricing.ts`, pre-selected from the
  existing `?plan=` query param FE-14's CTAs already send; `PricingCard` is
  `<Link>`-based so not reusable as an in-wizard selectable control, built a
  radio-style selection affordance instead) → review → submit.
- **Signup provisions the tenant only — no admin login credentials.**
  `POST /billing/subscribe` creates a `Tenant` + `Subscription`, nothing else
  (confirmed in `app/routers/billing.py`'s own docstring: "admin-user /
  credential provisioning is a separate concern"); there is no
  credential-creation endpoint anywhere in the backend. The success panel
  shows the new storefront URL and explicitly says admin access is a separate
  follow-up, rather than implying a working login exists. **Flagging as
  required follow-up work, not built here:** (1) a backend endpoint to create
  the tenant's first `AdminUser` + password during/after signup, (2) abuse
  protection on `POST /billing/subscribe` — it is public, unauthenticated,
  and completely unthrottled (no CAPTCHA/rate-limit), confirmed absent from
  both `BACKEND_TASKS.md` and the running code.
- **Verified live**, Docker/Postgres up: seeded via the real signup flow
  (not fixtures) — `POST /api/signup` with a fresh subdomain → `201`, the
  exact tenant then rendered correctly on `apps/storefront` via
  `curl -H "Host: <subdomain>.localhost"` (real business name in `<title>`,
  not demo fallback) — the literal FE-12-routing half of this task's DoD.
  Checked `/api/signup/check-subdomain` live for available/taken/reserved/
  invalid; confirmed a second signup attempt at the same subdomain 409s via
  the BFF route; confirmed a malformed payload 422s. Also re-ran the
  originally-planned `apps/mother`/`admin`/`storefront` `pnpm lint && pnpm
  typecheck && pnpm build` (forced, no cache) — 23/23 tasks clean across the
  whole workspace, confirming the shared `packages/api-client` change didn't
  break `admin` or `storefront`. All seeded/created tenants deleted and every
  dev server (backend + all three Next.js apps) stopped afterward; Docker
  Postgres/Redis left running as persistent local dev infra.

---

## Phase 6 — Unified Inbox UI

### FE-16: Admin inbox view
**Depends on:** FE-04, backend BE-14 (messages endpoint), BE-16 (AI suggestions)
**Suggested agent:** Claude Code
**Files:** `apps/admin/app/(dashboard)/inbox/`

**Description:** Thread list + conversation view pulling from `GET /admin/messages`, "create order from chat" shortcut linking into FE-06/FE-07, AI suggestion shown with an explicit approve-and-send button.

**Constraints:**
- **Non-negotiable, restated for the UI specifically:** the AI suggestion is always rendered as a *draft in an editable text field*, never auto-sent, never sent via a single ambiguous click that could be mistaken for something else. The send action must be unambiguous.

**Definition of done:**
- [ ] Approving and sending a suggestion actually sends it via Chatwoot and is indistinguishable in the thread from a manually-typed reply
- [ ] Never sends without the explicit approve action, verified by test

---

## Phase 7 — Payments UI

### FE-17: SSLCommerz checkout integration
**Depends on:** FE-11, backend BE-09
**Suggested agent:** Copilot
**Files:** `apps/storefront/app/checkout/` (extend)

**Description:** Add the SSLCommerz redirect flow as a checkout option alongside COD.

**Definition of done:**
- [ ] Successful payment returns to the confirmation page with correct order status
- [ ] Cancelled/failed payment returns to checkout with a clear message, order not falsely marked paid

---

## Phase 8 — Polish

### FE-18: CI workflows ✅
**Depends on:** FE-01
**Suggested agent:** Claude Code
**Files:** `.github/workflows/`

**Description:** Lint, typecheck, build for all three apps on every PR.

**Definition of done:**
- [x] A PR that breaks any single app's build fails CI without needing to touch the other two apps

**Notes (2026-09-28):** Single `.github/workflows/ci.yml`, one `check` job
matrixed over the three apps (`fail-fast: false`) rather than three separate
workflow files or one monolithic job — each matrix entry is its own GitHub
check (`check (admin)`, `check (mother)`, `check (storefront)`), which is
what actually satisfies the DoD's "fails CI without needing to touch the
other two apps": a red `admin` check leaves `mother`/`storefront` green and
independently reportable, not blocked or bundled into one pass/fail.

- Each matrix job runs `pnpm exec turbo run {lint,typecheck,build} --filter=<app>...`
  — the trailing `...` scopes the run to that app plus its actual workspace
  dependency graph (e.g. `storefront...` pulls in `@storepulse/api-client`
  and all 5 `@storepulse/theme-*` packages via `pnpm --filter`'s dependency
  syntax, confirmed via `turbo run build --filter=storefront... --dry-run=json`)
  rather than the whole monorepo — so a `packages/ui`-only change still
  correctly fails `admin`/`mother`'s jobs (both depend on it) while leaving
  `storefront` untouched, and vice versa.
- `pnpm/action-setup@v4` + `actions/setup-node@v4` with `cache: pnpm` (needs
  pnpm on PATH first, hence that ordering) pinned to Node 20 per root
  `package.json`'s `engines.node: ">=20"`; `pnpm install --frozen-lockfile`
  since `pnpm-lock.yaml` is committed — CI must never silently resolve a
  different dependency tree than what's checked in.
- `concurrency` with `cancel-in-progress: true` on `ci-CI-<ref>` so a rapid
  sequence of pushes to the same PR/branch doesn't queue up stale, already-
  superseded runs.
- Triggers on `pull_request` (any base) and `push` to `main` — no push
  trigger on arbitrary branches, matching how this repo actually works (PRs
  into `main`), and avoiding double-running the same commit's checks once as
  a branch push and again as a PR.
- **Verified the actual failure-isolation claim, not just that the YAML
  looks plausible:** ran `pnpm exec turbo run lint typecheck build
  --filter=<app>...` locally for all three apps (all pass, matching what the
  workflow's steps run), then deliberately introduced a real type error
  (`const x: string = 12345`) in a throwaway `apps/admin/app/__ci-test-break.ts`
  file and reran all three filters — `admin`'s run failed with the exact
  `TS2322` error and a non-zero exit code, while `mother`'s and
  `storefront`'s runs both still passed, unaffected (proving the matrix
  filters are genuinely isolated per app, not just isolated in the YAML's
  structure). Deleted the test file immediately after and confirmed `admin`
  builds clean again; `git status` confirmed no leftover changes from the
  test. Could not trigger an actual GitHub Actions run (that needs a real
  push/PR against the `origin` remote, out of scope to do unprompted) — the
  workflow YAML itself was checked by hand for indentation/structure
  correctness (no tabs, no trailing whitespace, matches standard matrix
  syntax) since no YAML linter was available in this environment.

---

### FE-19: Facebook Pixel / Conversions API
**Depends on:** FE-11
**Suggested agent:** Copilot
**Files:** `apps/storefront/`

**Description:** Server-side Conversions API event on order confirmation, not just a client-side pixel (client-side-only tracking is increasingly unreliable and is explicitly called out as a gap in `FEATURE_SPECIFICATION.md`).

**Definition of done:**
- [ ] A test order triggers a verifiable server-side conversion event

---

**✅ Final review checkpoint (Gemini CLI):** Full-repo audit. Ask it to check every app for any direct `fetch()` bypassing `packages/api-client`, and to confirm no AI provider key or call exists anywhere in frontend code.
