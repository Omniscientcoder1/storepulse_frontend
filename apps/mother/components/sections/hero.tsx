"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@storepulse/ui/components/button";

import { DmToStoreIllustration } from "@/components/illustrations/dm-to-store";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(600px circle at 15% 20%, var(--color-brand-600), transparent 60%), radial-gradient(500px circle at 85% 80%, var(--color-accent-600), transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            Built for Bangladeshi sellers
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Turn your WhatsApp &amp; Facebook DMs into a real online store
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">
            StorePulse gives your business a branded storefront, an order dashboard, and one
            unified inbox for every DM — so nothing gets lost in the chat thread again.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <DmToStoreIllustration />
        </motion.div>
      </div>
    </section>
  );
}
