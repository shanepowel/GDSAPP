import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["lib/scoring/fit.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message: "Scoring must stay a pure function with no database access.",
            },
            {
              name: "@datum/db",
              message: "Scoring must stay a pure function with no database access.",
            },
            {
              name: "next",
              message: "Scoring must stay a pure function with no Next.js runtime.",
            },
          ],
          patterns: [
            {
              group: ["next/*", "node:fs", "node:http", "node:https", "node:net", "node:fetch"],
              message: "Scoring must stay a pure function with no I/O or network.",
            },
          ],
        },
      ],
    },
  },
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
