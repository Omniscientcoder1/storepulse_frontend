import Link from "next/link";

import { Button } from "@storepulse/ui/components/button";

import { Reveal } from "@/components/reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(500px circle at 50% 0%, var(--color-brand-600), transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your storefront can be live today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            Pick a template, connect your inbox, and start turning conversations into orders.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
