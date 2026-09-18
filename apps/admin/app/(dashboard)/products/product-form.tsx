"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import type { OptionDefinition, ProductRead } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import { Input } from "@storepulse/ui/components/input";

import { OptionsEditor } from "./options-editor";

const optionSchema = z.object({
  name: z.string().min(1, "Every option needs a name"),
  type: z.enum(["select", "text", "number"]),
  choices: z.array(z.string()),
  required: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  base_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a price like 19.99"),
  stock_quantity: z.string().optional(),
  is_active: z.boolean(),
  options_schema: z.array(optionSchema).superRefine((options, ctx) => {
    options.forEach((opt, i) => {
      if (opt.type === "select" && opt.choices.filter((c) => c.trim()).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `"${opt.name || "Option " + (i + 1)}" needs at least one choice`,
          path: [i, "choices"],
        });
      }
    });
  }),
});

export function ProductForm({ product }: { product?: ProductRead }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(product?.base_price ?? "");
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity != null ? String(product.stock_quantity) : "",
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [options, setOptions] = useState<OptionDefinition[]>(product?.options_schema ?? []);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse({
      name,
      description: description || undefined,
      base_price: basePrice,
      stock_quantity: stockQuantity || undefined,
      is_active: isActive,
      options_schema: options.map((o) => ({
        ...o,
        choices: o.choices.filter((c) => c.trim().length > 0),
      })),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          base_price: parsed.data.base_price,
          stock_quantity:
            parsed.data.stock_quantity !== undefined
              ? Number(parsed.data.stock_quantity)
              : null,
          is_active: parsed.data.is_active,
          options_schema: parsed.data.options_schema,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(body?.detail ?? "Could not save the product");
        return;
      }

      const saved = (await response.json()) as ProductRead;
      router.push(`/products/${saved.id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="base_price" className="text-sm font-medium">
            Base price
          </label>
          <Input
            id="base_price"
            inputMode="decimal"
            placeholder="19.99"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock_quantity" className="text-sm font-medium">
            Stock quantity <span className="text-muted-foreground">(blank = untracked)</span>
          </label>
          <Input
            id="stock_quantity"
            inputMode="numeric"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4"
          />
          Active (visible on the storefront)
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Options</span>
        <OptionsEditor options={options} onChange={setOptions} />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
