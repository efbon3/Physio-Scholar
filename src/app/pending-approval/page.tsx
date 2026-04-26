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
    .select("approved_at, is_admin, full_name, roll_number, year_of_study")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin || profile?.approved_at) {
    redirect("/today");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Pending approval</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Waiting on admin verification
        </h1>
      </header>

      <p className="text-muted-foreground text-sm leading-7">
        Thanks for signing up. Access to Physio-Scholar is gated — an administrator needs to verify
        your details before you can start studying. You&apos;ll be able to sign in normally once
        you&apos;re approved.
      </p>

      <section
        aria-label="Your details"
        className="border-border bg-muted/30 flex w-full flex-col gap-1 rounded-md border p-4 text-left text-sm"
      >
        <DetailRow label="Email" value={user.email ?? "—"} />
        <DetailRow label="Name" value={profile?.full_name ?? "(not set)"} />
        <DetailRow label="Roll number" value={profile?.roll_number ?? "(not set)"} />
        <DetailRow
          label="Year"
          value={
            profile?.year_of_study !== undefined && profile?.year_of_study !== null
              ? `${profile.year_of_study}`
              : "(not set)"
          }
        />
      </section>

      <p className="text-muted-foreground text-xs">
        Missing details above? Email the admin so they can verify you — or sign out, sign back in,
        and complete your profile under Settings before approval lands.
      </p>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground text-xs tracking-widest uppercase">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
