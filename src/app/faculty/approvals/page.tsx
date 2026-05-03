import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { DecisionBar } from "./decision-bar";

export const metadata = {
  title: "Approvals · Faculty",
};

type PendingAssignment = {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  submitted_at: string | null;
  faculty_id: string;
  faculty: { full_name: string | null; nickname: string | null } | null;
};

/**
 * HOD approval queue. Lists every faculty_assignments row in the HOD's
 * institution that's still pending review (status='pending_hod') or
 * has been sent back for changes — the latter so the HOD can keep
 * track of what they kicked back. Approved / rejected rows live in
 * /faculty/assignments alongside the rest of the published catalogue.
 *
 * Auth: HOD or admin. Other roles bounce to /faculty.
 */
export default async function FacultyApprovalsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty/approvals");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin, institution_id, full_name, nickname")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  const isApprover = profile?.is_admin || role === "hod";
  if (!isApprover) redirect("/faculty");

  const { data, error } = await supabase
    .from("faculty_assignments")
    .select("id, title, description, due_at, submitted_at, faculty_id, status")
    .in("status", ["pending_hod", "changes_requested"])
    .order("submitted_at", { ascending: true, nullsFirst: false });

  const rows = (data ?? []) as Array<
    Pick<
      PendingAssignment,
      "id" | "title" | "description" | "due_at" | "submitted_at" | "faculty_id"
    > & { status: string }
  >;

  // Hydrate faculty names in one query so we don't do N round-trips.
  const facultyIds = Array.from(new Set(rows.map((r) => r.faculty_id)));
  const facultyById = new Map<string, PendingAssignment["faculty"]>();
  if (facultyIds.length > 0) {
    const { data: facultyRows } = await supabase
      .from("profiles")
      .select("id, full_name, nickname")
      .in("id", facultyIds);
    for (const f of facultyRows ?? []) {
      facultyById.set(f.id, { full_name: f.full_name, nickname: f.nickname });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Approval queue</h1>
        <p className="text-muted-foreground text-sm">
          Review the assignments faculty have submitted. Approve to publish, request changes to send
          back with a comment, or reject to refuse outright. Approved rows land on the student
          dashboard; rejected and changes-requested rows surface on the faculty&apos;s own
          /faculty/assignments page.
        </p>
      </header>

      {error ? (
        <p className="text-destructive text-sm">Failed to load queue: {error.message}</p>
      ) : rows.length === 0 ? (
        <div className="border-border bg-muted/40 rounded-md border p-6 text-center text-sm">
          Queue is empty — nothing pending review right now.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => {
            const faculty = facultyById.get(r.faculty_id) ?? null;
            const facultyName = faculty?.nickname || faculty?.full_name || "(unknown faculty)";
            return (
              <li
                key={r.id}
                className="border-border flex flex-col gap-3 rounded-md border p-4 text-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-heading text-lg font-medium">{r.title}</h2>
                  <span className="text-muted-foreground text-xs">
                    {r.status === "changes_requested" ? "Awaiting revision · " : ""}
                    Submitted {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">By {facultyName}</p>
                {r.description ? (
                  <p className="text-foreground/90 whitespace-pre-wrap">{r.description}</p>
                ) : (
                  <p className="text-muted-foreground text-xs italic">No description</p>
                )}
                {r.due_at ? (
                  <p className="text-muted-foreground text-xs">
                    Due: {new Date(r.due_at).toLocaleString()}
                  </p>
                ) : null}
                <DecisionBar assignmentId={r.id} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
