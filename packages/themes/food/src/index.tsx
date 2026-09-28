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
 * Food's warm "menu card" treatment — a soft cream-orange field with
 * generously rounded (but not full-pill) corners on every card, dashed
 * dividers, and a circular price tag, evoking a restaurant menu or delivery
 * app. Distinct from Electronics' dark spec-sheet layout, Fashion's sharp-
 * cornered editorial one, Beauty's rounded-full spa palette, and Home &
 * Kitchen's hard-bordered catalog look. `bg-[#fff8f0] text-black` is applied
 * on this component's own root rather than in `apps/storefront`'s shared
 * `globals.css`, since background/palette is a per-theme visual choice, not
 * something every category should share.
 */
export function HomePage({ info, product, isDemo }: StorefrontHomeProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col bg-[#fff8f0] text-black">
      <StorefrontHeader info={info} />

      <main className="flex flex-1 flex-col gap-10 px-6 py-10 md:px-10">
        {isDemo ? (
          <p className="rounded-2xl border border-amber-600/30 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
            Showing demo content — set STOREFRONT_DEMO_TENANT_ID to preview real backend data.
          </p>
        ) : null}

        {product ? (
          <>
            <ProductHero product={product} />
            <OrderPanel product={product} />
          </>
        ) : (
          <p className="text-center text-black/60">Nothing&apos;s on the menu here yet.</p>
        )}
      </main>

      <footer className="border-t-2 border-dashed border-[#e8dcc8] px-6 py-6 text-center text-xs tracking-wide text-black/40 md:px-10">
        Powered by StorePulse
      </footer>
    </div>
  );
}
