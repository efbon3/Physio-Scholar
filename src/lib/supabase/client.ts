import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

/**
 * Supabase client for use in client components ("use client" boundary).
 * Reads session from browser cookies; mutations invalidate on refresh via
 * `@supabase/ssr`'s session helpers.
 *
 * Do NOT call this from server components or route handlers — use
 * `./server.ts` instead, which reads/writes cookies via Next.js request APIs.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
