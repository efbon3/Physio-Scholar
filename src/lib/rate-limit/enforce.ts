import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { rateLimitFor, type RateLimitKey } from "./keys";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  totalToday: number;
};

/**
 * Server-side rate-limit enforcement. Calls the enforce_rate_limit
 * RPC which increments the counter atomically and returns whether the
 * caller is still under the cap.
 *
 * Usage (inside a server action / route handler):
 *
 *   const rl = await enforceRateLimit(supabase, profileId, "reviews");
 *   if (!rl.allowed) return { error: "daily-limit-reached" };
 *
 * In envs without Supabase (CI, previews) we degrade to "always
 * allowed" so the UI stays usable and the test suite doesn't have to
 * mock rate limits everywhere.
 */
export async function enforceRateLimit(
  supabase: SupabaseClient<Database> | null,
  profileId: string | null,
  key: RateLimitKey,
): Promise<RateLimitResult> {
  if (!supabase || !profileId || profileId === "preview") {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, totalToday: 0 };
  }
  const { key: dbKey, max } = rateLimitFor(key);
  const { data, error } = await supabase.rpc("enforce_rate_limit", {
    p_profile_id: profileId,
    p_key: dbKey,
    p_max_per_day: max,
  });
  if (error) {
    // Fail *closed* on a server error — it's safer to deny than to let
    // abuse through. Callers surface a friendly message.
    return { allowed: false, remaining: 0, totalToday: max };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { allowed: false, remaining: 0, totalToday: max };
  return {
    allowed: Boolean(row.allowed),
    remaining: typeof row.remaining === "number" ? row.remaining : 0,
    totalToday: typeof row.total_today === "number" ? row.total_today : 0,
  };
}
