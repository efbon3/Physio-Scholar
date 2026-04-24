import { ImageResponse } from "next/og";

/**
 * Apple touch icon. Same monogram as icon.tsx, sized to 180×180 per
 * Apple guidance — keeps the home-screen glyph crisp on iOS when
 * Physio-Scholar is pinned.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        fontSize: 90,
        fontWeight: 600,
        letterSpacing: -3,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      PS
    </div>,
    size,
  );
}
