import Link from "next/link";

import { PricingCard } from "@storepulse/ui/components/pricing-card";

import { Reveal } from "@/components/reveal";
import { PRICING_TIERS } from "@/lib/pricing";

export function PricingSummary() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing, no surprises
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Start with the essentials and grow into the unified inbox and AI tools when you&rsquo;re
            ready.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <Reveal key={tier.slug} delay={i * 0.1}>
              <PricingCard
                name={tier.name}
                priceBdt={tier.priceBdt}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                href={`/signup?plan=${tier.slug}`}
              />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
            See full plan comparison →
          </Link>
        </p>
      </div>
    </section>
  );
}
