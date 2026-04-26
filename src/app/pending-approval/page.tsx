import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pending approval",
};

/**
 * Holding-pattern page for signed-in learners whose profiles haven't
 * been approved by an admin yet. The (app) layout's
 * `requireApprovedUser()` redirects here from any learner surface,
 * so this page must NOT itself enforce approval — it deliberately
 * sits outside the (app) layout group at the top-level so the gate
 * can resolve.
 *
 * Behaviour:
 *   - Anonymous → bounce to /login (this page is for signed-in users
 *     who happen to be unapproved).
 *   - Already approved or admin → bounce to /today (no point holding
 *     them here).
 *   - Otherwise → show the explainer + sign-out button.
 */
export default async function PendingApprovalPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // No Supabase env (CI / preview) — there's no auth state to gate
    // on. Send to the dashboard since the rest of the app is open.
    redirect("/today");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved_at, is_admin, profile_completed_at")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin || profile?.approved_at) {
    redirect("/today");
  }
  // Haven't filled in the form yet — send them through it first.
  if (!profile?.profile_completed_at) {
    redirect("/complete-profile");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <p className="text-base leading-7">
        Admin will verify your credentials before you can log in.
      </p>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </main>
  );
}
