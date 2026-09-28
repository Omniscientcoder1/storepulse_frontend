"use client";

import { motion } from "framer-motion";

/**
 * Hero visual metaphor: a scattered chat thread resolving into one ordered
 * storefront card. This is the whole product pitch in one image, so it earns
 * a bespoke illustration rather than a stock graphic.
 */
export function DmToStoreIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-xl"
      role="img"
      aria-label="Scattered chat messages resolving into one organized online storefront"
    >
      <defs>
        <linearGradient id="dmToStoreGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <motion.circle
        cx="240"
        cy="210"
        r="180"
        fill="url(#dmToStoreGlow)"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scattered DM bubbles, drifting toward the storefront card */}
      {[
        { x: 40, y: 60, w: 120, rot: -8, delay: 0 },
        { x: 20, y: 150, w: 100, rot: 6, delay: 0.15 },
        { x: 50, y: 250, w: 130, rot: -4, delay: 0.3 },
      ].map((bubble, i) => (
        <motion.g
          key={i}
          initial={{ x: 0, y: 0, opacity: 0.9 }}
          animate={{ x: [0, 30, 10], y: [0, -6, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, delay: bubble.delay, ease: "easeInOut" }}
        >
          <rect
            x={bubble.x}
            y={bubble.y}
            width={bubble.w}
            height="36"
            rx="12"
            transform={`rotate(${bubble.rot} ${bubble.x + bubble.w / 2} ${bubble.y + 18})`}
            fill="var(--color-ink-800)"
            stroke="var(--color-brand-500)"
            strokeOpacity="0.4"
          />
          <rect
            x={bubble.x + 14}
            y={bubble.y + 12}
            width={bubble.w - 40}
            height="6"
            rx="3"
            transform={`rotate(${bubble.rot} ${bubble.x + bubble.w / 2} ${bubble.y + 18})`}
            fill="var(--color-brand-500)"
            fillOpacity="0.7"
          />
          <rect
            x={bubble.x + 14}
            y={bubble.y + 22}
            width={bubble.w - 60}
            height="6"
            rx="3"
            transform={`rotate(${bubble.rot} ${bubble.x + bubble.w / 2} ${bubble.y + 18})`}
            fill="var(--color-brand-500)"
            fillOpacity="0.4"
          />
        </motion.g>
      ))}

      {/* The resolved storefront card — this illustration only ever renders
          inside the hero, which is visible on load, so animate on mount
          rather than whileInView (no scroll-triggered observer to depend on). */}
      <motion.g
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <rect
          x="220"
          y="120"
          width="220"
          height="260"
          rx="20"
          fill="var(--color-ink-900)"
          stroke="var(--color-accent-500)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <rect x="244" y="150" width="172" height="90" rx="10" fill="var(--color-brand-600)" fillOpacity="0.35" />
        <rect x="244" y="256" width="120" height="14" rx="7" fill="white" fillOpacity="0.9" />
        <rect x="244" y="278" width="80" height="10" rx="5" fill="white" fillOpacity="0.5" />
        <rect x="244" y="320" width="172" height="36" rx="10" fill="var(--color-accent-500)" />
        <rect x="264" y="334" width="70" height="8" rx="4" fill="var(--color-ink-900)" />
      </motion.g>
    </svg>
  );
}
