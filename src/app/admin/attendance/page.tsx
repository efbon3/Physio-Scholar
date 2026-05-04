import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { AttendanceCodeRow } from "./attendance-code-row";
import { AttendanceThresholdForm } from "./attendance-threshold-form";
import { CreateAttendanceCodeForm } from "./create-attendance-code-form";
import { GradeThresholdsForm } from "./grade-thresholds-form";

export const metadata = {
  title: "Attendance · Admin",
};

type AttendanceCodeRecord = {
  id: string;
  code: string;
  label: string;
  counts_toward_total: boolean;
};

type GradeThreshold = { label: string; min: number };

/**
 * Admin → attendance settings. Three sections:
 *   1. Attendance threshold (the % below which a student is flagged
 *      low-attendance on the dashboard).
 *   2. Grade thresholds (letter cut-offs by mark %).
 *   3. Attendance codes (P / A / L / EX / etc.) — institution-scoped
 *      list faculty pick from when marking a session.
 *
 * Settings live on `institutions` (threshold + grade_thresholds);
 * codes are their own table. RLS already constrains writes to admins
 * inside the same institution, but the server actions belt-and-brace
 * with their own admin guard.
 */
export default async function AdminAttendancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: callerProfile } = user
    ? await supabase.from("profiles").select("institution_id").eq("id", user.id).single()
    : { data: null };
  const institutionId = callerProfile?.institution_id ?? null;

  let attendanceThreshold = 0.75;
  let gradeThresholds: GradeThreshold[] = [
    { label: "A", min: 85 },
    { label: "B", min: 75 },
    { label: "C", min: 65 },
    { label: "D", min: 50 },
  ];
  let codes: AttendanceCodeRecord[] = [];
  let loadError: string | null = null;

  if (institutionId) {
    const { data: institutionRow, error: instError } = await supabase
      .from("institutions")
      .select("attendance_threshold, grade_thresholds")
      .eq("id", institutionId)
      .single();
    if (instError) {
      loadError = instError.message;
    } else if (institutionRow) {
      attendanceThreshold = Number(institutionRow.attendance_threshold ?? 0.75);
      const raw = institutionRow.grade_thresholds as unknown;
      if (Array.isArray(raw)) {
        gradeThresholds = raw
          .filter(
            (g): g is { label: unknown; min: unknown } =>
              typeof g === "object" && g !== null && "label" in g && "min" in g,
          )
          .map((g) => ({
            label: String(g.label ?? ""),
            min: Number(g.min ?? 0),
          }));
      }
    }

    const { data: codeRows, error: codesError } = await supabase
      .from("attendance_codes")
      .select("id, code, label, counts_toward_total")
      .eq("institution_id", institutionId)
      .order("code", { ascending: true });
    if (codesError) {
      loadError = loadError ?? codesError.message;
    } else {
      codes = (codeRows ?? []) as AttendanceCodeRecord[];
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Per-institution settings for class-attendance tracking and assignment grading. Faculty
          mark sessions with one of the codes you author here; the threshold drives the
          low-attendance banner; the grade cut-offs map a marks-percentage to a letter.
        </p>
      </header>

      {loadError ? (
        <p className="text-destructive mb-6 text-sm">Failed to load settings: {loadError}</p>
      ) : null}

      <section
        aria-labelledby="threshold-heading"
        className="border-input mb-8 rounded-md border p-5"
      >
        <h2 id="threshold-heading" className="mb-1 text-lg font-medium">
          Attendance threshold
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Students below this fraction of held sessions are flagged on faculty dashboards. Default
          0.75 (75%).
        </p>
        <AttendanceThresholdForm initial={attendanceThreshold} />
      </section>

      <section aria-labelledby="grades-heading" className="border-input mb-8 rounded-md border p-5">
        <h2 id="grades-heading" className="mb-1 text-lg font-medium">
          Grade cut-offs
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Letter grades and the minimum marks-percentage that earns each one. Anything below the
          lowest cut-off is unclassified. Saved sorted highest-min first.
        </p>
        <GradeThresholdsForm initial={gradeThresholds} />
      </section>

      <section aria-labelledby="codes-heading" className="border-input rounded-md border p-5">
        <h2 id="codes-heading" className="mb-1 text-lg font-medium">
          Attendance codes
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Each code is a short symbol (e.g. <code>P</code>, <code>A</code>, <code>L</code>,{" "}
          <code>EX</code>) faculty pick from when marking a session. Toggle &ldquo;counts toward
          total&rdquo; off for codes that should not affect the attendance % (e.g. <code>EX</code>
          cused).
        </p>

        <div className="mb-4">
          <CreateAttendanceCodeForm />
        </div>

        {codes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No codes yet. Add one above (e.g. P / Present / counts toward total).
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {codes.map((c) => (
              <AttendanceCodeRow
                key={c.id}
                id={c.id}
                code={c.code}
                label={c.label}
                countsTowardTotal={c.counts_toward_total}
              />
            ))}
          </ul>
        )}
      </section>

      <footer data-print="hide" className="border-border mt-8 border-t pt-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          ← Back to admin
        </Link>
      </footer>
    </main>
  );
}
