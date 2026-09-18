import type { ProductPublic } from "@storepulse/api-client";

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

/**
 * Fashion's editorial/lookbook treatment: a tall portrait image with the
 * product story overlaid below, versus Electronics' square product-shot +
 * spec-sheet layout — same `ProductPublic` data, different visual language
 * per category.
 */
export function ProductHero({ product }: { product: ProductPublic }) {
  const image = product.images?.[0];

  return (
    <section className="grid gap-8 md:grid-cols-5 md:items-start md:gap-12">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-black/5 md:col-span-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, tenant-supplied URLs; no next/image domain config for arbitrary tenant hosts yet.
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="size-20 rounded-full opacity-10"
              style={{ background: "var(--storefront-primary)" }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 md:col-span-2 md:pt-4">
        <span
          className="w-fit text-xs font-medium tracking-[0.2em] uppercase"
          style={{ color: "var(--storefront-primary)" }}
        >
          New arrival
        </span>
        <h1 className="font-display text-3xl leading-tight font-medium text-balance sm:text-4xl">
          {product.name}
        </h1>
        {product.description ? (
          <p className="max-w-prose text-black/60">{product.description}</p>
        ) : null}
        <p className="font-display text-2xl font-medium tabular-nums">
          {formatPriceBdt(product.base_price)}
        </p>
      </div>
    </section>
  );
}
