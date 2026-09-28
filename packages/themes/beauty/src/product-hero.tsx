import type { ProductPublic } from "@storepulse/api-client";

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

/**
 * Beauty's soft, spa-like treatment: a circular product frame (bottles/jars
 * read naturally in a round crop) on a warm cream field, versus Electronics'
 * square spec-sheet shot or Fashion's tall editorial portrait — same
 * `ProductPublic` data, different visual language per category.
 */
export function ProductHero({ product }: { product: ProductPublic }) {
  const image = product.images?.[0];

  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full bg-[var(--storefront-primary)]/10">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, tenant-supplied URLs; no next/image domain config for arbitrary tenant hosts yet.
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="size-24 rounded-full opacity-30"
              style={{ background: "var(--storefront-primary)" }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 text-center md:text-left">
        <span
          className="mx-auto w-fit rounded-full px-4 py-1 text-xs font-medium tracking-wide text-white md:mx-0"
          style={{ background: "var(--storefront-primary)" }}
        >
          Bestseller
        </span>
        <h1 className="font-display text-3xl leading-tight font-medium text-balance sm:text-4xl">
          {product.name}
        </h1>
        {product.description ? (
          <p className="mx-auto max-w-prose text-black/60 md:mx-0">{product.description}</p>
        ) : null}
        <p className="font-display text-3xl font-semibold tabular-nums">
          {formatPriceBdt(product.base_price)}
        </p>
      </div>
    </section>
  );
}
