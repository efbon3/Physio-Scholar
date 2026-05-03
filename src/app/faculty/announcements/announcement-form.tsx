"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAnnouncementAction } from "@/lib/announcements/actions";

type Feedback = { kind: "ok"; message: string } | { kind: "error"; message: string } | null;

export type BatchOption = {
  id: string;
  name: string;
  year_of_study: number | null;
};

/**
 * Faculty announcement-creation form. Title (required), body
 * (optional, ≤ 4000 chars), target batches (multi-select; empty
 * selection = broadcast to whole institution).
 */
export function AnnouncementForm({ batches }: { batches: BatchOption[] }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setFeedback(null);
        startTransition(async () => {
          const result = await createAnnouncementAction(formData);
          if (result.status === "ok") {
            setFeedback({ kind: "ok", message: "Announcement saved as draft." });
            formRef.current?.reset();
          } else {
            setFeedback({ kind: "error", message: result.message });
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Mid-term timetable revised"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-body">Body (optional)</Label>
        <textarea
          id="announcement-body"
          name="body"
          rows={4}
          maxLength={4000}
          placeholder="What students need to know."
          className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-targets">Target batches (leave empty to broadcast)</Label>
        <select
          id="announcement-targets"
          name="target_batch_ids"
          multiple
          size={Math.min(6, Math.max(2, batches.length))}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          aria-describedby="announcement-targets-help"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.year_of_study !== null ? ` (Year ${b.year_of_study})` : ""}
            </option>
          ))}
        </select>
        <p id="announcement-targets-help" className="text-muted-foreground text-xs">
          Hold Ctrl / Cmd to select multiple. Empty selection = everyone in your institution sees
          it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save as draft"}
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
      <p className="text-muted-foreground text-xs">
        Drafts go to the HOD queue when you click Submit for review on the row below. HOD approval
        publishes the announcement to the targeted students.
      </p>
    </form>
  );
}
