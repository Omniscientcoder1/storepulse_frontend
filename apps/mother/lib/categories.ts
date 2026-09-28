/**
 * The 5 storefront categories with a live theme package in
 * packages/themes/*. Single source of truth for the homepage teaser and the
 * /templates gallery so the two never drift out of sync.
 *
 * `demoUrl` is left null: the only demo tenants that exist today come from
 * storepulse_backend/scripts/seed_preview_tenants.py, a local-dev-only
 * fixture (`*.localhost:3002`, dev credentials) — not something safe to
 * hardcode into the public marketing site. Once real demo tenants are
 * provisioned on production subdomains, fill these in; until then the
 * gallery renders "Preview coming soon" instead of a dead/dev-only link.
 */
export type Category = {
  slug: string;
  label: string;
  description: string;
  color: string;
  demoUrl: string | null;
};

export const CATEGORIES: Category[] = [
  {
    slug: "fashion",
    label: "Fashion",
    description: "Lookbook-style product grids built for apparel and accessories.",
    color: "#ec4899",
    demoUrl: null,
  },
  {
    slug: "beauty",
    label: "Beauty",
    description: "Soft, editorial layouts for skincare and cosmetics brands.",
    color: "#a855f7",
    demoUrl: null,
  },
  {
    slug: "electronics",
    label: "Electronics",
    description: "Spec-forward product pages built for gadgets and devices.",
    color: "#3b82f6",
    demoUrl: null,
  },
  {
    slug: "home-kitchen",
    label: "Home & Kitchen",
    description: "Warm, lifestyle-driven presentation for home goods.",
    color: "#f97316",
    demoUrl: null,
  },
  {
    slug: "food",
    label: "Food",
    description: "Menu-style browsing built for food and grocery orders.",
    color: "#22c55e",
    demoUrl: null,
  },
];
