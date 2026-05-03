import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { MarksGrid, type MarksRosterEntry } from "./marks-grid";

export const metadata = {
  title: "Marks · Faculty",
};

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Faculty marks entry for one assignment. Roster = students whose
 * batch_id appears in target_batch_ids (or whole institution if the
 * list is empty). Initial values come from existing assignment_marks
 * rows. Saving upserts the whole batch in a single action call.
 */
export default async function FacultyAssignmentMarksPage(props: {
  params: Promise<{ id: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const { id } = await props.params;
  if (!UUID_RE.test(id)) redirect("/faculty/assignments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/faculty/assignments/${id}/marks`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, role, institution_id")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  const canMark = Boolean(profile?.is_faculty || profile?.is_admin || role === "hod");
  if (!canMark) redirect("/today");

  const { data: assignment, error: aErr } = await supabase
    .from("faculty_assignments")
    .select("id, title, max_marks, target_batch_ids, institution_id, status")
    .eq("id", id)
    .single();
  if (aErr || !assignment) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Marks</h1>
        <p className="text-destructive text-sm">
          Assignment not found or you don&apos;t have access. {aErr?.message}
        </p>
        <Link href="/faculty/assignments">
          <Button variant="ghost" size="sm">
            Back to assignments
          </Button>
        </Link>
      </main>
    );
  }
  if (assignment.max_marks === null) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground text-sm">
          This assignment isn&apos;t graded — set <code>max_marks</code> on /faculty/assignments
          first, then come back here to enter scores.
        </p>
        <Link href="/faculty/assignments">
          <Button variant="ghost" size="sm">
            Back to assignments
          </Button>
        </Link>
      </main>
    );
  }

  // Roster — students in any of the target batches, or the whole
  // institution if target_batch_ids is empty. We read with two
  // queries (or one) depending on whether targets exist. Server
  // returns rows in full_name order so the SQL is simple; we re-sort
  // client-side by roll number with a numeric-aware comparator so
  // "1, 2, 10" beats "1, 10, 2" when roll numbers are pure integers.
  const targetIds: string[] = (assignment.target_batch_ids ?? []) as string[];
  let rosterQuery = supabase
    .from("profiles")
    .select("id, full_name, nickname, roll_number, batch_id")
    .eq("institution_id", assignment.institution_id)
    .eq("is_admin", false)
    .eq("is_faculty", false)
    .order("full_name", { ascending: true });
  if (targetIds.length > 0) {
    rosterQuery = rosterQuery.in("batch_id", targetIds);
  }
  const { data: rosterRows, error: rosterError } = await rosterQuery;
  const roster: MarksRosterEntry[] = (rosterRows ?? [])
    .map((r) => ({
      id: r.id,
      full_name: r.full_name,
      nickname: r.nickname,
      roll_number: r.roll_number,
    }))
    .sort(compareByRoll);

  const { data: existing } = await supabase
    .from("assignment_marks")
    .select("student_id, marks")
    .eq("assignment_id", assignment.id);
  const initialByStudent: Record<string, string> = {};
  for (const r of existing ?? []) {
    initialByStudent[r.student_id] = String(r.marks);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground text-sm">Out of {Number(assignment.max_marks)} marks</p>
      </header>

      {rosterError ? (
        <p className="text-destructive text-sm">Failed to load roster: {rosterError.message}</p>
      ) : null}

      {roster.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No students match this assignment&apos;s target batches yet.
          {targetIds.length > 0
            ? " Make sure each target batch has members."
            : " Add students to the institution first."}
        </p>
      ) : (
        <MarksGrid
          assignmentId={assignment.id}
          maxMarks={Number(assignment.max_marks)}
          roster={roster}
          initialByStudent={initialByStudent}
        />
      )}

      <footer className="border-border border-t pt-4">
        <Link href="/faculty/assignments">
          <Button variant="ghost" size="sm">
            Back to assignments
          </Button>
        </Link>
      </footer>
    </main>
  );
}

/**
 * Roll-number comparator. Tries numeric first ("1" < "2" < "10");
 * falls back to localeCompare for alphanumeric rolls ("21A" < "21B").
 * Nulls sort last so an unset roll doesn't crowd the start of the list.
 */
function compareByRoll(a: MarksRosterEntry, b: MarksRosterEntry): number {
  const ar = a.roll_number?.trim() ?? "";
  const br = b.roll_number?.trim() ?? "";
  if (!ar && !br) return (a.full_name ?? "").localeCompare(b.full_name ?? "");
  if (!ar) return 1;
  if (!br) return -1;
  const an = Number(ar);
  const bn = Number(br);
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  return ar.localeCompare(br, undefined, { numeric: true });
}
