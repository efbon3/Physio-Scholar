import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { AssignmentForm } from "./assignment-form";
import { DeleteAssignmentButton } from "./delete-button";

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

  const { data: rows, error } = await supabase
    .from("faculty_assignments")
    .select("id, title, description, due_at, created_at, faculty_id")
    .eq("institution_id", profile.institution_id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

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
        <AssignmentForm />
      </section>

      <section aria-label="All assignments" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">All assignments ({rows?.length ?? 0})</h2>
        {rows && rows.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {rows.map((a) => (
              <li key={a.id} className="border-input flex flex-col gap-2 rounded-md border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-base font-medium">{a.title}</h3>
                  <p className="text-muted-foreground text-xs">
                    {a.due_at ? `Due ${formatDateTime(a.due_at)}` : "No deadline"}
                  </p>
                </div>
                {a.description ? (
                  <p className="text-sm whitespace-pre-wrap">{a.description}</p>
                ) : null}
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                  <Link
                    href={`/faculty/assignments/${a.id}/engagement`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    View engagement →
                  </Link>
                  {a.faculty_id === user.id ? (
                    <DeleteAssignmentButton id={a.id} />
                  ) : (
                    <span>Authored by another faculty member.</span>
                  )}
                </div>
              </li>
            ))}
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
