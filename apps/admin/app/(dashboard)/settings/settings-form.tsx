"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import type { TenantCategory, TenantSettingsRead } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import { Input } from "@storepulse/ui/components/input";

const CATEGORIES: { value: TenantCategory; label: string }[] = [
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "electronics", label: "Electronics" },
  { value: "home_kitchen", label: "Home & Kitchen" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  business_name: z.string().min(1, "Business name is required").max(255),
  category: z.enum(["fashion", "beauty", "electronics", "home_kitchen", "food", "other"]),
  logo_url: z.string().max(500).optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a hex color like #4F46E5")
    .optional()
    .or(z.literal("")),
  whatsapp_number: z.string().max(20).optional(),
  custom_domain: z.string().max(255).optional(),
});

export function SettingsForm({ settings }: { settings: TenantSettingsRead }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(settings.business_name);
  const [category, setCategory] = useState<TenantCategory>(settings.category);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(settings.theme_config.primary_color ?? "#4F46E5");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number ?? "");
  const [customDomain, setCustomDomain] = useState(settings.custom_domain ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const categoryChanged = category !== settings.category;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = formSchema.safeParse({
      business_name: businessName,
      category,
      logo_url: logoUrl || undefined,
      primary_color: primaryColor || undefined,
      whatsapp_number: whatsappNumber || undefined,
      custom_domain: customDomain || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: parsed.data.business_name,
          category: parsed.data.category,
          logo_url: parsed.data.logo_url ?? null,
          theme_config: { ...settings.theme_config, primary_color: parsed.data.primary_color },
          whatsapp_number: parsed.data.whatsapp_number ?? null,
          custom_domain: parsed.data.custom_domain ?? null,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(body?.detail ?? "Could not save settings");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subdomain" className="text-sm font-medium">
          Subdomain
        </label>
        <Input id="subdomain" value={settings.subdomain} disabled />
        <p className="text-xs text-muted-foreground">
          Your store&apos;s subdomain can&apos;t be changed after signup.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_name" className="text-sm font-medium">
          Business name
        </label>
        <Input
          id="business_name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TenantCategory)}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {categoryChanged ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Changing category doesn&apos;t update existing products&apos; option
            conventions or retheme your storefront automatically — review both
            after saving.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="logo_url" className="text-sm font-medium">
          Logo URL
        </label>
        <Input
          id="logo_url"
          placeholder="https://…"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Paste a hosted image URL — direct file upload isn&apos;t available yet.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="primary_color" className="text-sm font-medium">
          Theme color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(primaryColor) ? primaryColor : "#4F46E5"}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border"
            aria-label="Theme color picker"
          />
          <Input
            id="primary_color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#4F46E5"
            className="max-w-40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="whatsapp_number" className="text-sm font-medium">
          WhatsApp number
        </label>
        <Input
          id="whatsapp_number"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="e.g. 8801XXXXXXXXX"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom_domain" className="text-sm font-medium">
          Custom domain
        </label>
        <Input
          id="custom_domain"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="shop.yourbrand.com"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p> : null}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
