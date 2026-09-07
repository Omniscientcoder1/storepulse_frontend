# StorePulse — Business Plan

**Prepared for:** Founder-led planning and reference (not yet formatted for external investors/lenders — ask if you need a polished version for that)
**Target market:** Small-to-medium Bangladeshi businesses selling online — fashion, beauty, electronics, home & kitchen, food, and other categories
**Stage:** Pre-launch, pre-revenue

---

## 1. Executive Summary

StorePulse is a multi-tenant SaaS platform giving small-to-medium Bangladeshi businesses a branded online storefront, an order and inventory management admin dashboard, a unified WhatsApp/Facebook inbox, and AI-assisted customer replies and content — built as one shared backend serving many independently-branded frontends across multiple product categories.

The core insight the product is built around: 40% of Bangladeshi online shoppers discover products through social media, and 75% of transactions are still cash-on-delivery — meaning most small sellers' real business already happens in Facebook/WhatsApp chat threads, not on a website. StorePulse's differentiation is treating that chat thread as the product's center of gravity (unified inbox, AI-assisted replies) rather than bolting messaging onto a generic storefront as an afterthought, the way existing horizontal competitors do.

**What this plan is not:** a projection of rapid, VC-scale growth. This is a bootstrapped, solo-founder plan with a full-time job, teaching commitments, and a Master's thesis defense in December 2026 competing for time. Every projection below is built to be credible on that basis, not to look impressive.

---

## 2. Company Description

- **Founder:** Tahmidur, Software Developer at Bangladesh Finance PLC (full-stack, MERN/JavaScript, ~2 years professional experience), also teaches a cybersecurity course at BUP and is completing a Master's in Information Systems Security.
- **Structure:** currently unregistered; trade license and business entity registration are a near-term prerequisite (needed for Meta Tech Provider status, SSLCommerz merchant facilitation, and a business bank account).
- **Stage:** five category-specific landing page templates (fashion, beauty, electronics, home & kitchen, food) already built and verified in Next.js/Tailwind. Backend, admin dashboard, and multi-tenant engine not yet built — see `TECHNICAL_KNOWLEDGE_BASE.md`.

---

## 3. Market Analysis

### 3.1 Bangladesh e-commerce market size and shape

Bangladesh's e-commerce market generated an estimated $6–7 billion in revenue as of 2024–2025, growing at a double-digit annual rate, with projections toward $9–10 billion by the end of the decade. Within that market:

- **Electronics** is the largest category by revenue share (around 24%), though this segment is brand/spec-driven and dominated by large marketplaces (Daraz official stores, Pickaboo) — hard for small differentiated sellers to compete on alone.
- **Beauty/cosmetics** is the #1 category by shopper penetration (around 53%), sold primarily through social commerce to a majority-female buyer base.
- **Fashion/apparel** is the largest category by store count, reflecting how many small independent sellers operate in this space.
- Together, cosmetics, clothing, and electronics account for roughly 60% of online sales.
- **75% of transactions are cash-on-delivery**, and **40% of shoppers discover products via social media** — both direct validation of the unified-inbox, COD-first product design.

### 3.2 Why horizontal, and what that trade-off means

An earlier phase of this planning process considered specializing in a single niche (home bakeries) to avoid competing directly with existing horizontal players. The current direction is deliberately horizontal instead — serving multiple categories from day one, matching the five templates already built. This is a legitimate strategy, but it means differentiation cannot come from "nobody else serves this market" (several well-funded players already do); it has to come from product execution: the unified inbox, AI-assisted features, and template quality specifically.

### 3.3 Target customer profile

- Small-to-medium business owners across fashion, beauty, electronics, home & kitchen, and food categories, primarily in Dhaka initially, expanding to other divisions later.
- Currently taking orders via Facebook/Instagram DM and WhatsApp, often with no dedicated website, or a basic one with no real order-management system behind it.
- Price-sensitive (79% of Bangladeshi consumers prioritize low-cost products), so pricing and perceived value both matter for conversion.
- Likely to lack a formal trade license in many cases (relevant to payment-gateway onboarding — see §7).

---

## 4. Competitive Analysis

