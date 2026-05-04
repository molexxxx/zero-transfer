import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      "coverage/**",
      "docs/api/**",
      "dist/**",
      "eslint.config.mjs",
      "node_modules/**",
      "packages/**",
      "scripts/**",
      "website/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: configDirectory,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
