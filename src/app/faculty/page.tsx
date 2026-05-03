import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Faculty",
};

/**
 * Faculty hub. The role-gated landing page that the sidebar's
 * "Faculty" tab points at. Lists the surfaces a faculty member can
 * use today (cohort analytics, assignments) plus a placeholder for
 * the per-student drill-down that Phase 2 of this work will add.
 *
 * Auth-gated inline: any authenticated user can reach the route,
 * but only profiles with is_faculty = true (or is_admin = true) see
 * the controls. Everyone else bounces to /today.
 *
 * RLS still polices every downstream surface — the inline check
 * below is about a clean redirect rather than a wall of "you have
 * no rows" empty states.
 */
export default async function FacultyHubPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id, department_id, role, full_name, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");

  const role = profile.role ?? "student";
  const isHod = role === "hod";
  const isAdmin = Boolean(profile.is_admin);
  const greetingName = profile.nickname || profile.full_name || "there";
  const noInstitution = profile.is_faculty && !profile.institution_id;
  const roleLabel = isAdmin ? "Admin" : isHod ? "HOD" : "Faculty";

  // HOD-specific data: pending approval count + their department's
  // metadata. Admins also see these tiles since they share the
  // approval / department-management responsibilities.
  let pendingApprovalCount: number | null = null;
  let departmentName: string | null = null;
  let departmentMemberCount: number | null = null;

  if (isHod || isAdmin) {
    // Pending count — scoped by department for HOD, institution-wide
    // for admin. Mirrors the page-level filtering on /faculty/approvals.
    // Counts both publishable kinds (assignments + announcements).
    const buildCountQuery = (table: "faculty_assignments" | "announcements") => {
      let q = supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_hod");
      if (isHod && !isAdmin && profile.department_id) {
        // facultyIds populated below — short-circuit when empty.
      } else if (profile.institution_id) {
        q = q.eq("institution_id", profile.institution_id);
      }
      return q;
    };

    let facultyIdsForScope: string[] | null = null;
    if (isHod && !isAdmin && profile.department_id) {
      const { data: deptFaculty } = await supabase
        .from("profiles")
        .select("id")
        .eq("department_id", profile.department_id);
      facultyIdsForScope = (deptFaculty ?? []).map((f) => f.id);
      if (facultyIdsForScope.length === 0) {
        facultyIdsForScope = ["00000000-0000-0000-0000-000000000000"];
      }
    }

    let assignmentsCountQuery = buildCountQuery("faculty_assignments");
    let announcementsCountQuery = buildCountQuery("announcements");
    if (facultyIdsForScope) {
      assignmentsCountQuery = assignmentsCountQuery.in("faculty_id", facultyIdsForScope);
      announcementsCountQuery = announcementsCountQuery.in("faculty_id", facultyIdsForScope);
    }
    const [{ count: assignCount }, { count: announceCount }] = await Promise.all([
      assignmentsCountQuery,
      announcementsCountQuery,
    ]);
    pendingApprovalCount = (assignCount ?? 0) + (announceCount ?? 0);
  }

  if (isHod && profile.department_id) {
    const [{ data: dept }, { count: memberCount }] = await Promise.all([
      supabase.from("departments").select("name").eq("id", profile.department_id).single(),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("department_id", profile.department_id),
    ]);
    departmentName = dept?.name ?? null;
    departmentMemberCount = memberCount ?? 0;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">{roleLabel}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Welcome, {greetingName}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isHod
            ? "Your department's faculty submit work here for your review. Approve, request changes, or reject — students see only what you've approved."
            : "The surfaces below are scoped to your institution. Students remain anonymous to other students; you see your cohort."}
        </p>
      </header>

      {noInstitution ? (
        <div className="border-destructive/50 bg-destructive/5 rounded-md border p-4 text-sm">
          <p className="font-medium">Profile not linked to an institution</p>
          <p className="text-muted-foreground mt-1">
            Ask an admin to set your <code>institution_id</code>. Until then, the cohort and
            assignment surfaces will show empty results.
          </p>
        </div>
      ) : null}

      {isHod && !profile.department_id ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="font-medium">No department assigned</p>
          <p className="text-muted-foreground mt-1">
            You&apos;re flagged as HOD but no department is assigned to your profile. Ask an admin
            to set it on <code>/admin/users</code>. Until then, the approval queue will be empty.
          </p>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        {(isHod || isAdmin) && pendingApprovalCount !== null ? (
          <FacultyCard
            title={`Approval queue${pendingApprovalCount > 0 ? ` (${pendingApprovalCount})` : ""}`}
            description={
              pendingApprovalCount > 0
                ? `${pendingApprovalCount} assignment${pendingApprovalCount === 1 ? "" : "s"} waiting for your review. Approve to publish; request changes or reject with a comment.`
                : "Nothing pending right now. New faculty submissions will appear here."
            }
            href="/faculty/approvals"
            cta={pendingApprovalCount > 0 ? "Review queue" : "Open queue"}
            tone={pendingApprovalCount > 0 ? "amber" : undefined}
          />
        ) : null}
        {isHod && departmentName ? (
          <FacultyCard
            title={`Department · ${departmentName}`}
            description={`${departmentMemberCount ?? 0} member${
              departmentMemberCount === 1 ? "" : "s"
            } in your department. The HOD picker on /admin/departments tracks the head; faculty land here once an admin sets their department_id.`}
            href="/admin/departments"
            cta="Manage department"
          />
        ) : null}
        <FacultyCard
          title="Cohort analytics"
          description="Roster + per-Chapter retention heatmap for your institution. See where the class is strong and where it's slipping."
          href="/admin/cohort"
          cta="Open cohort"
        />
        <FacultyCard
          title="Assignments"
          description="Create homework — pick a Chapter, set a due date, optionally point to a specific format. Drafts go to the HOD queue before students see them."
          href="/faculty/assignments"
          cta="Manage assignments"
        />
        <FacultyCard
          title="Announcements"
          description="Short notices for students — broadcast to the whole institution or target specific batches. Drafts go through HOD review before students see them."
          href="/faculty/announcements"
          cta="Manage announcements"
        />
        <FacultyCard
          title="Schedule &amp; attendance"
          description="Plan classes and mark attendance once each session is held. Students see upcoming sessions on their dashboard."
          href="/faculty/schedule"
          cta="Open schedule"
        />
        <FacultyCard
          title="Per-student progress"
          description="Drill into a single student — their Chapter-by-Chapter mastery, recent activity, and which topics they're slipping on. The struggler-first sort surfaces who needs your attention."
          href="/faculty/students"
          cta="Open students"
        />
      </section>
    </main>
  );
}

function FacultyCard({
  title,
  description,
  href,
  cta,
  disabled = false,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  disabled?: boolean;
  tone?: "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/40"
      : "border-border bg-card";
  return (
    <article className={cn("flex flex-col gap-3 rounded-md border p-4", toneClass)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      <div className="mt-auto">
        {disabled ? (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "pointer-events-none opacity-50",
            )}
          >
            {cta}
          </span>
        ) : (
          <Link href={href} className={cn(buttonVariants({ size: "sm" }))}>
            {cta}
          </Link>
        )}
      </div>
    </article>
  );
}
