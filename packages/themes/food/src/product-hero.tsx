import type { ProductPublic } from "@storepulse/api-client";

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

/**
 * Food's "menu card" treatment: a wide, generously rounded (but not
 * full-pill) dish photo with a "Today's special" badge overlapping its
 * corner, and the price rendered in a circular tag — evoking a restaurant
 * menu or delivery-app listing rather than Electronics' square spec shot,
 * Fashion's tall portrait crop, Beauty's circular bottle frame, or Home &
 * Kitchen's hard-bordered catalog card. Same `ProductPublic` data as every
 * other theme, different visual language.
 */
export function ProductHero({ product }: { product: ProductPublic }) {
  const image = product.images?.[0];

  return (
    <section className="flex flex-col gap-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--storefront-primary)]/10 shadow-sm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, tenant-supplied URLs; no next/image domain config for arbitrary tenant hosts yet.
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="size-20 rounded-2xl opacity-25"
              style={{ background: "var(--storefront-primary)" }}
            />
          </div>
        )}
        <span
          className="absolute top-4 left-4 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-md"
          style={{ background: "var(--storefront-primary)" }}
        >
          Today&apos;s special
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-white/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl leading-tight font-bold text-balance sm:text-3xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="max-w-prose text-black/60">{product.description}</p>
          ) : null}
        </div>
        <span
          className="flex size-20 shrink-0 items-center justify-center rounded-full text-center font-display text-base font-bold text-white shadow-md"
          style={{ background: "var(--storefront-primary)" }}
        >
          {formatPriceBdt(product.base_price)}
        </span>
      </div>
    </section>
  );
}
