import Link from "next/link";
import { redirect } from "next/navigation";

import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { AttendanceGrid, type AttendanceCodeOption, type StudentRoster } from "./attendance-grid";

export const metadata = {
  title: "Attendance · Faculty",
};

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Faculty attendance grid for one class_session. Rows = students in
 * the session's batch (or whole institution if batch_id is null);
 * columns are the institution's attendance codes (P / A / L / EX).
 *
 * Initial values come from existing attendance_records; saving upserts
 * the whole batch in one server-action call.
 */
export default async function FacultyAttendancePage(props: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const { id } = await props.params;
  if (!UUID_RE.test(id)) redirect("/faculty/schedule");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/faculty/schedule/${id}/attendance`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, role, institution_id")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  const canMark = Boolean(profile?.is_faculty || profile?.is_admin || role === "hod");
  if (!canMark) redirect("/today");

  const { data: session, error: sessionError } = await supabase
    .from("class_sessions")
    .select("id, topic, scheduled_at, duration_minutes, status, batch_id, location, institution_id")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-destructive text-sm">
          Session not found or you don&apos;t have access. {sessionError?.message}
        </p>
        <Link href="/faculty/schedule">
          <Button variant="ghost" size="sm">
            Back to schedule
          </Button>
        </Link>
      </main>
    );
  }

  // Roster — students in the session's batch, or all institution
  // students if batch_id is null. Students are profiles with
  // is_admin = false and is_faculty = false in the same institution.
  let rosterQuery = supabase
    .from("profiles")
    .select("id, full_name, nickname, roll_number")
    .eq("institution_id", session.institution_id)
    .eq("is_admin", false)
    .eq("is_faculty", false)
    .order("full_name", { ascending: true });
  if (session.batch_id) {
    rosterQuery = rosterQuery.eq("batch_id", session.batch_id);
  }
  const { data: rosterRows, error: rosterError } = await rosterQuery;
  const roster: StudentRoster[] = (rosterRows ?? []).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    nickname: r.nickname,
    roll_number: r.roll_number,
  }));

  const { data: codeRows, error: codesError } = await supabase
    .from("attendance_codes")
    .select("code, label, counts_toward_total")
    .eq("institution_id", session.institution_id)
    .order("code", { ascending: true });
  const codes: AttendanceCodeOption[] = (codeRows ?? []).map((c) => ({
    code: c.code,
    label: c.label,
    counts_toward_total: c.counts_toward_total,
  }));

  const { data: existingRows } = await supabase
    .from("attendance_records")
    .select("student_id, code")
    .eq("class_session_id", session.id);
  const existingByStudent = new Map<string, string>(
    (existingRows ?? []).map((r) => [r.student_id, r.code]),
  );

  const startsAt = new Date(session.scheduled_at);
  const startLabel = Number.isFinite(startsAt.getTime())
    ? startsAt.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : session.scheduled_at;

  const headerError = rosterError?.message ?? codesError?.message ?? null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
          <PrintButton label="Download PDF" />
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{session.topic}</h1>
        <p className="text-muted-foreground text-sm">
          {startLabel} · {session.duration_minutes} min
          {session.location ? ` · ${session.location}` : ""}
        </p>
      </header>

      {headerError ? (
        <p className="text-destructive text-sm">Failed to load: {headerError}</p>
      ) : null}

      {codes.length === 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="font-medium">No attendance codes configured</p>
          <p className="text-muted-foreground mt-1">
            Ask an admin to add codes (e.g. P / A / L / EX) on <code>/admin/attendance</code> before
            marking sessions.
          </p>
        </div>
      ) : roster.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No students match this session&apos;s scope yet.
          {session.batch_id
            ? " Make sure the batch has members on /admin/users."
            : " Add students to the institution and they'll show up here."}
        </p>
      ) : (
        <AttendanceGrid
          sessionId={session.id}
          roster={roster}
          codes={codes}
          initialByStudent={Object.fromEntries(existingByStudent.entries())}
        />
      )}

      <footer data-print="hide" className="border-border border-t pt-4">
        <Link href="/faculty/schedule">
          <Button variant="ghost" size="sm">
            Back to schedule
          </Button>
        </Link>
      </footer>
    </main>
  );
}