| Competitor | Description | How StorePulse differs |
|---|---|---|
| **Bitcommerz** | Bangladeshi no-code SaaS store builder for SMEs | Closest direct competitor; does not appear to lead with unified social-inbox integration |
| **ShopUp** | Funded startup combining logistics + software for small retailers | Much larger scale/funding; StorePulse competes on focus and responsiveness to social-commerce workflows, not on logistics infrastructure |
| **Bponi, PriyoShop** | General BD e-commerce platforms | Broad marketplace positioning rather than a dedicated per-seller branded storefront + admin tool |
| **Daraz, Chaldal** | Large structured marketplaces | Different model entirely — sellers list on the marketplace rather than owning their own branded storefront |
| **The real incumbent** | Manual Facebook/WhatsApp DM + notebook/spreadsheet order tracking | This is what most target customers actually use today — the pitch is time saved and orders not lost, not a feature checklist |

---

## 5. Product & Service Description

See `TECHNICAL_KNOWLEDGE_BASE.md` for full technical detail. In business terms, the product is:

- A branded storefront per seller, styled from one of several category-specific templates (fashion, beauty, electronics, home & kitchen, food — more added as demand indicates)
- An admin dashboard: order pipeline, product catalog with configurable options and optional stock tracking, customer records, payment tracking
- A unified WhatsApp + Facebook Messenger inbox (self-hosted Chatwoot under the hood)
- AI-drafted reply suggestions (human-approved before sending) and AI-assisted product descriptions

---

## 6. Business Model & Pricing

Subscription SaaS, tenant-owned payment collection (StorePulse never holds customer funds — see §7).

| Tier | Price (BDT/month) | Includes |
|---|---|---|
| **Starter** | 1,500 | Branded storefront (choice of template), product catalog, order form, manual/COD payment recording |
| **Growth** | 3,000 | Adds: unified WhatsApp/Messenger inbox, SSLCommerz online payment, basic discounts |
| **Pro** | 5,000 | Adds: AI reply suggestions, AI product description generation, priority support |

These figures are directional, not final — validate against real willingness-to-pay in early customer conversations. A one-time setup fee (suggested 500–1,000 BDT) is worth considering in addition to the monthly fee, both as revenue and as a filter for serious signups, given the real support load small non-technical sellers require regardless of self-serve tooling.

**Revenue streams beyond subscription (future, not MVP):**
- AI generation add-on packs for tenants who exceed included usage
- Optional annual billing discount (cash-flow benefit for the business)

---

## 7. Operations Plan

### 7.1 Payments

Tenant-owned SSLCommerz merchant accounts (money settles directly to the seller; StorePulse never pools funds — this avoids Bangladesh Bank payment-aggregator licensing requirements). Fallback: manual bKash personal-number payment + COD confirmation through the inbox, for sellers who can't get SSLCommerz merchant approval (commonly requires a trade license many small/informal sellers won't have).

### 7.2 Fulfillment

Not StorePulse's responsibility — sellers handle their own inventory, packing, and delivery/courier arrangements. StorePulse's job ends at "order confirmed correctly and payment recorded."

### 7.3 Support

At low tenant counts, founder-provided support via WhatsApp is more cost-effective than building extensive self-serve tooling (e.g., automated DNS diagnostics) prematurely.

---

## 8. Marketing & Sales Strategy

1. **Manual/concierge phase (first 5–10 customers):** direct outreach across personal network and category-relevant Facebook groups (fashion resellers, beauty sellers, electronics accessory sellers), using the existing 5 templates as ready-to-show demos.
2. **Organic phase:** referrals from early customers, presence in seller community Facebook groups per category, flagship storefronts built on StorePulse itself as live proof-of-concept per category.
3. **Paid phase (only after organic channels are exhausted and conversion data exists):** small, measured Facebook ad tests, category-targeted rather than broad "small business owner" targeting.

**Milestone, not a promise:** 5 paying customers within 3 months of starting outreach is the actual validation target — not large near-term tenant-count projections. Treat any larger number as upside, not a plan.

---

## 9. Financial Plan

### 9.1 One-time startup costs (estimates — verify exact government/registrar fees locally)

