"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { tryEnterFullscreen } from "@/lib/fullscreen";

/**
 * Pre-flight disclaimer shown before a focused study session
 * (review queue or exam drill). Uses the native `<dialog>` element via
 * `showModal()` so the browser handles focus trap + Esc-to-close +
 * inert background — no custom focus-trap code to drift.
 *
 * On Accept the modal:
 *   1. Calls `tryEnterFullscreen()` synchronously inside the click
 *      handler (browser security: requestFullscreen() must be invoked
 *      from inside a user gesture, before any await).
 *   2. Calls the parent's `onAccept` so the session can transition into
 *      its active state.
 *
 * Cancel routes back to a safe place (`/today` by default) rather than
 * trapping the learner on a pre-flight screen.
 */
export type PreflightModalProps = {
  open: boolean;
  /** "Review session" / "Exam drill" / etc. */
  kind: string;
  questionCount: number;
  /** Approximate session length, shown to the learner. */
  estimatedMinutes: number;
  /** Optional second line — e.g., the active mechanism title. */
  context?: string | null;
  onAccept: () => void;
  /** Path the cancel button links to. Defaults to /today. */
  cancelHref?: string;
};

export function PreflightModal({
  open,
  kind,
  questionCount,
  estimatedMinutes,
  context = null,
  onAccept,
  cancelHref = "/today",
}: PreflightModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // showModal throws if the dialog is already open in another
        // tree mount — safe to ignore.
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleAccept() {
    // Fire-and-forget — call requestFullscreen synchronously inside the
    // gesture handler so the browser honours it; failures (iOS Safari
    // tab, permission denied) are absorbed by the helper.
    void tryEnterFullscreen();
    onAccept();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="preflight-title"
      aria-describedby="preflight-summary"
      className="bg-background text-foreground fixed inset-0 m-auto max-w-md rounded-lg border p-0 shadow-xl backdrop:bg-black/60 open:flex open:flex-col"
    >
      <div className="flex flex-col gap-4 p-6">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Focused study mode
          </p>
          <h2 id="preflight-title" className="font-heading text-xl font-semibold">
            {kind}
          </h2>
          {context ? <p className="text-muted-foreground text-sm">{context}</p> : null}
        </header>

        <div id="preflight-summary" className="flex flex-col gap-2 text-sm leading-7">
          <p>
            <strong className="font-medium">{questionCount}</strong> question
            {questionCount === 1 ? "" : "s"} ·{" "}
            <strong className="font-medium">~{estimatedMinutes}</strong> minute
            {estimatedMinutes === 1 ? "" : "s"}
          </p>
          <p className="text-muted-foreground text-xs leading-5">
            We&apos;ll go fullscreen so you can focus. Press{" "}
            <kbd className="rounded border px-1">Esc</kbd> anytime to leave fullscreen — your
            progress is saved as you rate each card.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Link
            href={cancelHref}
            className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-sm"
            data-testid="preflight-cancel"
          >
            Not now
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            data-testid="preflight-accept"
            autoFocus
          >
            Begin
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Estimate review-session duration in minutes from the queue length.
 * Empirically a card takes about 90 seconds end-to-end (recall +
 * reveal + self-explanation + 2s rating delay + rating). Round up so
 * the user is never surprised by overshoot.
 */
export function estimateReviewMinutes(cardCount: number): number {
  return Math.max(1, Math.ceil((cardCount * 90) / 60));
}

/**
 * Estimate exam-drill duration. Locked at 60s/question by the timer
 * (`SECONDS_PER_QUESTION` in exam-session.tsx) so this is exact.
 */
export function estimateExamMinutes(questionCount: number): number {
  return Math.max(1, Math.ceil(questionCount));
}
