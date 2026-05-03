"use client";

import { useMemo, useState, useTransition } from "react";

import { saveAttendanceRecordsAction } from "@/lib/schedule/actions";

export type AttendanceCodeOption = {
  code: string;
  label: string;
  counts_toward_total: boolean;
};

export type StudentRoster = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  roll_number: string | null;
};

/**
 * Grid editor for one session's attendance. Each row is a student;
 * the dropdown lets faculty pick from the institution's codes (or
 * leave unmarked). One Save button at the bottom batches all rows
 * into a single upsert call.
 *
 * "Mark all P" applies the chosen "present" code (the first code
 * whose counts_toward_total is true) to every still-unmarked row.
 * Faculty can then change individuals before saving.
 */
export function AttendanceGrid({
  sessionId,
  roster,
  codes,
  initialByStudent,
}: {
  sessionId: string;
  roster: StudentRoster[];
  codes: AttendanceCodeOption[];
  initialByStudent: Record<string, string>;
}) {
  const [marks, setMarks] = useState<Record<string, string>>(() => ({ ...initialByStudent }));
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const presentCode = useMemo(
    () => codes.find((c) => c.counts_toward_total)?.code ?? codes[0]?.code ?? null,
    [codes],
  );

  const dirty = useMemo(() => {
    if (Object.keys(marks).length !== Object.keys(initialByStudent).length) return true;
    for (const k of Object.keys(marks)) {
      if (marks[k] !== initialByStudent[k]) return true;
    }
    for (const k of Object.keys(initialByStudent)) {
      if (marks[k] !== initialByStudent[k]) return true;
    }
    return false;
  }, [marks, initialByStudent]);

  function setMark(studentId: string, code: string) {
    setMarks((prev) => {
      const next = { ...prev };
      if (code === "") {
        delete next[studentId];
      } else {
        next[studentId] = code;
      }
      return next;
    });
  }

  function markAllPresent() {
    if (!presentCode) return;
    setMarks((prev) => {
      const next = { ...prev };
      for (const r of roster) {
        if (!next[r.id]) next[r.id] = presentCode;
      }
      return next;
    });
  }

  function clearAll() {
    setMarks({});
  }

  return (
    <section aria-label="Attendance grid" className="flex flex-col gap-3">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          disabled={pending || !presentCode}
          onClick={markAllPresent}
          className="hover:bg-muted rounded-md border px-2 py-1 disabled:opacity-50"
        >
          Mark all unmarked as {presentCode ?? "—"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={clearAll}
          className="hover:bg-muted rounded-md border px-2 py-1 disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

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
            <select
              value={marks[student.id] ?? ""}
              disabled={pending}
              onChange={(e) => setMark(student.id, e.target.value)}
              aria-label={`Attendance for ${student.full_name ?? "student"}`}
              className="border-input bg-background rounded-md border px-2 py-1 text-sm"
            >
              <option value="">— unmarked —</option>
              {codes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.label}
                  {c.counts_toward_total ? "" : " (excused)"}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() => {
            setFeedback(null);
            const records = roster.map((r) => ({
              student_id: r.id,
              code: marks[r.id] ?? "",
            }));
            startTransition(async () => {
              const result = await saveAttendanceRecordsAction(sessionId, records);
              if (result.status === "ok") {
                setFeedback({ kind: "ok", message: "Attendance saved." });
              } else {
                setFeedback({ kind: "error", message: result.message });
              }
            });
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save attendance"}
        </button>
        <span className="text-muted-foreground text-xs">
          {Object.keys(marks).length} of {roster.length} marked
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
