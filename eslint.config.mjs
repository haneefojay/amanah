import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Money is integer kobo only (spec §9). Use helpers in src/lib/money.ts instead.
      "no-restricted-globals": [
        "error",
        { name: "parseFloat", message: "Money is integer kobo. Use parseNairaToKobo()." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "Number", property: "parseFloat", message: "Use parseNairaToKobo()." },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  globalIgnores([
    ".next/**",
    ".claude/**",
    ".taste-skill/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "public/sw*",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
