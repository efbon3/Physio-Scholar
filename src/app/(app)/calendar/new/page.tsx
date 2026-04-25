import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PersonalEventForm } from "./personal-event-form";

export const metadata = {
  title: "Add personal event",
};

/**
 * Student-facing form for adding a personal calendar event (a self-set
 * mock test, a milestone, etc). The event is owner-scoped — only the
 * student who created it ever sees it.
 *
 * Faculty members who want to author institution-wide events use
 * /admin/calendar instead (different surface, different RLS).
 */
export default async function NewPersonalEventPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) redirect("/login?next=/calendar/new");
    } catch {
      // Supabase unreachable — fall through to the form, the action
      // will surface a graceful error if the user tries to submit.
    }
  }
  return <PersonalEventForm />;
}
