import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { AnnouncementForm, type BatchOption } from "./announcement-form";
import { AnnouncementRowActions } from "./row-actions";

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
  title: "Announcements · Faculty",
};

/**
 * Faculty announcements page. List + create. Same shape as
 * /faculty/assignments — drafts go to the HOD queue when submitted;
 * approved announcements show on student dashboards (filtered by
 * target_batch_ids).
 */
export default async function FacultyAnnouncementsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty/announcements");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id, full_name, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");
  if (!profile.institution_id) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-destructive text-sm">
          Your profile isn&apos;t linked to an institution yet — ask an admin to set institution_id
          before you can post announcements.
        </p>
      </main>
    );
  }

  const [{ data: rows, error }, { data: batchRows }] = await Promise.all([
    supabase
      .from("announcements")
      .select(
        "id, title, body, target_batch_ids, faculty_id, status, decision_comment, submitted_at, created_at",
      )
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("batches")
      .select("id, name, year_of_study")
      .eq("institution_id", profile.institution_id)
      .order("year_of_study", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
  ]);

  const batches: BatchOption[] = (batchRows ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    year_of_study: b.year_of_study,
  }));
  const batchById = new Map(batches.map((b) => [b.id, b]));

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground text-sm">
          Short notices for students. Pick specific batches or leave the picker empty to broadcast
          to your whole institution. Drafts go through HOD review before students see them.
        </p>
      </header>

      <section
        aria-label="Create announcement"
        className="border-input flex flex-col gap-3 rounded-md border p-4"
      >
        <h2 className="font-heading text-lg font-medium">New announcement</h2>
        <AnnouncementForm batches={batches} />
      </section>

      <section aria-label="All announcements" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">
          All announcements ({rows?.length ?? 0})
        </h2>
        {rows && rows.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {rows.map((a) => {
              const isOwner = a.faculty_id === user.id;
              const statusTone = STATUS_TONE[a.status] ?? "border-input bg-muted";
              const statusLabel = STATUS_LABEL[a.status] ?? a.status;
              const canSubmit =
                isOwner && (a.status === "draft" || a.status === "changes_requested");
              const targetNames =
                a.target_batch_ids.length === 0
                  ? "Whole institution"
                  : a.target_batch_ids
                      .map((id) => batchById.get(id)?.name ?? "(unknown batch)")
                      .join(" · ");
              return (
                <li key={a.id} className="border-input flex flex-col gap-2 rounded-md border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-heading text-base font-medium">{a.title}</h3>
                    <p className="text-muted-foreground text-xs">{targetNames}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${statusTone}`}
                      aria-label={`Status: ${statusLabel}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  {a.body ? <p className="text-sm whitespace-pre-wrap">{a.body}</p> : null}
                  {a.decision_comment &&
                  (a.status === "rejected" || a.status === "changes_requested") ? (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                      <p className="font-medium">HOD note</p>
                      <p className="mt-1 whitespace-pre-wrap">{a.decision_comment}</p>
                    </div>
                  ) : null}
                  {isOwner ? (
                    <AnnouncementRowActions id={a.id} title={a.title} canSubmit={canSubmit} />
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Authored by another faculty member.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No announcements yet — use the form above to draft the first one.
          </p>
        )}
      </section>

      <footer className="border-border border-t pt-4">
        <Link href="/faculty">
          <Button variant="ghost" size="sm">
            Back to Faculty hub
          </Button>
        </Link>
      </footer>
    </main>
  );
}
