/**
 * Guard against open-redirect attacks via user-controlled `next` params.
 *
 * A bare `value.startsWith("/")` is NOT sufficient:
 *   - `//evil.com/x` is a protocol-relative URL.
 *   - `/\\evil.com/x` is ambiguous; some parsers resolve it off-site.
 *   - `/%2Fevil.com` / `/%5Cevil.com` are URL-encoded versions of the
 *     same attack — intermediate proxies / clients may decode before
 *     following, shifting the category.
 *
 * We (a) block the obvious literal prefixes and (b) decode once and
 * re-run the prefix checks so the encoded variants fall into the same
 * reject bucket. Decoding more than once is refused — a value that
 * requires two decodes to expose a slash is almost certainly crafted.
 */
export function isSafeRelativePath(value: string): boolean {
  if (typeof value !== "string") return false;
  if (!hasSafeLiteralPrefix(value)) return false;

  // Percent-encoded-bypass defence: decode exactly once and re-check.
  // If decoding throws (malformed escapes) or produces a different
  // unsafe prefix, reject.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  if (decoded !== value && !hasSafeLiteralPrefix(decoded)) return false;
  return true;
}

function hasSafeLiteralPrefix(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  return true;
}
