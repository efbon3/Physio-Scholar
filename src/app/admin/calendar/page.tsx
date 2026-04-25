import Link from "next/link";
import { redirect } from "next/navigation";

import { readVisibleEvents } from "@/lib/calendar/events";
import { createClient } from "@/lib/supabase/server";

import { InstitutionEventForm } from "./institution-event-form";
import { InstitutionEventList } from "./institution-event-list";

export const metadata = {
  title: "Manage calendar",
};

/**
 * Faculty / admin surface for managing institution calendar events.
 * Authoring a row writes audience='institution' with the caller's
 * institution_id; RLS guards the write at the DB layer.
 *
 * Auth posture:
 *   - Without Supabase env vars (CI / preview): renders a placeholder
 *     so the build isn't broken. The form is hidden.
 *   - With Supabase: requires sign-in. Non-faculty / non-admin users
 *     see a "you're not faculty" notice rather than the form.
 */
export default async function AdminCalendarPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Manage calendar</h1>
        <p className="border-input bg-muted/40 rounded-md border p-3 text-sm">
          Faculty calendar tools require a live Supabase project. Set NEXT_PUBLIC_SUPABASE_URL to
          enable them.
        </p>
        <Link
          href="/calendar"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back to Calendar
        </Link>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/calendar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id")
    .eq("id", user.id)
    .single();

  const canWrite = Boolean(profile?.is_faculty || profile?.is_admin);

  const events = await readVisibleEvents();
  const institutionEvents = events.filter((e) => e.audience === "institution");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Manage calendar</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Institution-wide events visible to every learner in your institution. Drives the ±14d SRS
          weighting and the dashboard&apos;s &quot;next exam&quot; widget.
        </p>
      </header>

      {!canWrite ? (
        <p className="border-input bg-muted/40 rounded-md border p-3 text-sm">
          Your profile isn&apos;t marked as faculty or admin, so you can&apos;t add institution
          events. Personal events you author at{" "}
          <Link href="/calendar/new" className="underline">
            /calendar/new
          </Link>{" "}
          are private to you. Ask your admin to grant you faculty access if institution-wide
          authoring is needed.
        </p>
      ) : !profile?.institution_id ? (
        <p className="border-input bg-muted/40 rounded-md border p-3 text-sm">
          Your profile isn&apos;t linked to an institution yet. An admin needs to set institution_id
          on your profile before institution events can be authored.
        </p>
      ) : (
        <InstitutionEventForm />
      )}

      <section aria-label="Existing institution events" className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Existing events</h2>
        <InstitutionEventList events={institutionEvents} canDelete={canWrite} />
      </section>

      <div>
        <Link
          href="/calendar"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back to Calendar
        </Link>
      </div>
    </main>
  );
}
