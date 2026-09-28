"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/reveal";

/**
 * FEATURE_SPECIFICATION.md explicitly warns against fabricating testimonials
 * — StorePulse is pre-revenue with zero paying tenants. These quotes are
 * illustrative only, and every render carries a visible disclaimer; this is
 * a narrative device for the value prop, not a social-proof claim.
 */
const quotes = [
  {
    quote:
      "I used to lose orders scrolling back through a week of Messenger chats. Now every DM turns into an order I can actually track.",
    persona: "Illustrative example — boutique clothing seller",
  },
  {
    quote:
      "Customers pay however they want — cash on delivery or online — and I see it all in one place instead of three notebooks.",
    persona: "Illustrative example — home goods seller",
  },
  {
    quote:
      "The AI drafts a reply, I just check it and hit send. It's the difference between answering 10 DMs and 50.",
    persona: "Illustrative example — beauty products seller",
  },
];

export function TestimonialShowcase() {
  const [index, setIndex] = useState(0);
  const activeQuote = quotes[index] ?? quotes[0]!;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-ink-900 text-white">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-white/50">
            What this looks like day to day
          </p>
        </Reveal>

        <div className="relative mt-8 min-h-[220px] sm:min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <blockquote className="font-display text-2xl font-medium leading-snug sm:text-3xl">
                &ldquo;{activeQuote.quote}&rdquo;
              </blockquote>
              <p className="mt-5 text-sm text-white/50">{activeQuote.persona}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {quotes.map((quote, i) => (
            <button
              key={quote.persona}
              type="button"
              aria-label={`Show quote ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
