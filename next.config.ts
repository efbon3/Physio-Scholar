import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Skip service worker in development by default — iterating on app code
  // without a stale SW getting in the way. Set DISABLE_PWA=false locally
  // to exercise the SW during dev if you're debugging caching.
  disable: process.env.NODE_ENV === "development" && process.env.DISABLE_PWA !== "false",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // Sentry wraps source maps and adds route instrumentation. Runtime init
  // happens from sentry.{client,server,edge}.config.ts via the
  // `register()` hook in src/instrumentation.ts.
};

/**
 * Only apply the Sentry wrapper when a DSN is configured. Without one, the
 * wrapper still works but emits warnings that would clutter CI and local dev.
 */
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

const withSerwistConfig = withSerwist(nextConfig);

const configWithSentry =
  sentryOrg && sentryProject
    ? withSentryConfig(withSerwistConfig, {
        org: sentryOrg,
        project: sentryProject,
        // Upload source maps only when we have an auth token (CI / Vercel).
        silent: !process.env.CI,
        disableLogger: true,
      })
    : withSerwistConfig;

export default configWithSentry;
