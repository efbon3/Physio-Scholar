import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // Project-wide convention: parameters prefixed with `_` are
    // intentionally unused (interface conformance, chainable-API fake
    // signatures, etc). Matches the TypeScript compiler's own behaviour
    // with `noUnusedParameters` + underscore prefix.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    // Generated service worker bundle produced by @serwist/next at build
    // time. Lint it at the source (src/app/sw.ts) instead.
    "public/sw.js",
    "public/swe-worker-*.js",
    "public/workbox-*.js",
  ]),
]);

export default eslintConfig;