| Item | Estimated cost |
|---|---|
| Trade license / business registration | Varies by city corporation; budget 5,000–15,000 BDT and confirm locally |
| Domain (`.com` + `.com.bd`) | ~1,500–3,000 BDT/year combined |
| Business bank account | Typically free to open; minimum balance requirements vary by bank |
| **Total one-time (excluding founder's own time)** | **~10,000–20,000 BDT** |

### 9.2 Recurring monthly infrastructure costs

| Item | Monthly cost |
|---|---|
| VPS (Hetzner CX line, backend + Postgres + Chatwoot) | ~$13–15 (~1,600–1,800 BDT) |
| Vercel Pro (required once commercial, 1 seat) | $20 (~2,400 BDT) |
| Cloudflare (DNS/WAF) | Free tier sufficient initially |
| Object storage (Cloudflare R2) | Free tier sufficient initially (<10GB) |
| Monitoring (Sentry + UptimeRobot free tiers) | $0 initially |
| AI API usage | Usage-based; budget ~$10–30/month at low tenant counts, scales with active tenants using AI features |
| **Total baseline monthly burn** | **~$45–65/month (~5,500–7,800 BDT)** |

This is meaningfully higher than the very first "VPS-only" estimate from early planning, because Vercel Pro's commercial-use requirement is a real, non-optional cost the moment there's a single paying customer — not an optional upgrade.

### 9.3 Revenue projection (conservative, milestone-based rather than aggressive)

| Milestone | Tenants | Assumed average tier | MRR | Notes |
|---|---|---|---|---|
| Month 3 | 5 | Starter-weighted (~2,000 BDT avg) | 10,000 BDT | Validation target, not breakeven yet |
| Month 6 | 15 | Mixed (~2,500 BDT avg) | 37,500 BDT | Covers infra cost several times over |
| Month 12 | 40 | Mixed (~2,800 BDT avg) | 112,000 BDT | Realistic if organic + referral channels are working |
| Month 18 | 80 | Mixed (~3,000 BDT avg) | 240,000 BDT | Only pursue paid acquisition if this trajectory is on track |

**Breakeven on infrastructure cost alone:** roughly 3–4 Starter-tier customers. Breakeven on infrastructure is not the same as the business being worth the founder's time — that requires the Month 12+ trajectory to materialize.

### 9.4 What these projections deliberately exclude

- The founder's own labor cost/opportunity cost (this is a nights-and-weekends project alongside a full-time job)
- Any paid advertising spend (not budgeted until organic validation succeeds)
- Contractor/support hires (not planned until support load exceeds founder's available hours)

---

## 10. Risk Analysis

| Risk | Mitigation |
|---|---|
| Tenant data isolation bug (cross-tenant data leak) | Enforced tenant-scoping pattern + CI-blocking regression tests (see technical spec §8) |
| Meta API/policy changes affecting WhatsApp/Messenger integration | Built on Chatwoot (externally maintained) rather than a hand-rolled webhook pipeline; Embedded Signup v4 (not the soon-deprecated v2) |
| Payment onboarding friction for informal/unregistered sellers | bKash-manual + COD fallback path alongside SSLCommerz |
| Founder time scarcity (day job, teaching, thesis defense Dec 2026) | Heavy platform build phases deliberately scheduled around the thesis timeline; manual/concierge validation requires far less continuous time |
| Over-optimistic growth assumptions | This plan's projections are deliberately conservative; treat upside as upside, not the base case |
| **Horizontal positioning risk** | Competing directly with funded/established players (Bitcommerz, ShopUp, Bponi) rather than a defensible niche; mitigation is execution quality on the unified inbox and AI features, and category-template polish, not category exclusivity |
| Employer conflict-of-interest policy | Unresolved — confirm Bangladesh Finance PLC's outside-business-activity disclosure policy before scaling revenue |

---

## 11. Milestones & Roadmap

See `PROJECT_TRACKER.md` for the living, checkbox-level roadmap. At the business-plan level, the key milestones are:

1. Business name/domain finalized, trade license filed
2. First 5 paying pilot customers onboarded manually (any category, no platform yet)
3. MVP platform live (storefront + order management + product catalog) — see technical spec §10 for build order
4. Unified inbox + AI reply suggestions live
5. Self-serve signup on the mother site (removes founder from the onboarding critical path)
6. Reassess pricing and positioning at ~20 paying tenants

---

## 12. Appendix: Key Assumptions to Revisit

- Pricing tiers (§6) are directional; validate against actual willingness-to-pay in the first 5–10 customer conversations
- Trade license cost (§9.1) needs local confirmation — figure used is an estimate, not a verified government fee
- AI API cost assumption (§9.2) will need real usage data once the reply-suggestion feature is live
- The horizontal positioning (§3.2) trades a defensible niche for a larger addressable market — monitor early customer feedback for signs that a specific category is converting disproportionately well, which could justify leaning into it later without abandoning the others
