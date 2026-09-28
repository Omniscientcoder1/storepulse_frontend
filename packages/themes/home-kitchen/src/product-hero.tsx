import type { ProductPublic } from "@storepulse/api-client";

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

/**
 * Home & Kitchen's catalog treatment: a wide landscape shot (furniture and
 * kitchenware read better in a room-scale frame than a square product shot
 * or a tall portrait one) with a bordered "spec card" underneath, echoing a
 * printed product catalog — same `ProductPublic` data, different visual
 * language per category than Electronics' square shot, Fashion's portrait
 * crop, or Beauty's circular frame.
 */
export function ProductHero({ product }: { product: ProductPublic }) {
  const image = product.images?.[0];

  return (
    <section className="flex flex-col gap-6">
      <div className="relative aspect-video overflow-hidden border-2 border-black/80 bg-black/5">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, tenant-supplied URLs; no next/image domain config for arbitrary tenant hosts yet.
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="size-16 rounded-sm opacity-20"
              style={{ background: "var(--storefront-primary)" }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 border-2 border-black/80 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col gap-2">
          <span
            className="w-fit border border-black/80 px-2 py-0.5 text-xs font-medium tracking-wide uppercase"
            style={{ color: "var(--storefront-primary)" }}
          >
            In stock
          </span>
          <h1 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-3xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="max-w-prose text-black/60">{product.description}</p>
          ) : null}
        </div>
        <p className="font-display text-3xl font-semibold tabular-nums">
          {formatPriceBdt(product.base_price)}
        </p>
      </div>
    </section>
  );
}
