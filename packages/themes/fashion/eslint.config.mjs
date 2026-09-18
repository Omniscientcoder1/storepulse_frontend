import { baseConfig as sharedConfig } from "@storepulse/config/eslint";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Includes `eslint-config-next` (not just `@storepulse/config`'s plain
 * rules) even though this package isn't a Next app itself — its components
 * are only ever rendered inside one (`apps/storefront`), and use
 * Next-specific rule disables (`@next/next/no-img-element`) that need the
 * plugin actually loaded to resolve, mirroring the consuming app's own
 * `eslint.config.mjs`.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...sharedConfig.filter((c) => "rules" in c),
]);
