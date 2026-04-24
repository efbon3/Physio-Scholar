/**
 * Canonical rate-limit keys + daily ceilings.
 *
 * Centralising these means a build-spec bump (e.g. "raise to 120
 * questions/day") is a one-line change rather than a scatter-hunt
 * across the code base. Matches §2.11 of the build spec.
 */

export const RATE_LIMITS = {
  /** Questions served per account per day. */
  reviews: { key: "reviews_served", max: 80 },
  /** Password reset requests per account per day. */
  passwordReset: { key: "password_reset", max: 5 },
  /** Content flags submitted per account per day. Not in spec, but a
   *  sane abuse ceiling — flagging shouldn't be a spam surface. */
  contentFlags: { key: "content_flags", max: 20 },
  /** AI grading calls — gated until Phase 4; enforced here so the
   *  client doesn't need special-case knowledge when the grader ships. */
  aiGrading: { key: "ai_grading", max: 10 },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

export function rateLimitFor(key: RateLimitKey): { key: string; max: number } {
  return RATE_LIMITS[key];
}
