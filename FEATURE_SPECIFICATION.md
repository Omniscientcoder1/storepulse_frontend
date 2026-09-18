# StorePulse — Feature Specification

**Scope:** every customer-facing storefront (across all 5 category templates), the shared backend/admin dashboard, and the mother website. Each section is tiered MVP → Phase 2 → Phase 3, consistent with the phased build order in `TECHNICAL_KNOWLEDGE_BASE.md` §10 — ship the MVP tier, get paying tenants, then earn the right to build the rest.

This document supersedes and expands `TECHNICAL_KNOWLEDGE_BASE.md` §6 (that section now just points here).

---

## 1. Storefront (customer-facing, per tenant)

Applies to all 5 category templates (fashion, beauty, electronics, home & kitchen, food) unless marked category-specific. The 5 templates already built cover most of the MVP tier for a single-product landing-page format; extending to a full catalog format is noted where relevant.

### MVP

| Feature | Notes |
|---|---|
| Branded hero section | Business name/logo, product showcase, category-appropriate design (already built per template) |
| Product catalog / product detail view | Single-product (landing format) or multi-product (catalog format) depending on tenant plan/needs |
| Configurable product options | Size, color, flavor, spec — via `options_schema`, rendered as the right input type per category |
| Order / checkout flow | Product + options + quantity + delivery details → order submitted |
| WhatsApp click-to-chat CTA | Direct order via WhatsApp, alongside or instead of on-site checkout |
| COD payment option | No payment gateway required to launch a tenant |
| SSLCommerz online payment | Tenant-owned merchant account (Growth tier and above) |
| Trust signals | COD availability, delivery timeframe, replacement/warranty policy, "verified seller" badge |
| Mobile-first responsive layout | Sticky bottom CTA bar on mobile — this is where most traffic arrives (FB/IG ad clicks) |
| Order confirmation | On-screen confirmation + WhatsApp confirmation message |
| FAQ section | Editable by tenant in admin dashboard |
| Basic SEO | Meta title/description, OpenGraph tags for social link previews |
| Footer | Contact/WhatsApp link, "Powered by StorePulse" credit |

### Phase 2

| Feature | Notes |
|---|---|
| Discount code entry | Applied at checkout, tied to the discount engine in the admin dashboard |
| Product image gallery / zoom | Multiple images per product |
| Related/recommended products | Simple "same category" logic first, not ML-driven |
| Reviews/ratings display | Real customer reviews, not static demo testimonials |
| Embedded live chat widget | Chatwoot widget on the storefront itself, feeding the same unified inbox |
| Facebook Pixel / Conversions API | Critical for tenants running FB/IG ads — server-side tracking, not just client pixel |
| Bangla/English language toggle | Many buyers are more comfortable browsing in Bangla |
| Customer accounts (optional) | Order history, saved address — optional because COD/guest-checkout dominates in BD |
| Wishlist/favorites | Lower priority, common request once catalog-format tenants exist |

### Phase 3

| Feature | Notes |
|---|---|
| AI product recommendations | "Customers also bought" — needs enough order volume to be meaningful |
| AI chatbot on storefront | Answers FAQ automatically, escalates to human via the unified inbox when it can't |
| PWA installability | "Add to home screen" for repeat customers of a specific tenant |
| Subscription/recurring orders | Only relevant for tenants selling consumables |
| Loyalty/referral display | Tenant-facing feature, not core to launch |

---

## 2. Backend & Admin Dashboard

Shared by every tenant regardless of category. See `TECHNICAL_KNOWLEDGE_BASE.md` §5 (data model) and §7 (API spec) for the technical implementation of everything below.

### MVP

