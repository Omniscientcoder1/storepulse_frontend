import type { ProductPublic, TenantStorefrontInfo } from "@storepulse/api-client";

/**
 * Fallback/demo content — used only when `STOREFRONT_DEMO_TENANT_ID` is unset
 * or the backend call fails, so the page always has something real-looking to
 * render (a fresh clone with no `.env.local` still shows a working page, and
 * an outage degrades gracefully instead of the page crashing). This is a
 * fallback path, not the real data path — real data comes from
 * `packages/api-client` (see `app/page.tsx`).
 */
export const DEMO_STOREFRONT_INFO: TenantStorefrontInfo = {
  business_name: "Rupon Electronics",
  category: "electronics",
  theme_config: { primary_color: "#2563EB" },
  logo_url: null,
};

export const DEMO_PRODUCT: ProductPublic = {
  id: "demo-product",
  name: "SoundCore Q30 Wireless Headphones",
  description:
    "Active noise cancelling, 40-hour battery, and a fold-flat design built for the daily commute across Dhaka traffic.",
  base_price: "3450.00",
  images: [],
  options_schema: [
    { name: "Color", type: "select", choices: ["Black", "Navy", "White"], required: true },
    { name: "Warranty", type: "select", choices: ["6 months", "12 months"], required: true },
  ],
};
