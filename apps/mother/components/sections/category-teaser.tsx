"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { CATEGORIES } from "@/lib/categories";

export function CategoryTeaser() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            One template for every kind of business
          </h2>
          <Link href="/templates" className="text-sm font-medium text-primary hover:underline">
            Browse all templates →
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category, i) => (
            <Reveal key={category.slug} delay={i * 0.06}>
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                <Link
                  href="/templates"
                  className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-border p-4"
                  style={{
                    background: `linear-gradient(160deg, ${category.color}22, var(--color-ink-900))`,
                  }}
                >
                  <span
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(160deg, ${category.color}44, transparent)` }}
                    aria-hidden="true"
                  />
                  <span className="relative font-display text-lg font-semibold text-white">
                    {category.label}
                  </span>
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
