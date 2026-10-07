import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// next/core-web-vitals already registers eslint-plugin-jsx-a11y; adding it again conflicts.
const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "src/test-results/**",
      ".lighthouseci/**",
      "*.min.js",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
    },
  },
];

export default config;
