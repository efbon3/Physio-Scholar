"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClassSessionAction } from "@/lib/schedule/actions";

type Feedback = { kind: "ok"; message: string } | { kind: "error"; message: string } | null;

export type ScheduleBatchOption = {
  id: string;
  name: string;
  year_of_study: number | null;
};

/**
 * Form to create a new class session. Topic + scheduled-at are
 * required; duration defaults to 60 mins; batch is optional (an
 * institution-wide session leaves it null and shows on every batch's
 * roster). Submits the local datetime as a true ISO string with offset
 * — server schema rejects naked local strings.
 */
export function SessionForm({ batches }: { batches: ScheduleBatchOption[] }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setFeedback(null);
        const local = formData.get("scheduled_at_local")?.toString() ?? "";
        if (!local) {
          setFeedback({ kind: "error", message: "Please pick a date and time." });
          return;
        }
        const dt = new Date(local);
        if (!Number.isFinite(dt.getTime())) {
          setFeedback({ kind: "error", message: "Invalid date / time." });
          return;
        }
        formData.set("scheduled_at", dt.toISOString());
        formData.delete("scheduled_at_local");

        startTransition(async () => {
          const result = await createClassSessionAction(formData);
          if (result.status === "ok") {
            setFeedback({ kind: "ok", message: "Session scheduled." });
            formRef.current?.reset();
          } else {
            setFeedback({ kind: "error", message: result.message });
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="session-topic">Topic</Label>
        <Input
          id="session-topic"
          name="topic"
          required
          maxLength={200}
          placeholder="e.g. Cardiac cycle — phases & pressure-volume loop"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-when">When</Label>
          <Input id="session-when" name="scheduled_at_local" type="datetime-local" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-duration">Duration (minutes)</Label>
          <Input
            id="session-duration"
            name="duration_minutes"
            type="number"
            min={5}
            max={600}
            defaultValue={60}
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-batch">Batch (optional)</Label>
          <select
            id="session-batch"
            name="batch_id"
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Whole institution</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.year_of_study !== null ? ` (Year ${b.year_of_study})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-location">Location (optional)</Label>
          <Input
            id="session-location"
            name="location"
            maxLength={100}
            placeholder="e.g. Lecture Hall 2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="session-notes">Notes (optional)</Label>
        <textarea
          id="session-notes"
          name="notes"
          rows={2}
          maxLength={2000}
          placeholder="Pre-reading, equipment, anything students should know."
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Schedule class"}
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
