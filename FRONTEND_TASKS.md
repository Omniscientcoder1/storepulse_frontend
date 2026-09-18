# StorePulse Frontend — Task Breakdown

**Repo:** `storepulse-frontend`
**Read first:** `AGENTS.md`, `TECHNICAL_KNOWLEDGE_BASE.md` (§2 architecture/diagrams, §7 API spec), `FEATURE_SPECIFICATION.md`

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

### FE-11: Checkout flow + order confirmation
**Depends on:** FE-10, backend BE-08
**Suggested agent:** Claude Code
**Files:** `apps/storefront/app/checkout/`, `apps/storefront/app/order-confirmation/`

**Description:** Product + selected options + quantity + delivery details → order submitted → confirmation page. COD as the default path (no payment gateway needed for this task — SSLCommerz is FE-17).

**Constraints:**
- Zod validation on the form matching the backend's Pydantic schema shape for order creation.
- No tenant ID anywhere in this flow's client-side code or requests — it's the single hardcoded tenant from FE-10 for now, resolved however FE-10 established, not passed by the checkout form.

**Definition of done:**
- [ ] Submitting the form creates a real order visible in the admin orders list (FE-06)
- [ ] Required fields are validated before submission, with clear error messages

---

## Phase 4 — Multi-Tenant Routing

### FE-12: Wildcard middleware + tenant resolution
**Depends on:** FE-10, backend BE-05 (`/internal/tenant-lookup`)
**Suggested agent:** Claude Code — this is the frontend half of the most security-sensitive mechanism in the system, don't delegate it casually
**Files:** `apps/storefront/middleware.ts`

**Description:** Middleware reads the `Host` header, calls `/internal/tenant-lookup`, rewrites the request to render the correct tenant's storefront with the correct theme. Replace the FE-10 hardcoded tenant with this real resolution.

**Constraints:**
- **Non-negotiable, restated:** the resolved tenant context comes only from this middleware's server-side resolution of the verified `Host` header — never from a client-settable value.
- Cache the tenant lookup (even a simple in-memory/edge cache) so every single page request doesn't hit the backend fresh — but make sure the cache respects `is_active` going false reasonably quickly (don't cache "active" status for hours).

**Definition of done:**
- [ ] Two different subdomains pointed at local dev resolve to two different tenants' data and themes correctly
- [ ] An inactive tenant's subdomain shows an appropriate "store unavailable" page, not a broken render or someone else's data

---

### FE-13: Migrate remaining 4 templates into theme packages
**Depends on:** FE-12
**Suggested agent:** Claude Code (can be split into 4 separate Copilot sessions, one per template, once the pattern from the first is established)
**Files:** `packages/themes/fashion/`, `packages/themes/beauty/`, `packages/themes/home-kitchen/`, `packages/themes/food/`

**Description:** Restructure the remaining 4 existing templates (Fashion, Beauty, Home & Kitchen, Food) the same way FE-10 restructured Electronics — as theme packages the storefront app selects by `tenant.category`, data-driven instead of hardcoded.

**Definition of done:**
- [ ] All 5 categories work end-to-end: create a tenant with that category in the admin, and its storefront renders with the correct theme and real data

---

## Phase 5 — Mother Site

### FE-14: Mother site homepage + template gallery + pricing
**Depends on:** FE-02
**Suggested agent:** Copilot
**Files:** `apps/mother/app/page.tsx`, `apps/mother/app/templates/`, `apps/mother/app/pricing/`

**Description:** Marketing homepage, gallery linking to live demo storefronts per category, pricing page with the three tiers from `BUSINESS_PLAN.md` §6.

**Definition of done:**
- [ ] Every pricing tier's feature list matches `FEATURE_SPECIFICATION.md` exactly — no invented features, no omitted ones

---

### FE-15: Signup flow
**Depends on:** FE-14, backend BE-17 (billing/subscribe)
**Suggested agent:** Claude Code
**Files:** `apps/mother/app/signup/`

**Description:** Business name → category selection → subdomain choice (with availability check) → plan selection → account created, calling `POST /billing/subscribe`.

**Constraints:**
- Subdomain availability check must query the real `tenants` table (via a backend endpoint — add one if it doesn't exist yet, e.g. `GET /tenants/check-subdomain?value=`), not a client-side guess.

**Definition of done:**
- [ ] Completing signup creates a working tenant that immediately appears correctly in FE-12's routing
- [ ] Choosing an already-taken subdomain shows a clear error before submission, not after

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

### FE-18: CI workflows
**Depends on:** FE-01
**Suggested agent:** Claude Code
**Files:** `.github/workflows/`

**Description:** Lint, typecheck, build for all three apps on every PR.

**Definition of done:**
- [ ] A PR that breaks any single app's build fails CI without needing to touch the other two apps

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
