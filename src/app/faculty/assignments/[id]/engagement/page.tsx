import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Assignment engagement · Faculty",
};

type EngagementRow = {
  profile_id: string;
  full_name: string | null;
  nickname: string | null;
  year_of_study: number | null;
  reviews_since_assignment: number;
  last_review_at: string | null;
};

const INACTIVE_DAYS_THRESHOLD = 7;

/**
 * Per-assignment engagement view. Faculty drops in to find out who
 * has and hasn't engaged with the platform since the assignment
 * went live.
 *
 * v1 caveat: assignments don't carry a target Chapter yet, so
 * "engagement" is "any activity during the window" rather than a
 * proper Chapter-targeted completion. The page surfaces the count
 * and last-activity for each student; faculty correlates with the
 * assignment topic in their head. The strugglers (zero reviews
 * since drop, or no activity in the last 7d of the window) get
 * highlighted at the top of the table so the eye lands on them.
 */
export default async function AssignmentEngagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const { id: assignmentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/faculty/assignments/${assignmentId}/engagement`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");

  // Fetch the assignment + per-student engagement in parallel. The
  // RPC's auth gate handles cross-institution peek — the SELECT here
  // is a separate read for header metadata that's ALSO institution-
  // scoped via the existing assignments RLS policy. If the caller
  // isn't allowed to see the assignment, they get null/empty data
  // back and the page renders 404.
  const [assignmentRes, engagementRes] = await Promise.all([
    supabase
      .from("faculty_assignments")
      .select("id, title, description, due_at, created_at, faculty_id, institution_id")
      .eq("id", assignmentId)
      .maybeSingle(),
    supabase.rpc("assignment_engagement", { p_assignment_id: assignmentId }),
  ]);

  if (!assignmentRes.data) notFound();
  const assignment = assignmentRes.data;
  const rows = (engagementRes.data ?? []) as EngagementRow[];

  // Sort: zero reviews first (need attention), then ascending by
  // count, ties broken by last activity oldest-first.
  const sorted = [...rows].sort((a, b) => {
    if (a.reviews_since_assignment !== b.reviews_since_assignment) {
      return a.reviews_since_assignment - b.reviews_since_assignment;
    }
    const at = a.last_review_at ? Date.parse(a.last_review_at) : 0;
    const bt = b.last_review_at ? Date.parse(b.last_review_at) : 0;
    return at - bt;
  });

  const total = rows.length;
  const zeroEngagement = rows.filter((r) => r.reviews_since_assignment === 0).length;
  const totalReviews = rows.reduce((s, r) => s + r.reviews_since_assignment, 0);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/faculty/assignments" className="underline-offset-2 hover:underline">
          ← Back to assignments
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Assignment</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground text-sm">
          Posted {formatDateTime(assignment.created_at)}
          {assignment.due_at ? ` · Due ${formatDateTime(assignment.due_at)}` : " · No deadline"}
        </p>
        {assignment.description ? (
          <p className="mt-1 text-sm whitespace-pre-wrap">{assignment.description}</p>
        ) : null}
      </header>

      <section aria-label="Headline counts">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Stat label="Students" value={`${total}`} />
          <Stat label="Zero engagement" value={`${zeroEngagement}`} />
          <Stat label="Reviews since post" value={`${totalReviews}`} />
        </dl>
      </section>

      <section aria-label="Engagement breakdown" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Per-student engagement</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          &ldquo;Reviews since post&rdquo; counts every review that student has done since you
          created this assignment, across all mechanisms. v1 doesn&apos;t yet tie an assignment to a
          specific Chapter, so a high count just means the student is generally active — correlate
          with the assignment topic in your head. Zero is the unambiguous signal: the student
          hasn&apos;t engaged with the platform at all in the assignment window.
        </p>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No students enrolled in your institution yet, or the engagement RPC returned no rows.
          </p>
        ) : (
          <div className="border-border overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs tracking-widest uppercase">
                  <th className="px-3 py-2">Learner</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">Reviews since post</th>
                  <th className="px-3 py-2">Last review</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const flagged = row.reviews_since_assignment === 0 || isStale(row.last_review_at);
                  return (
                    <tr
                      key={row.profile_id}
                      className={`border-border/40 border-t ${flagged ? "bg-amber-50/50" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/faculty/students/${row.profile_id}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {row.full_name ?? "(no name)"}
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-3 py-2">
                        {row.year_of_study ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={
                            row.reviews_since_assignment === 0 ? "font-medium text-amber-700" : ""
                          }
                        >
                          {row.reviews_since_assignment}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-3 py-2">
                        {row.last_review_at ? formatRelative(row.last_review_at) : "Never"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/faculty/students/${row.profile_id}`}
                          className="text-primary text-xs underline-offset-2 hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-md border p-3">
      <dt className="text-muted-foreground text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="font-heading text-xl font-semibold">{value}</dd>
    </div>
  );
}

function isStale(iso: string | null): boolean {
  if (!iso) return true;
  const days = (Date.now() - Date.parse(iso)) / (24 * 60 * 60 * 1000);
  return days >= INACTIVE_DAYS_THRESHOLD;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 16).replace("T", " ");
}

function formatRelative(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
