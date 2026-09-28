import type { ProductPublic, TenantStorefrontInfo } from "@storepulse/api-client";

import { OrderPanel } from "./order-panel";
import { ProductHero } from "./product-hero";
import { StorefrontHeader } from "./storefront-header";

/** See `@storepulse/theme-electronics`'s `StorefrontHomeProps` docstring — every theme package implements this same contract. */
export interface StorefrontHomeProps {
  info: TenantStorefrontInfo;
  product: ProductPublic | null;
  isDemo: boolean;
}

/**
 * Home & Kitchen's catalog treatment — a neutral off-white field with visible
 * 2px black borders and sharp corners throughout (spec card, image frame,
 * buttons), reading like a printed product catalog. Deliberately distinct
 * from Electronics' dark theme, Fashion's borderless editorial layout, and
 * Beauty's soft rounded-full palette. `bg-[#faf9f6] text-black` is applied on
 * this component's own root rather than in `apps/storefront`'s shared
 * `globals.css`, since background/palette is a per-theme visual choice, not
 * something every category should share.
 */
export function HomePage({ info, product, isDemo }: StorefrontHomeProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col bg-[#faf9f6] text-black">
      <StorefrontHeader info={info} />

      <main className="flex flex-1 flex-col gap-8 px-6 py-10 md:px-10">
        {isDemo ? (
          <p className="border border-amber-600/40 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            Showing demo content — set STOREFRONT_DEMO_TENANT_ID to preview real backend data.
          </p>
        ) : null}

        {product ? (
          <>
            <ProductHero product={product} />
            <OrderPanel product={product} />
          </>
        ) : (
          <p className="text-black/60">This store hasn&apos;t listed any products yet.</p>
        )}
      </main>

      <footer className="border-t-2 border-black/80 px-6 py-6 text-center text-xs tracking-wide text-black/40 uppercase md:px-10">
        Powered by StorePulse
      </footer>
    </div>
  );
}
