import type { MetadataRoute } from "next";

/**
 * Web App Manifest per build spec §2.8:
 *   - name + short_name
 *   - description
 *   - icons (Next's generated /icon + /apple-icon routes plug in here)
 *   - start_url
 *   - display: "standalone"
 *   - theme / background colors matching the light-mode palette
 *
 * Serving this from `app/manifest.ts` lets Next.js advertise it as a
 * `<link rel="manifest">` automatically. Browsers then use the contents
 * to decide whether Physio-Scholar is installable and how it should
 * look when launched from the home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Physio-Scholar",
    short_name: "Physio-Scholar",
    description:
      "Mechanism-based active-recall learning for MBBS physiology. V1 pilot for cardiovascular fundamentals.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["education", "medical", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
