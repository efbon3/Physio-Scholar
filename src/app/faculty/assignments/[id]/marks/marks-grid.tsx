"use client";

import { useMemo, useState, useTransition } from "react";

import { saveAssignmentMarksAction } from "@/lib/assignments/actions";

export type MarksRosterEntry = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  roll_number: string | null;
};

/**
 * Marks-entry grid for one assignment. One numeric input per student;
 * leaving a row blank skips it (existing rows stay untouched). Bounds
 * 0..maxMarks are enforced client- and server-side. Submit upserts
 * every non-blank row in one batch via saveAssignmentMarksAction.
 */
export function MarksGrid({
  assignmentId,
  maxMarks,
  roster,
  initialByStudent,
}: {
  assignmentId: string;
  maxMarks: number;
  roster: MarksRosterEntry[];
  initialByStudent: Record<string, string>;
}) {
  const [marks, setMarks] = useState<Record<string, string>>(() => ({ ...initialByStudent }));
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => {
    const keysA = Object.keys(marks);
    const keysB = Object.keys(initialByStudent);
    if (keysA.length !== keysB.length) return true;
    for (const k of keysA) if (marks[k] !== initialByStudent[k]) return true;
    for (const k of keysB) if (marks[k] !== initialByStudent[k]) return true;
    return false;
  }, [marks, initialByStudent]);

  function setMark(studentId: string, value: string) {
    setMarks((prev) => {
      const next = { ...prev };
      if (value.trim() === "") {
        delete next[studentId];
      } else {
        next[studentId] = value;
      }
      return next;
    });
  }

  function validate(): string | null {
    for (const k of Object.keys(marks)) {
      const n = Number(marks[k]);
      if (!Number.isFinite(n) || n < 0 || n > maxMarks) {
        return `Each mark must be 0..${maxMarks}.`;
      }
    }
    return null;
  }

  return (
    <section aria-label="Marks grid" className="flex flex-col gap-3">
      <ul className="border-input flex flex-col rounded-md border">
        {roster.map((student, idx) => (
          <li
            key={student.id}
            className={`flex flex-wrap items-center gap-3 p-3 text-sm ${
              idx === roster.length - 1 ? "" : "border-border/60 border-b"
            }`}
          >
            <div className="flex flex-1 flex-col">
              <span className="font-medium">
                {student.nickname || student.full_name || "(unnamed)"}
              </span>
              <span className="text-muted-foreground text-xs">
                {student.roll_number ? `Roll ${student.roll_number}` : "No roll number"}
                {student.nickname && student.full_name && student.nickname !== student.full_name
                  ? ` · ${student.full_name}`
                  : ""}
              </span>
            </div>
            <input
              type="number"
              min={0}
              max={maxMarks}
              step="0.01"
              value={marks[student.id] ?? ""}
              disabled={pending}
              onChange={(e) => setMark(student.id, e.target.value)}
              aria-label={`Marks for ${student.full_name ?? "student"}`}
              placeholder="—"
              className="border-input bg-background w-24 rounded-md border px-2 py-1 text-right text-sm"
            />
            <span className="text-muted-foreground text-xs">/ {maxMarks}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() => {
            setFeedback(null);
            const err = validate();
            if (err) {
              setFeedback({ kind: "error", message: err });
              return;
            }
            const rows = roster.map((r) => ({
              student_id: r.id,
              marks: marks[r.id] ?? "",
            }));
            startTransition(async () => {
              const result = await saveAssignmentMarksAction(assignmentId, rows);
              if (result.status === "ok") {
                setFeedback({ kind: "ok", message: "Marks saved." });
              } else {
                setFeedback({ kind: "error", message: result.message });
              }
            });
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save marks"}
        </button>
        <span className="text-muted-foreground text-xs">
          {Object.keys(marks).length} of {roster.length} graded
        </span>
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
    </section>
  );
}
