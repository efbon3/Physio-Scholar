/**
 * Guard against open-redirect attacks via user-controlled `next` params.
 *
 * A bare `value.startsWith("/")` is NOT sufficient: browsers treat
 * `//evil.com/x` as a protocol-relative URL and `/\\evil.com/x` as an
 * ambiguous path-with-backslash that some parsers resolve off-site.
 * Only accept values that begin with `/` followed by a non-slash,
 * non-backslash character.
 */
export function isSafeRelativePath(value: string): boolean {
  if (typeof value !== "string") return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  return true;
}
