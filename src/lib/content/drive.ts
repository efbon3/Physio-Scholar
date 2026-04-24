/**
 * Google Drive share-link helpers.
 *
 * Authors paste a Drive "share link" from the UI. We convert it to the
 * direct-image URL form PostgREST and `<img>` actually render, without
 * OAuth or the Drive picker SDK.
 *
 * Pure string transforms — unit-testable without jsdom. The runtime
 * assumption is that the file is set to "Anyone with the link can view"
 * in Google Drive; a private file will render as a broken image even
 * with a correctly-converted URL.
 */

/** Recognises the usual Drive URL shapes and extracts the file id. */
const DRIVE_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/, // /file/d/ID/view
  /^https?:\/\/drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/, // /open?id=ID
  /^https?:\/\/drive\.google\.com\/uc\?.*\bid=([A-Za-z0-9_-]+)/, // /uc?id=ID
  /^https?:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([A-Za-z0-9_-]+)/,
];

/**
 * Pull the Drive file id out of a share URL, or null if the string
 * doesn't look like one we recognise.
 */
export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  for (const re of DRIVE_PATTERNS) {
    const match = trimmed.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Convert a Drive share URL to a direct-view URL suitable for embedding
 * as an `<img src>`. Returns null if the input isn't a Drive URL.
 *
 * The `export=view` parameter keeps the request on the image-serving
 * endpoint (not the "download" endpoint, which can be rate-limited).
 */
export function toDriveDirectImageUrl(url: string): string | null {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

/**
 * True when the input is already a Drive direct-view URL. Used by the
 * admin UI to skip the convert-on-save path for URLs we already
 * normalised on a previous paste.
 */
export function isDriveDirectImageUrl(url: string): boolean {
  return /^https?:\/\/drive\.google\.com\/uc\?.*\bid=/.test(url.trim());
}
