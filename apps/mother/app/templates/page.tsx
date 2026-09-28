import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Templates",
  description: "Browse StorePulse's storefront templates for fashion, beauty, electronics, home & kitchen, and food businesses.",
};

export default function TemplatesPage() {
  return (
    <main>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            A template built for your business
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Every template ships with the layout, product cards, and checkout flow that fit your
            category — no design work required.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-16">
            {CATEGORIES.map((category, i) => (
              <Reveal key={category.slug} delay={i * 0.05}>
                <div
                  className={`grid items-center gap-8 md:grid-cols-2 ${
                    i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div
                    className="aspect-[4/3] rounded-2xl border border-border"
                    style={{
                      background: `linear-gradient(160deg, ${category.color}33, var(--color-ink-900))`,
                    }}
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="font-display text-2xl font-bold">{category.label}</h2>
                    <p className="mt-3 text-muted-foreground">{category.description}</p>
                    {category.demoUrl ? (
                      <a
                        href={category.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        View live demo →
                      </a>
                    ) : (
                      <span className="mt-5 inline-block text-sm font-medium text-muted-foreground">
                        Preview coming soon
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
