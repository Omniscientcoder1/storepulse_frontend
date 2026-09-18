"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import type { OrderRead } from "@storepulse/api-client";

/** Mirrors the backend's `StorefrontOrderCreate` field constraints. */
const formSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(255),
  customer_phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number is too long"),
  delivery_address: z.string().min(1, "Delivery address is required"),
  delivery_method: z.enum(["courier", "pickup"]),
  special_instructions: z.string().optional(),
});

export function CheckoutForm({
  productId,
  quantity,
  selectedOptions,
}: {
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string>;
}) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "pickup">("courier");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse({
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      delivery_method: deliveryMethod,
      special_instructions: specialInstructions || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form for errors");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: parsed.data.customer_name,
          customer_phone: parsed.data.customer_phone,
          product_id: productId,
          quantity,
          selected_options: selectedOptions,
          delivery_address: parsed.data.delivery_address,
          delivery_method: parsed.data.delivery_method,
          special_instructions: parsed.data.special_instructions,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | OrderRead
        | { detail?: string }
        | null;

      if (!response.ok) {
        setError((body as { detail?: string } | null)?.detail ?? "Could not place the order");
        return;
      }

      const order = body as OrderRead;
      const params = new URLSearchParams({
        orderId: order.id,
        total: order.total_price,
      });
      router.push(`/order-confirmation?${params.toString()}`);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="customer_name" className="text-sm font-medium text-white/80">
          Full name
        </label>
        <input
          id="customer_name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="customer_phone" className="text-sm font-medium text-white/80">
          Phone number
        </label>
        <input
          id="customer_phone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="delivery_address" className="text-sm font-medium text-white/80">
          Delivery address
        </label>
        <textarea
          id="delivery_address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          rows={3}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
          required
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-white/80">Delivery method</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="delivery_method"
              checked={deliveryMethod === "courier"}
              onChange={() => setDeliveryMethod("courier")}
            />
            Courier delivery
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="delivery_method"
              checked={deliveryMethod === "pickup"}
              onChange={() => setDeliveryMethod("pickup")}
            />
            Store pickup
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="special_instructions" className="text-sm font-medium text-white/80">
          Notes <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id="special_instructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={2}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus-visible:border-[var(--storefront-primary)]"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--storefront-primary)" }}
      >
        {submitting ? "Placing order…" : "Place order — Cash on Delivery"}
      </button>
    </form>
  );
}
