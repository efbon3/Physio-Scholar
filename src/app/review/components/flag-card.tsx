"use client";

import { useState, useTransition } from "react";

import { flagCardAction, type FlagSubmissionResult } from "./flag-card-action";

/**
 * Collapsible "Report this card" form. Lives under the card reveal so
 * a learner who spots a wrong answer has an immediate escape hatch
 * rather than bouncing out to email.
 *
 * Collapsed by default to keep the review UI visually calm. Expanding
 * shows a reason picker (common categories) and an optional notes box.
 *
 * The action returns a plain object; on submit we keep the form visible
 * with either a success toast-like message or the error detail. Closes
 * itself automatically after a successful submission.
 */
const REASONS = [
  "Wrong correct answer",
  "Stem is unclear",
  "Hints give it away",
  "Misconception doesn't match",
  "Stale or missing citation",
  "Other",
] as const;

export function FlagCard({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<FlagSubmissionResult | null>(null);

  return (
    <div className="mt-4 border-t pt-3 text-sm">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Cancel report" : "Report this card"}
      </button>
      {open ? (
        <form
          action={(formData) => {
            startTransition(async () => {
              const response = await flagCardAction(formData);
              setResult(response);
              if (response.status === "ok") {
                setTimeout(() => {
                  setOpen(false);
                  setResult(null);
                }, 1500);
              }
            });
          }}
          className="mt-3 flex flex-col gap-3"
        >
          <input type="hidden" name="card_id" value={cardId} />
          <div className="flex flex-col gap-1">
            <label htmlFor="flag-reason" className="text-xs font-medium">
              Why is this card wrong?
            </label>
            <select
              id="flag-reason"
              name="reason"
              required
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="flag-notes" className="text-xs font-medium">
              Notes (optional)
            </label>
            <textarea
              id="flag-notes"
              name="notes"
              rows={2}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              placeholder="What would you fix?"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-xs disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit"}
            </button>
            {result?.status === "ok" ? (
              <span className="text-muted-foreground text-xs">
                Thanks — the admin will review it.
              </span>
            ) : null}
            {result?.status === "error" ? (
              <span className="text-destructive text-xs">{result.message}</span>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
