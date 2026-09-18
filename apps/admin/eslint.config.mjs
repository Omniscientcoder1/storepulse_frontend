import { baseConfig as sharedConfig } from "@storepulse/config/eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Repo-wide rule preferences (no-explicit-any warning, unused-vars pattern)
  // shared with the non-Next packages — see packages/config/eslint.config.js.
  ...sharedConfig.filter((c) => "rules" in c),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
