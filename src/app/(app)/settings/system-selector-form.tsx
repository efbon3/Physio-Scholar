"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { saveStudySystemsAction } from "./actions";

type Props = {
  allSystems: string[];
  initiallyChecked: string[];
};

/**
 * Checkbox grid for the organ-system selector. Lives inside the
 * settings page wrapper (server-rendered shell, client-rendered form).
 * Each system is a labelled checkbox; pressing Save persists the
 * union to profiles.study_systems via the server action.
 *
 * "Select all" / "Select none" shortcuts because eleven checkboxes is
 * tedious to bulk-toggle by hand — and a learner likely flips between
 * "everything" and "just one system this week" rather than
 * fine-grained subsets.
 */
export function SystemSelectorForm({ allSystems, initiallyChecked }: Props) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initiallyChecked));
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; message: string } | null>(null);

  function toggle(system: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(system)) next.delete(system);
      else next.add(system);
      return next;
    });
  }

  function setAll(value: boolean) {
    setChecked(value ? new Set(allSystems) : new Set());
  }

  return (
    <form
      action={(formData) => {
        // Sync the server-action FormData from our controlled state so
        // the validation source-of-truth is just the `checked` Set.
        formData.delete("systems");
        for (const s of checked) formData.append("systems", s);
        setFeedback(null);
        startTransition(async () => {
          const result = await saveStudySystemsAction(formData);
          if (result.status === "ok") {
            setFeedback({ kind: "ok", message: "Saved." });
          } else {
            setFeedback({ kind: "error", message: result.message });
          }
        });
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setAll(true)}
          className="hover:bg-muted rounded-md border px-2 py-1"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={() => setAll(false)}
          className="hover:bg-muted rounded-md border px-2 py-1"
        >
          Select none
        </button>
        <span className="text-muted-foreground self-center">
          {checked.size} of {allSystems.length} selected
        </span>
      </div>

      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <legend className="sr-only">Organ systems</legend>
        {allSystems.map((system) => {
          const isChecked = checked.has(system);
          return (
            <label
              key={system}
              className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm"
            >
              <input
                type="checkbox"
                name="systems"
                value={system}
                checked={isChecked}
                onChange={() => toggle(system)}
                className="mt-0.5"
              />
              <span className="capitalize">{system}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <Link
          href="/today"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back to Today
        </Link>
        {feedback ? (
          <span
            className={
              feedback.kind === "ok" ? "text-xs text-emerald-600" : "text-destructive text-xs"
            }
          >
            {feedback.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
