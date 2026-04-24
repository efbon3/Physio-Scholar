"use client";

/**
 * Progressive-disclosure hint ladder. One hint per tap per build spec
 * §2.5 — the caller tracks how many are shown, we render just those.
 * The "Show next hint" CTA is on the parent (card-view.tsx) so we stay
 * a pure display component.
 *
 * Each shown hint is a distinct <li> so screen readers announce them
 * individually rather than as one concatenated block.
 */
export function HintLadder({
  hints,
  shownCount,
}: {
  hints: readonly string[];
  shownCount: number;
}) {
  if (shownCount <= 0) return null;
  const visible = hints.slice(0, shownCount);
  return (
    <section aria-label="Hints" className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Hints so far</h2>
      <ol className="text-muted-foreground space-y-1 text-sm leading-7">
        {visible.map((hint, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="font-mono text-xs">
              {i + 1}.
            </span>
            <span>{hint}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
