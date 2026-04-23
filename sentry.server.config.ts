import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry initialization.
 *
 * Applied in route handlers, server components, and server actions.
 * Gracefully no-ops when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN is missing.
 */
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    enabled: true,
  });
}
