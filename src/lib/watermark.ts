/**
 * User-id watermark helper (build spec §2.11).
 *
 * Visible content pages include a hashed excerpt of the signed-in
 * user's id so leaked screenshots or PDFs are traceable back to the
 * account. The full user id never leaves the server — only a short
 * SHA-256 prefix, which is enough to map back via a lookup table the
 * admin holds but uninformative on its own.
 *
 * The function is pure and runtime-agnostic: it uses the Web Crypto
 * API on the edge / browser, with a Node fallback for the server.
 */

const DEFAULT_LENGTH = 8;

/**
 * Hash a user id to a stable short string. Same input → same output
 * across runs, so admin can reconcile the watermark against the user
 * table after the fact.
 */
export async function watermarkId(
  userId: string,
  length: number = DEFAULT_LENGTH,
): Promise<string> {
  if (!userId) return "anon";
  const clampedLen = Math.max(4, Math.min(24, length));

  // Prefer Web Crypto (browser, edge, Node 20+).
  if (typeof crypto !== "undefined" && "subtle" in crypto) {
    const enc = new TextEncoder().encode(`physio-scholar:${userId}`);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    const bytes = new Uint8Array(digest);
    let hex = "";
    for (const b of bytes) hex += b.toString(16).padStart(2, "0");
    return hex.slice(0, clampedLen);
  }

  // Node fallback — import lazily so the browser bundle stays clean.
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(`physio-scholar:${userId}`).digest("hex").slice(0, clampedLen);
}

/** Deterministic synchronous fallback for tests / non-crypto paths. */
export function watermarkIdSync(userId: string, length: number = DEFAULT_LENGTH): string {
  if (!userId) return "anon";
  const clampedLen = Math.max(4, Math.min(24, length));
  // Tiny FNV-1a — not cryptographic, not intended for production use;
  // callers that care should use watermarkId() instead. This exists
  // so tests can avoid async crypto.subtle mocking.
  let h = 2166136261;
  const input = `physio-scholar:${userId}`;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(clampedLen, "0").slice(0, clampedLen);
}
