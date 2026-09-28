import type { Metadata } from "next";

import { PricingCard } from "@storepulse/ui/components/pricing-card";

import { Reveal } from "@/components/reveal";
import { PRICING_TIERS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "StorePulse pricing — Starter, Growth, and Pro plans for Bangladeshi small businesses.",
};

export default function PricingPage() {
  return (
    <main>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Plans that grow with your store
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Start with the essentials. Add the unified inbox and AI tools when you&rsquo;re ready
            to scale.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Prices are in BDT per month and may change as StorePulse grows. A one-time setup fee
            may apply — you&rsquo;ll see the final total before you subscribe.
          </p>
        </div>
      </section>
    </main>
  );
}
