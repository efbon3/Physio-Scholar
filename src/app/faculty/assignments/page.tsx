import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { AssignmentForm, type AssignmentBatchOption } from "./assignment-form";
import { DeleteAssignmentButton } from "./delete-button";
import { SubmitForReviewButton } from "./submit-button";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending_hod: "Pending HOD",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

const STATUS_TONE: Record<string, string> = {
  draft: "border-input bg-muted text-muted-foreground",
  pending_hod: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-rose-300 bg-rose-50 text-rose-900",
  changes_requested: "border-amber-300 bg-amber-50 text-amber-900",
};

export const metadata = {
  title: "Faculty assignments",
};

/**
 * Faculty + admin surface for creating and managing institution-wide
 * homework assignments. Students don't have a write path; they read
 * the same rows on /today via the FacultyHomeworkCard.
 *
 * This page lives outside /admin/* so admin-only gating doesn't kick
 * out faculty. Authorization happens here at the page level: any
 * authenticated user reaches the route, but only faculty / admin
 * users see the controls. Everyone else gets bounced to /today.
 *
 * RLS still polices every read and write — the inline checks below
 * are about producing a clean redirect rather than a wall of "you
 * have no rows" empty states for unauthorized callers.
 */
export default async function FacultyAssignmentsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/today");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty/assignments");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id, full_name, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.is_faculty && !profile?.is_admin) {
    redirect("/today");
  }
  if (!profile.institution_id) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-destructive text-sm">
          Your profile isn&apos;t linked to an institution yet — ask an admin to set institution_id
          before you can create assignments.
        </p>
      </main>
    );
  }

  const [{ data: rows, error }, { data: batchRows }] = await Promise.all([
    supabase
      .from("faculty_assignments")
      .select(
        "id, title, description, due_at, created_at, faculty_id, status, decision_comment, submitted_at, target_batch_ids, max_marks, link_url",
      )
      .eq("institution_id", profile.institution_id)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("batches")
      .select("id, name, year_of_study")
      .eq("institution_id", profile.institution_id)
      .order("year_of_study", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
  ]);
  const batches: AssignmentBatchOption[] = (batchRows ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    year_of_study: b.year_of_study,
  }));
  const batchById = new Map(batches.map((b) => [b.id, b]));

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground text-sm">
          Reading or task lists for everyone in your institution. They show up on each
          student&apos;s dashboard until the due date passes or you delete them.
        </p>
      </header>

      <section
        aria-label="Create assignment"
        className="border-input flex flex-col gap-3 rounded-md border p-4"
      >
        <h2 className="font-heading text-lg font-medium">New assignment</h2>
        <AssignmentForm batches={batches} />
      </section>

      <section aria-label="All assignments" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">All assignments ({rows?.length ?? 0})</h2>
        {rows && rows.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {rows.map((a) => {
              const isOwner = a.faculty_id === user.id;
              const statusTone = STATUS_TONE[a.status] ?? "border-input bg-muted";
              const statusLabel = STATUS_LABEL[a.status] ?? a.status;
              const canSubmit =
                isOwner && (a.status === "draft" || a.status === "changes_requested");
              const targetIds: string[] = a.target_batch_ids ?? [];
              const targetNames =
                targetIds.length === 0
                  ? "Whole institution"
                  : targetIds.map((id) => batchById.get(id)?.name ?? "(unknown batch)").join(" · ");
              return (
                <li key={a.id} className="border-input flex flex-col gap-2 rounded-md border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-heading text-base font-medium">{a.title}</h3>
                    <p className="text-muted-foreground text-xs">
                      {a.due_at ? `Due ${formatDateTime(a.due_at)}` : "No deadline"}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">Target: {targetNames}</p>
                  <p className="text-muted-foreground text-[10px]">
                    Posted {new Date(a.created_at).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${statusTone}`}
                      aria-label={`Status: ${statusLabel}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  {a.description ? (
                    <p className="text-sm whitespace-pre-wrap">{a.description}</p>
                  ) : null}
                  {a.link_url ? (
                    <a
                      href={a.link_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary text-xs underline-offset-2 hover:underline"
                    >
                      {a.link_url}
                    </a>
                  ) : null}
                  {a.decision_comment &&
                  (a.status === "rejected" || a.status === "changes_requested") ? (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                      <p className="font-medium">HOD note</p>
                      <p className="mt-1 whitespace-pre-wrap">{a.decision_comment}</p>
                    </div>
                  ) : null}
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    {a.status === "approved" ? (
                      <Link
                        href={`/faculty/assignments/${a.id}/engagement`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        View engagement →
                      </Link>
                    ) : null}
                    {a.max_marks !== null && a.status === "approved" ? (
                      <Link
                        href={`/faculty/assignments/${a.id}/marks`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Enter marks →
                      </Link>
                    ) : null}
                    {a.max_marks !== null ? <span>Out of {Number(a.max_marks)} marks</span> : null}
                    {canSubmit ? <SubmitForReviewButton assignmentId={a.id} /> : null}
                    {isOwner ? (
                      <DeleteAssignmentButton id={a.id} />
                    ) : (
                      <span>Authored by another faculty member.</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No assignments yet — use the form above to create the first one.
          </p>
        )}
      </section>

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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 16).replace("T", " ");
}