| Module | Features |
|---|---|
| **Dashboard/home** | Today's orders, revenue this month, low-stock alerts (if tracked), unread messages count |
| **Orders** | List/filter by status; create manual/draft order; edit order; status pipeline (draft → pending_payment → confirmed → shipped → delivered → cancelled) |
| **Products** | Create/edit with configurable options (size/color/spec/flavor); image upload; optional stock quantity; active/inactive toggle |
| **Customers** | List, search by phone/name; order history per customer; manual notes |
| **Payments** | Record payment (manual, COD, or SSLCommerz-verified); payment status per order |
| **Storefront settings** | Business name, category/template selection, logo, theme color, WhatsApp number, custom domain setup |
| **Staff/roles (basic)** | Owner + staff — full permission matrix is Phase 2 |
| **Data export** | CSV export of orders and customers — small to build, disproportionately valued by small business owners |

### Phase 2

| Module | Features |
|---|---|
| **Unified inbox** | Chatwoot-embedded view, FB Messenger + WhatsApp in one thread list, "create order from chat" shortcut |
| **AI reply suggestions** | Drafted reply shown to staff, never auto-sent |
| **Discounts** | Coupon codes, percentage/flat discounts, seasonal offers |
| **Shipping** | Basic flat-rate/zone-based rules, courier handoff notes |
| **Reports** | Revenue over time, best-selling products, repeat-customer rate |
| **Marketing** | Facebook/Instagram post scheduling assist, AI-generated product descriptions |
| **Notifications** | SMS/WhatsApp automated order-status updates to customers |
| **Full permission matrix** | Granular staff roles beyond owner/staff |
| **Onboarding checklist** | Guided setup inside the dashboard for newly signed-up tenants |

### Phase 3

| Module | Features |
|---|---|
| **AI SEO suggestions** | Meta description/keyword gap suggestions |
| **AI brand-identity starter kit** | Paid add-on — real per-generation cost, not free-tier |
| **Audit log** | Who changed what, when — matters more once staff accounts are common |
| **Natural-language analytics** | "Ask your dashboard a question" style reporting |
| **Category-specific optional modules** | e.g. appointment booking, made-to-order scheduling — built only when a paying tenant's category needs it |
| **Abandoned-order recovery** | Reminders for incomplete checkouts |

**Explicitly out of scope unless a real tenant need emerges:** multi-vendor marketplace, native mobile app (PWA covers this), loyalty points programs, multi-currency (BD-only for the foreseeable future).

---

## 3. Mother Website (storepulse.com)

Not yet detailed elsewhere in the docs — this is the first full spec for it.

### MVP

| Feature | Notes |
|---|---|
| Homepage | Value proposition, live links to demo storefronts per category, pricing summary |
| Template/category gallery | Showcases the 5 templates with live preview links |
| Pricing page | Starter/Growth/Pro tiers, clear feature comparison |
| Signup flow | Business name → category selection → subdomain choice → plan selection → account created |
| Login | Authenticates and redirects into the admin dashboard |
| Legal pages | Terms of Service, Privacy Policy — genuinely required once collecting payment/personal data |
| Contact/support | WhatsApp link + simple contact form |

### Phase 2

| Feature | Notes |
|---|---|
| Self-serve billing management | Upgrade/downgrade plan, view invoices, update payment method |
| Post-signup onboarding wizard | Guided first-run: connect WhatsApp, add first product, pick theme colors |
| Case studies/testimonials | Real tenant stories, once real tenants exist — don't fabricate these |
| Help center/documentation | Reduces founder support load as tenant count grows |
| Referral program page | Existing tenants referring new ones |

### Phase 3

| Feature | Notes |
|---|---|
| Bangla version of the marketing site | Broadens reach beyond English-comfortable segment |
| Affiliate/partner program | For agencies or freelancers reselling StorePulse setup services |
| Interactive pricing/ROI calculator | Marketing tool, not core function |
| Live chat on the mother site | Using StorePulse's own product on itself |
| Status page | Uptime transparency — worth it once tenants depend on the platform daily |

---

## How to use this document

When starting any new feature work, check which tier it falls under before building it. MVP tier only, until there are paying tenants. Resist pulling a Phase 2/3 feature forward because it seems easy or interesting — the discipline of shipping the minimum that gets a real business owner to pay and stay is the actual hard part of this build, not any individual feature.
