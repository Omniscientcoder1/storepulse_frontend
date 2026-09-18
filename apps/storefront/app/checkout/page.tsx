import Link from "next/link";

import { CheckoutForm } from "./checkout-form";
import { loadStorefrontData } from "@/lib/storefront-data";

export const metadata = {
  title: "Checkout",
};

function formatPriceBdt(basePrice: string): string {
  const value = Number(basePrice);
  if (Number.isNaN(value)) return basePrice;
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const rawQuantity = Array.isArray(params.quantity) ? params.quantity[0] : params.quantity;
  const rawOptions = Array.isArray(params.options) ? params.options[0] : params.options;

  const quantity = Math.max(1, Number.parseInt(rawQuantity ?? "1", 10) || 1);
  let selectedOptions: Record<string, string> = {};
  if (rawOptions) {
    try {
      selectedOptions = JSON.parse(rawOptions) as Record<string, string>;
    } catch {
      selectedOptions = {};
    }
  }

  const { product, isDemo } = await loadStorefrontData();

  if (!product || !productId || product.id !== productId) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold">This product is no longer available</h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to the storefront
        </Link>
      </div>
    );
  }

  const totalPrice = Number(product.base_price) * quantity;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-10 md:px-10">
      <div className="flex flex-col gap-1">
        <Link href="/" className="w-fit text-xs text-white/50 hover:text-white/80">
          &larr; Back to store
        </Link>
        <h1 className="font-display text-2xl font-semibold">Checkout</h1>
      </div>

      {isDemo ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          Showing demo content — set STOREFRONT_DEMO_TENANT_ID to check out against real backend data.
        </p>
      ) : null}

      <section className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{product.name}</span>
          {Object.keys(selectedOptions).length > 0 ? (
            <span className="text-sm text-white/50">
              {Object.entries(selectedOptions)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" · ")}
            </span>
          ) : null}
          <span className="text-sm text-white/50">Qty: {quantity}</span>
        </div>
        <span className="font-display text-lg font-semibold tabular-nums">
          {formatPriceBdt(String(totalPrice))}
        </span>
      </section>

      <CheckoutForm
        productId={product.id}
        quantity={quantity}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
