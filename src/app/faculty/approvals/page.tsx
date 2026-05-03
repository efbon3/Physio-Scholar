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
    .select("role, is_admin, institution_id, department_id, full_name, nickname")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  const isApprover = Boolean(profile?.is_admin) || role === "hod";
  if (!profile || !isApprover) redirect("/faculty");

  // Department scope: HODs see only their own department's faculty.
  // Admins see everyone in the institution. HODs without a department
  // assigned yet fall back to institution-wide (otherwise they'd be
  // locked out of every queue) — admin can fix that on /admin/users.
  const scopeByDepartment = !profile.is_admin && Boolean(profile.department_id);
  let facultyIdsInScope: string[] | null = null;
  if (scopeByDepartment && profile.department_id) {
    const { data: deptFaculty } = await supabase
      .from("profiles")
      .select("id")
      .eq("department_id", profile.department_id);
    facultyIdsInScope = (deptFaculty ?? []).map((f) => f.id);
    if (facultyIdsInScope.length === 0) {
      facultyIdsInScope = ["00000000-0000-0000-0000-000000000000"]; // empty sentinel
    }
  }

  let assignmentsQuery = supabase
    .from("faculty_assignments")
    .select("id, title, description, due_at, submitted_at, faculty_id, status")
    .in("status", ["pending_hod", "changes_requested"])
    .order("submitted_at", { ascending: true, nullsFirst: false });
  if (facultyIdsInScope) {
    assignmentsQuery = assignmentsQuery.in("faculty_id", facultyIdsInScope);
  }

  let announcementsQuery = supabase
    .from("announcements")
    .select("id, title, body, target_batch_ids, submitted_at, faculty_id, status")
    .in("status", ["pending_hod", "changes_requested"])
    .order("submitted_at", { ascending: true, nullsFirst: false });
  if (facultyIdsInScope) {
    announcementsQuery = announcementsQuery.in("faculty_id", facultyIdsInScope);
  }

  let classSessionsQuery = supabase
    .from("class_sessions")
    .select(
      "id, topic, scheduled_at, duration_minutes, batch_id, location, notes, submitted_at, faculty_id, approval_status",
    )
    .in("approval_status", ["pending_hod", "changes_requested"])
    .order("submitted_at", { ascending: true, nullsFirst: false });
  if (facultyIdsInScope) {
    classSessionsQuery = classSessionsQuery.in("faculty_id", facultyIdsInScope);
  }

  const [assignmentsRes, announcementsRes, classSessionsRes] = await Promise.all([
    assignmentsQuery,
    announcementsQuery,
    classSessionsQuery,
  ]);
  const data = assignmentsRes.data;
  const error = assignmentsRes.error ?? announcementsRes.error ?? classSessionsRes.error;
  const announcementsData = announcementsRes.data ?? [];
  const classSessionsData = classSessionsRes.data ?? [];

  const rows = (data ?? []) as Array<
    Pick<
      PendingAssignment,
      "id" | "title" | "description" | "due_at" | "submitted_at" | "faculty_id"
    > & { status: string }
  >;

  type AnnouncementRow = {
    id: string;
    title: string;
    body: string | null;
    target_batch_ids: string[];
    submitted_at: string | null;
    faculty_id: string;
    status: string;
  };
  const announcementRows = announcementsData as AnnouncementRow[];

  type ClassSessionRow = {
    id: string;
    topic: string;
    scheduled_at: string;
    duration_minutes: number;
    batch_id: string | null;
    location: string | null;
    notes: string | null;
    submitted_at: string | null;
    faculty_id: string;
    approval_status: string;
  };
  const classSessionRows = classSessionsData as ClassSessionRow[];

  // Hydrate faculty names in one query so we don't do N round-trips.
  const facultyIds = Array.from(
    new Set([
      ...rows.map((r) => r.faculty_id),
      ...announcementRows.map((r) => r.faculty_id),
      ...classSessionRows.map((r) => r.faculty_id),
    ]),
  );
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

  // Hydrate batch names for the announcement target list + class sessions.
  const batchIds = Array.from(
    new Set([
      ...announcementRows.flatMap((r) => r.target_batch_ids),
      ...classSessionRows.map((r) => r.batch_id).filter((v): v is string => Boolean(v)),
    ]),
  );
  const batchNameById = new Map<string, string>();
  if (batchIds.length > 0) {
    const { data: batchRows } = await supabase
      .from("batches")
      .select("id, name")
      .in("id", batchIds);
    for (const b of batchRows ?? []) {
      batchNameById.set(b.id, b.name);
    }
  }

  const queueIsEmpty =
    rows.length === 0 && announcementRows.length === 0 && classSessionRows.length === 0;

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
      ) : queueIsEmpty ? (
        <div className="border-border bg-muted/40 rounded-md border p-6 text-center text-sm">
          Queue is empty — nothing pending review right now.
        </div>
      ) : (
        <>
          {rows.length > 0 ? (
            <section aria-label="Pending assignments" className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Assignments ({rows.length})
              </h2>
              <ul className="flex flex-col gap-4">
                {rows.map((r) => {
                  const faculty = facultyById.get(r.faculty_id) ?? null;
                  const facultyName =
                    faculty?.nickname || faculty?.full_name || "(unknown faculty)";
                  return (
                    <li
                      key={r.id}
                      className="border-border flex flex-col gap-3 rounded-md border p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-heading text-lg font-medium">{r.title}</h3>
                        <span className="text-muted-foreground text-xs">
                          {r.status === "changes_requested" ? "Awaiting revision · " : ""}
                          Submitted{" "}
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
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
                      <DecisionBar id={r.id} kind="assignment" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {announcementRows.length > 0 ? (
            <section aria-label="Pending announcements" className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Announcements ({announcementRows.length})
              </h2>
              <ul className="flex flex-col gap-4">
                {announcementRows.map((r) => {
                  const faculty = facultyById.get(r.faculty_id) ?? null;
                  const facultyName =
                    faculty?.nickname || faculty?.full_name || "(unknown faculty)";
                  const targetNames =
                    r.target_batch_ids.length === 0
                      ? "Whole institution"
                      : r.target_batch_ids
                          .map((id) => batchNameById.get(id) ?? "(unknown batch)")
                          .join(" · ");
                  return (
                    <li
                      key={r.id}
                      className="border-border flex flex-col gap-3 rounded-md border p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-heading text-lg font-medium">{r.title}</h3>
                        <span className="text-muted-foreground text-xs">
                          {r.status === "changes_requested" ? "Awaiting revision · " : ""}
                          Submitted{" "}
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        By {facultyName} · Target: {targetNames}
                      </p>
                      {r.body ? (
                        <p className="text-foreground/90 whitespace-pre-wrap">{r.body}</p>
                      ) : (
                        <p className="text-muted-foreground text-xs italic">No body</p>
                      )}
                      <DecisionBar id={r.id} kind="announcement" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {classSessionRows.length > 0 ? (
            <section aria-label="Pending class sessions" className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Class schedule ({classSessionRows.length})
              </h2>
              <ul className="flex flex-col gap-4">
                {classSessionRows.map((r) => {
                  const faculty = facultyById.get(r.faculty_id) ?? null;
                  const facultyName = faculty?.nickname || faculty?.full_name || "(unknown author)";
                  const batchName = r.batch_id
                    ? (batchNameById.get(r.batch_id) ?? "(unknown batch)")
                    : "Whole institution";
                  return (
                    <li
                      key={r.id}
                      className="border-border flex flex-col gap-3 rounded-md border p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-heading text-lg font-medium">{r.topic}</h3>
                        <span className="text-muted-foreground text-xs">
                          {r.approval_status === "changes_requested" ? "Awaiting revision · " : ""}
                          Submitted{" "}
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        By {facultyName} · Batch: {batchName}
                        {r.location ? ` · ${r.location}` : ""}
                      </p>
                      <p className="text-foreground/90 text-sm">
                        {new Date(r.scheduled_at).toLocaleString()} · {r.duration_minutes} min
                      </p>
                      {r.notes ? (
                        <p className="text-foreground/90 whitespace-pre-wrap">{r.notes}</p>
                      ) : null}
                      <DecisionBar id={r.id} kind="class_session" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
