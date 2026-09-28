import { Check } from "lucide-react";
import Link from "next/link";

import { cn } from "../lib/utils";
import { Button } from "./button";

export function PricingCard({
  name,
  priceBdt,
  description,
  features,
  href,
  ctaLabel = "Get Started",
  highlighted = false,
  className,
}: {
  name: string;
  priceBdt: number;
  description: string;
  features: string[];
  href: string;
  ctaLabel?: string;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-8 transition-shadow",
        highlighted
          ? "border-primary bg-primary/[0.04] shadow-lg shadow-primary/10 md:-translate-y-3"
          : "border-border bg-card hover:shadow-md",
        className,
      )}
    >
      {highlighted ? (
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most popular
        </span>
      ) : null}

      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <p className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">৳{priceBdt.toLocaleString("en-US")}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button asChild className="mt-8" variant={highlighted ? "default" : "outline"}>
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
