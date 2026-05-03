import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { gradeFor, parseGradeThresholds } from "@/lib/grading/thresholds";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My marks · Report card",
};

type ReportRow = {
  id: string;
  title: string;
  marks: number;
  maxMarks: number;
  percent: number;
  letter: string | null;
  gradedAt: string;
};

/**
 * Student report card. Lists every graded assignment_marks row this
 * student has, joined to faculty_assignments for the title/max_marks.
 * Computes a per-row percentage + letter grade from the institution's
 * grade_thresholds. RLS already restricts assignment_marks rows to
 * the student themselves (or their faculty), so the only filter we
 * need here is "and that's me".
 */
export default async function MyMarksReportCardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/marks");

  const { data: profile } = await supabase
    .from("profiles")
    .select("institution_id, full_name, nickname, roll_number")
    .eq("id", user.id)
    .single();

  // Institution settings — gives us the grade cut-offs.
  let thresholds = parseGradeThresholds(null);
  if (profile?.institution_id) {
    const { data: instRow } = await supabase
      .from("institutions")
      .select("grade_thresholds")
      .eq("id", profile.institution_id)
      .single();
    if (instRow) thresholds = parseGradeThresholds(instRow.grade_thresholds);
  }

  // All marks for this student. Read in two steps to avoid relying on
  // Supabase's implicit-join syntax (which needs FK relationships in
  // the generated types).
  const { data: markRows } = await supabase
    .from("assignment_marks")
    .select("assignment_id, marks, graded_at")
    .eq("student_id", user.id)
    .order("graded_at", { ascending: false });

  const assignmentIds = Array.from(new Set((markRows ?? []).map((r) => r.assignment_id))).filter(
    (v): v is string => Boolean(v),
  );

  const { data: assignmentRows } = assignmentIds.length
    ? await supabase
        .from("faculty_assignments")
        .select("id, title, max_marks")
        .in("id", assignmentIds)
    : {
        data: [] as Array<{ id: string; title: string; max_marks: number | null }>,
      };
  const metaById = new Map(
    (assignmentRows ?? []).map((a) => [
      a.id,
      { title: a.title, maxMarks: a.max_marks === null ? null : Number(a.max_marks) },
    ]),
  );

  const rows: ReportRow[] = (markRows ?? [])
    .map((m) => {
      const meta = metaById.get(m.assignment_id);
      if (!meta || meta.maxMarks === null || meta.maxMarks <= 0) return null;
      const marksNum = Number(m.marks);
      if (!Number.isFinite(marksNum)) return null;
      const percent = (marksNum / meta.maxMarks) * 100;
      return {
        id: m.assignment_id,
        title: meta.title,
        marks: marksNum,
        maxMarks: meta.maxMarks,
        percent,
        letter: gradeFor(percent, thresholds),
        gradedAt: m.graded_at,
      };
    })
    .filter((v): v is ReportRow => v !== null);

  // Aggregate — sum of marks divided by sum of max_marks for an
  // overall %. Letter grade then runs against the same cut-offs.
  const totalMarks = rows.reduce((acc, r) => acc + r.marks, 0);
  const totalMax = rows.reduce((acc, r) => acc + r.maxMarks, 0);
  const overallPct = totalMax > 0 ? (totalMarks / totalMax) * 100 : null;
  const overallLetter = overallPct !== null ? gradeFor(overallPct, thresholds) : null;

  const greetingName = profile?.nickname || profile?.full_name || "you";
  const rollLine = profile?.roll_number ? ` · Roll ${profile.roll_number}` : "";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Report card</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {greetingName}&apos;s marks
        </h1>
        <p className="text-muted-foreground text-sm">
          Every graded class test or assignment your faculty has scored, oldest at the bottom
          {rollLine}.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing graded yet. Once a faculty enters your marks for a class test, it&apos;ll show up
          here.
        </p>
      ) : (
        <>
          <section
            aria-label="Overall"
            className="border-input flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
          >
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs tracking-widest uppercase">
                Overall
              </span>
              <span className="font-heading text-lg font-medium">
                {totalMarks} / {totalMax}
                {overallPct !== null ? ` · ${Math.round(overallPct)}%` : ""}
                {overallLetter ? ` · ${overallLetter}` : ""}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {rows.length} graded item{rows.length === 1 ? "" : "s"}
            </span>
          </section>

          <ul className="border-input flex flex-col rounded-md border">
            {rows.map((r, idx) => (
              <li
                key={`${r.id}-${r.gradedAt}`}
                className={`flex flex-wrap items-center justify-between gap-3 p-3 text-sm ${
                  idx === rows.length - 1 ? "" : "border-border/60 border-b"
                }`}
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-muted-foreground text-xs">
                    Graded {new Date(r.gradedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    {r.marks} / {r.maxMarks}
                  </span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {Math.round(r.percent)}%{r.letter ? ` · ${r.letter}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer className="border-border border-t pt-4">
        <Link href="/today">
          <Button variant="ghost" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </footer>
    </main>
  );
}
