"use client";

import { useTransition } from "react";

/**
 * Triggers the browser's print dialog. Modern browsers (Chrome, Edge,
 * Firefox, Safari) all expose "Save as PDF" as a destination in the
 * print dialog, so this single button covers the "download as PDF"
 * affordance without pulling in a PDF library on the client (~500KB
 * for jsPDF + html2canvas) or building a server-side renderer.
 *
 * The page-level @media print rules in globals.css strip the chrome
 * (nav, buttons, decorative borders) and force a black-on-white
 * palette so the resulting PDF is printable. Container elements that
 * should stay visible carry no extra hint; the global rule hides
 * `[data-print="hide"]` and shows everything else.
 */
export function PrintButton({
  label = "Download PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      data-print="hide"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          // Native browser print → user chooses "Save as PDF" in the
          // dialog. No-op if the user cancels.
          if (typeof window !== "undefined") window.print();
        });
      }}
      className={
        className ??
        "text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
      }
      aria-label={label}
    >
      {label}
    </button>
  );
}
