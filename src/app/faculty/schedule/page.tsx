import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { SessionForm, type ScheduleBatchOption } from "./session-form";
import { SessionRow, type SessionRecord } from "./session-row";

export const metadata = {
  title: "Schedule · Faculty",
};

/**
 * Faculty teaching schedule. Lists upcoming + recent class_sessions
 * the caller can see (RLS = same institution). Faculty can:
 *   - Create a new session (form at top).
 *   - Mark a session held / cancelled / re-open it.
 *   - Take attendance once the session is held (or scheduled — it's
 *     legal to mark in advance, useful for late edits).
 *   - Delete a session they own.
 *
 * The same row is shared with the attendance grid: that page reads
 * `class_sessions` for the header context (topic, time, batch) and
 * writes to `attendance_records` keyed on this id.
 */
export default async function FacultySchedulePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty/schedule");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";
  const canSchedule = Boolean(profile?.is_faculty || profile?.is_admin || role === "hod");
  if (!canSchedule) redirect("/today");

  if (!profile?.institution_id) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-destructive text-sm">
          Your profile isn&apos;t linked to an institution yet. Ask an admin to set institution_id
          before you can schedule classes.
        </p>
      </main>
    );
  }

  const [{ data: sessions, error }, { data: batchRows }] = await Promise.all([
    supabase
      .from("class_sessions")
      .select(
        "id, topic, scheduled_at, duration_minutes, status, location, notes, batch_id, faculty_id",
      )
      .eq("institution_id", profile.institution_id)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("batches")
      .select("id, name, year_of_study")
      .eq("institution_id", profile.institution_id)
      .order("year_of_study", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
  ]);

  const batches: ScheduleBatchOption[] = (batchRows ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    year_of_study: b.year_of_study,
  }));
  const batchById = new Map(batches.map((b) => [b.id, b]));

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
      </main>
    );
  }

  const rows = (sessions ?? []) as SessionRecord[];
  const upcoming = rows.filter((r) => r.status === "scheduled");
  const past = rows.filter((r) => r.status !== "scheduled");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground text-sm">
          Plan classes here, then mark attendance once each session is held. Students see the same
          rows on their dashboard so they know what&apos;s coming up.
        </p>
      </header>

      <section
        aria-label="New class session"
        className="border-input flex flex-col gap-3 rounded-md border p-4"
      >
        <h2 className="font-heading text-lg font-medium">New class session</h2>
        <SessionForm batches={batches} />
      </section>

      <section aria-label="Upcoming" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Upcoming ({upcoming.length})</h2>
        {upcoming.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {upcoming.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                isOwner={s.faculty_id === user.id}
                batchName={s.batch_id ? (batchById.get(s.batch_id)?.name ?? null) : null}
                batches={batches}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nothing scheduled. Use the form above to add a class.
          </p>
        )}
      </section>

      <section aria-label="Held / past / cancelled" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Held &amp; past ({past.length})</h2>
        {past.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {past.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                isOwner={s.faculty_id === user.id}
                batchName={s.batch_id ? (batchById.get(s.batch_id)?.name ?? null) : null}
                batches={batches}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No past sessions yet.</p>
        )}
      </section>

      <footer className="border-border border-t pt-4">
        <Link href="/faculty">
          <Button variant="ghost" size="sm">
            Back to faculty hub
          </Button>
        </Link>
      </footer>
    </main>
  );
}
