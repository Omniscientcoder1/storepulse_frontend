/**
 * Pricing tiers and feature lists — copied verbatim from BUSINESS_PLAN.md §6
 * and FEATURE_SPECIFICATION.md. FE-14's definition of done requires these to
 * match exactly: no invented features, no omitted ones. Figures are flagged
 * "directional, not final" in BUSINESS_PLAN.md — this is the one place to
 * update them if they change.
 */
export type PricingTier = {
  slug: "starter" | "growth" | "pro";
  name: string;
  priceBdt: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    slug: "starter",
    name: "Starter",
    priceBdt: 1500,
    description: "Get a branded storefront live and start taking orders.",
    features: [
      "Branded storefront (choice of template)",
      "Product catalog",
      "Order form",
      "Manual / COD payment recording",
    ],
  },
  {
    slug: "growth",
    name: "Growth",
    priceBdt: 3000,
    description: "Bring your DMs and online payments into one place.",
    features: [
      "Everything in Starter",
      "Unified WhatsApp / Messenger inbox",
      "SSLCommerz online payment",
      "Basic discounts",
    ],
    highlighted: true,
  },
  {
    slug: "pro",
    name: "Pro",
    priceBdt: 5000,
    description: "Let AI handle the busywork, with you in control.",
    features: [
      "Everything in Growth",
      "AI reply suggestions",
      "AI product description generation",
      "Priority support",
    ],
  },
];
