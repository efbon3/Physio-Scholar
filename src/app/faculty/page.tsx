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
    .select("is_faculty, is_admin, institution_id, full_name, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");

  const greetingName = profile.nickname || profile.full_name || "there";
  const noInstitution = profile.is_faculty && !profile.institution_id;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Welcome, {greetingName}
        </h1>
        <p className="text-muted-foreground text-sm">
          The surfaces below are scoped to your institution. Students remain anonymous to other
          students; you see your cohort.
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

      <section className="grid gap-3 sm:grid-cols-2">
        <FacultyCard
          title="Cohort analytics"
          description="Roster + per-Chapter retention heatmap for your institution. See where the class is strong and where it's slipping."
          href="/admin/cohort"
          cta="Open cohort"
        />
        <FacultyCard
          title="Assignments"
          description="Create homework — pick a Chapter, set a due date, optionally point to a specific format. Students see the assignment on their Today dashboard."
          href="/faculty/assignments"
          cta="Manage assignments"
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
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  disabled?: boolean;
}) {
  return (
    <article className="border-border bg-card flex flex-col gap-3 rounded-md border p-4">
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
