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
 * adornment is the label.
 */
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
        "sticky bottom-4 mt-auto flex flex-wrap gap-2 transition-opacity duration-200 " +
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
          className="border-input bg-background hover:bg-muted flex-1 rounded-md border px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
