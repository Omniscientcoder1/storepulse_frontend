"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { ProductPublic } from "@storepulse/api-client";

/**
 * Food's "order ticket" treatment: the same generic `options_schema`-driven
 * form as every other theme's order panel (no food-specific special-casing —
 * options like size/spice/add-ons are just whatever the backend's
 * category-agnostic schema sends), reskinned as a rounded card with a warm
 * dashed divider before the quantity stepper, echoing an order slip rather
 * than Electronics' spec form, Fashion's minimal list, Beauty's pill
 * controls, or Home & Kitchen's hard-bordered card.
 */
export function OrderPanel({ product }: { product: ProductPublic }) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const missingRequired = useMemo(
    () =>
      product.options_schema
        .filter((option) => option.required && option.type === "select")
        .filter((option) => !selections[option.name]),
    [product.options_schema, selections],
  );

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-white/60 p-6 shadow-sm md:p-8">
      <h2 className="font-display text-lg font-bold">Build your order</h2>

      {product.options_schema.map((option) => (
        <div key={option.name} className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-black/70" htmlFor={`option-${option.name}`}>
            {option.name}
            {option.required ? <span className="text-black/40"> (required)</span> : null}
          </label>
          {option.type === "select" ? (
            <select
              id={`option-${option.name}`}
              className="rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
              value={selections[option.name] ?? ""}
              onChange={(event) =>
                setSelections((prev) => ({ ...prev, [option.name]: event.target.value }))
              }
            >
              <option value="" disabled>
                Choose {option.name.toLowerCase()}
              </option>
              {option.choices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`option-${option.name}`}
              type={option.type === "number" ? "number" : "text"}
              className="rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
              value={selections[option.name] ?? ""}
              onChange={(event) =>
                setSelections((prev) => ({ ...prev, [option.name]: event.target.value }))
              }
            />
          )}
        </div>
      ))}

      <div className="border-t-2 border-dashed border-[#e8dcc8] pt-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-black/70" htmlFor="quantity">
            Quantity
          </label>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#e8dcc8] bg-white">
            <button
              type="button"
              className="px-4 py-2 text-lg leading-none text-black/60 hover:text-black"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span id="quantity" className="w-6 text-center text-sm tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              className="px-4 py-2 text-lg leading-none text-black/60 hover:text-black"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={missingRequired.length > 0}
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--storefront-primary)" }}
        onClick={() => {
          const params = new URLSearchParams({
            productId: product.id,
            quantity: String(quantity),
          });
          if (Object.keys(selections).length > 0) {
            params.set("options", JSON.stringify(selections));
          }
          router.push(`/checkout?${params.toString()}`);
        }}
      >
        Order now — Cash on Delivery
      </button>
      {missingRequired.length > 0 ? (
        <p className="text-center text-xs text-black/50">
          Select {missingRequired.map((option) => option.name.toLowerCase()).join(", ")} to continue.
        </p>
      ) : null}
    </section>
  );
}
