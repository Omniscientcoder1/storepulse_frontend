import type { ProductPublic } from "@storepulse/api-client";

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

export function ProductHero({ product }: { product: ProductPublic }) {
  const image = product.images?.[0];

  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, tenant-supplied URLs; no next/image domain config for arbitrary tenant hosts yet.
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="size-24 rounded-full opacity-20"
              style={{ background: "var(--storefront-primary)" }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-medium tracking-wide text-white/90 uppercase"
            style={{ background: "var(--storefront-primary)" }}
          >
            In stock
          </span>
          <h1 className="font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="max-w-prose text-white/70">{product.description}</p>
          ) : null}
        </div>

        <p className="font-display text-3xl font-semibold tabular-nums">
          {formatPriceBdt(product.base_price)}
        </p>
      </div>
    </section>
  );
}
