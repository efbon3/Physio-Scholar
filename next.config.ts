import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

const configWithSentry =
  sentryOrg && sentryProject
    ? withSentryConfig(nextConfig, {
        org: sentryOrg,
        project: sentryProject,
        // Upload source maps only when we have an auth token (CI / Vercel).
        silent: !process.env.CI,
        disableLogger: true,
      })
    : nextConfig;

export default configWithSentry;
