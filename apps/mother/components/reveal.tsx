"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * One consistent scroll-entrance animation used across every marketing
 * section, so timing/easing doesn't drift section to section. `delay` lets a
 * parent stagger a group of children (e.g. a feature grid) without each one
 * redefining its own transition.
 *
 * Respects prefers-reduced-motion (renders fully visible, no animation) —
 * required for anyone motion-sensitive, and also means content never
 * depends on an intersection observer actually firing (e.g. a tool that
 * captures the page without scrolling it).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px", amount: 0.1 }}
      variants={variants}
      transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
