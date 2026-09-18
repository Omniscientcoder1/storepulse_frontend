// Shared ESLint flat config. Each app extends this with its own
// `eslint.config.js` (e.g. adding `eslint-config-next`'s flat config) rather
// than forking it — see AGENTS.md: "Shared config ... apps extend it, don't
// fork it."
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // TypeScript strict mode is the actual `any` gate; this only catches
      // one that was never given a reason (AGENTS.md: "no untyped `any`
      // without a comment explaining why").
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/coverage/**",
      "**/playwright-report/**",
    ],
  },
];

export default baseConfig;
