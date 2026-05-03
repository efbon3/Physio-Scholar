"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAssignmentAction } from "@/lib/assignments/actions";

type Feedback = { kind: "ok"; message: string } | { kind: "error"; message: string } | null;

export type AssignmentBatchOption = {
  id: string;
  name: string;
  year_of_study: number | null;
};

/**
 * Faculty assignment-creation form. Submits to createAssignmentAction
 * which validates + writes via RLS. Title (required), description
 * (optional), due date+time (optional), target batches (multi-select;
 * empty = broadcast to whole institution). If the deadline input is
 * left blank the row gets due_at = NULL (no deadline).
 */
export function AssignmentForm({ batches }: { batches: AssignmentBatchOption[] }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setFeedback(null);
        // The native datetime-local input emits "2026-04-26T17:00"
        // which Postgres tolerates but our zod schema needs an offset
        // to validate. Append the browser offset before submission.
        const dueLocal = formData.get("due_at_local")?.toString() ?? "";
        if (dueLocal) {
          const localDate = new Date(dueLocal);
          if (Number.isFinite(localDate.getTime())) {
            formData.set("due_at", localDate.toISOString());
          } else {
            formData.set("due_at", "");
          }
        } else {
          formData.set("due_at", "");
        }
        formData.delete("due_at_local");

        startTransition(async () => {
          const result = await createAssignmentAction(formData);
          if (result.status === "ok") {
            setFeedback({ kind: "ok", message: "Assignment created." });
            formRef.current?.reset();
          } else {
            setFeedback({ kind: "error", message: result.message });
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignment-title">Title</Label>
        <Input
          id="assignment-title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Read Chapter 14 by Friday"
          data-testid="assignment-title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignment-description">Description (optional)</Label>
        <textarea
          id="assignment-description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="Reading list, task notes, or a short brief."
          className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignment-due">Due date / time (optional)</Label>
          <Input
            id="assignment-due"
            name="due_at_local"
            type="datetime-local"
            data-testid="assignment-due"
          />
          <p className="text-muted-foreground text-xs">
            Leave blank if there&apos;s no specific deadline.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignment-max-marks">Max marks (optional)</Label>
          <Input
            id="assignment-max-marks"
            name="max_marks"
            type="number"
            min={0.01}
            max={10000}
            step="0.01"
            placeholder="e.g. 100"
          />
          <p className="text-muted-foreground text-xs">
            Set this to make the assignment graded — you can then enter scores per student. Leave
            blank for a notice-board task.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignment-targets">Target batches (leave empty to broadcast)</Label>
        <select
          id="assignment-targets"
          name="target_batch_ids"
          multiple
          size={Math.min(6, Math.max(2, batches.length))}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          aria-describedby="assignment-targets-help"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.year_of_study !== null ? ` (Year ${b.year_of_study})` : ""}
            </option>
          ))}
        </select>
        <p id="assignment-targets-help" className="text-muted-foreground text-xs">
          Hold Ctrl / Cmd to select multiple. Empty selection = everyone in your institution sees
          it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create assignment"}
        </Button>
        {feedback ? (
          <span
            role="status"
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
