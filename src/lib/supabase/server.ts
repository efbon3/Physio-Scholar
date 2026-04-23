import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./database.types";

/**
 * Supabase client for server components, route handlers, and server actions.
 * Reads and refreshes the session via Next.js's async `cookies()` API
 * (which is a Promise in Next 15+).
 *
 * For middleware use, see `./middleware.ts` — middleware needs a different
 * cookie-access pattern because it mutates the response cookies directly.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a server component, where writing to the
            // cookie store is not permitted. Middleware refreshes the session
            // on every request, so this is safe to ignore here.
          }
        },
      },
    },
  );
}
