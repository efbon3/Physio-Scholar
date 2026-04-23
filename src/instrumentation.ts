import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook. Runs once per process on startup. Loads the
 * right Sentry config depending on the runtime so edge, server, and client
 * each get their own initialization.
 *
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
