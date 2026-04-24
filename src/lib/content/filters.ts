/**
 * Helpers for safely reading content ids out of query strings / route
 * params. These live separately from `src/lib/content/fs.ts` so they
 * can be reused from edge runtimes that don't have filesystem access
 * (middleware, route handlers) without pulling in `fs`.
 *
 * The kebab-case regex is the same contract `readMechanismById` uses
 * before touching disk — duplicating it here means a malicious URL
 * segment is rejected before it can become a filesystem traversal or
 * a surprise render path.
 */

const MECHANISM_ID_RE = /^[a-z0-9-]+$/;

export type MechanismParam = string | string[] | undefined | null;

/**
 * Normalise a `?mechanism=<id>` search-param value into a kebab-case id
 * or null. Rejects:
 *   - empty / whitespace-only values
 *   - arrays beyond the first element
 *   - ids with uppercase, dots, slashes, or any other non-kebab chars
 */
export function normaliseMechanismId(raw: MechanismParam): string | null {
  if (raw == null) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (!MECHANISM_ID_RE.test(trimmed)) return null;
  return trimmed;
}
