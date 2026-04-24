import { ImageResponse } from "next/og";

/**
 * Favicon / PWA icon generator. Returns a 256×256 PNG with a "PS"
 * monogram on the brand background, rendered server-side via Next's
 * ImageResponse. Next.js automatically emits `/icon` with the right
 * <link rel="icon"> tags and registers this in the Web App Manifest
 * so installable PWAs get a proper home-screen glyph.
 *
 * Author can replace with a hand-designed SVG/PNG any time — just drop
 * an `icon.svg` or `icon.png` next to this file and Next will prefer
 * the static asset over the generated one.
 */

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, oklab(0.35 -0.05 -0.14) 0%, oklab(0.52 -0.12 -0.06) 100%)",
        color: "#ffffff",
        fontSize: 120,
        fontWeight: 600,
        letterSpacing: -4,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      PS
    </div>,
    size,
  );
}
