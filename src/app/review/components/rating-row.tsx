"use client";

import { useEffect, useState } from "react";

import type { Rating } from "@/lib/srs/types";

/**
 * Four-button rating row (again / hard / good / easy). Required to
 * advance per build spec §2.4. Visible state:
 *   - Before `delayMs` has elapsed since reveal → fully hidden (fade
 *     in kicks once the timer expires, keeping `aria-hidden` true so
 *     screen readers don't announce them prematurely)
 *   - After → opacity 100, fully interactive
 *
 * Flat emotional tone (build spec §2.4) — no colors correlated with
 * "right / wrong." Buttons are visually identical; the only per-button
 * adornment is the label and a small keyboard-shortcut hint.
 *
 * Layout: 2×2 grid on phone (so each tap target is ~half-width and
 * full-height enough to avoid mis-taps), 1×4 row from sm: up. Buttons
 * are at least 48px tall (min-h-12) — that's the Material touch-target
 * floor and beats Apple's 44pt minimum.
 *
 * Keyboard: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy. Hints are shown
 * as small subscript characters under the label. Bound globally to
 * `keydown` while the row is active; if focus is in a textarea (the
 * attempt or self-explanation field), we skip — the learner may be
 * mid-sentence and the digits would otherwise hijack their input.
 */
const RATING_KEYS: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

const RATING_HINTS: Record<Rating, string> = {
  again: "1",
  hard: "2",
  good: "3",
  easy: "4",
};

export function RatingRow({
  revealedAt,
  delayMs,
  onRate,
}: {
  revealedAt: number | null;
  delayMs: number;
  onRate: (rating: Rating) => void;
}) {
  // Parent passes a key tied to `revealedAt`, so this component remounts
  // whenever the student reveals the next card. That means the useState
  // initializer runs fresh — we never need setState synchronously inside
  // the effect body, just the setTimeout-driven transition to `true`.
  const [active, setActive] = useState(
    () => revealedAt !== null && Date.now() >= revealedAt + delayMs,
  );

  useEffect(() => {
    if (revealedAt === null) return;
    const remaining = revealedAt + delayMs - Date.now();
    if (remaining <= 0) return; // already active from the initializer
    const t = setTimeout(() => setActive(true), remaining);
    return () => clearTimeout(t);
  }, [revealedAt, delayMs]);

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      // Skip when the learner is typing into a field — they may be
      // composing the self-explanation. Modifier keys are also skipped
      // so browser shortcuts (Ctrl+1 etc.) keep working.
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      const rating = RATING_KEYS[e.key];
      if (!rating) return;
      e.preventDefault();
      onRate(rating);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onRate]);

  const buttons: { rating: Rating; label: string }[] = [
    { rating: "again", label: "Again" },
    { rating: "hard", label: "Hard" },
    { rating: "good", label: "Good" },
    { rating: "easy", label: "Easy" },
  ];

  return (
    <div
      role="group"
      aria-label="Rate this card"
      aria-hidden={!active}
      className={
        "sticky bottom-4 mt-auto grid grid-cols-2 gap-2 transition-opacity duration-200 sm:grid-cols-4 " +
        (active ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      {buttons.map((b) => (
        <button
          key={b.rating}
          type="button"
          onClick={() => onRate(b.rating)}
          disabled={!active}
          data-testid={`rate-${b.rating}`}
          aria-keyshortcuts={RATING_HINTS[b.rating]}
          className="border-input bg-background hover:bg-muted flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <span>{b.label}</span>
          <span aria-hidden className="text-muted-foreground text-[10px] font-normal">
            {RATING_HINTS[b.rating]}
          </span>
        </button>
      ))}
    </div>
  );
}
