import { OrderPanel } from "@/components/order-panel";
import { ProductHero } from "@/components/product-hero";
import { StorefrontHeader } from "@/components/storefront-header";
import { loadStorefrontData } from "@/lib/storefront-data";

export default async function Home() {
  const { info, product, isDemo } = await loadStorefrontData();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <StorefrontHeader info={info} />

      <main className="flex flex-1 flex-col gap-10 px-6 py-10 md:px-10">
        {isDemo ? (
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
            Showing demo content — set STOREFRONT_DEMO_TENANT_ID to preview real backend data.
          </p>
        ) : null}

        {product ? (
          <>
            <ProductHero product={product} />
            <OrderPanel product={product} />
          </>
        ) : (
          <p className="text-white/60">This store hasn&apos;t listed any products yet.</p>
        )}
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/40 md:px-10">
        Powered by StorePulse
      </footer>
    </div>
  );
}
