import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Access denied",
};

/**
 * Terminal page for users whose sign-up request was rejected by an
 * admin. The (app) layout's gate redirects rejected users here from
 * any learner surface, and the page itself bounces non-rejected users
 * back to / so it can't be navigated to as a generic "logged-out" copy.
 *
 * The rejection_reason — if the admin entered one — is shown so the
 * user knows why. Their only options are sign out, or contact the
 * admin to ask for unrejection.
 */
export default async function AccessDeniedPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rejected_at, rejection_reason")
    .eq("id", user.id)
    .single();

  // Not rejected → nothing to show. Bounce home; the gate will route
  // them to the right state from there.
  if (!profile?.rejected_at) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Access denied</h1>
      </header>

      <p className="text-base leading-7">
        Your sign-up request was reviewed by an admin and not approved.
      </p>

      {profile.rejection_reason ? (
        <section
          aria-label="Reason"
          className="border-border bg-muted/30 w-full rounded-md border p-4 text-left text-sm"
        >
          <p className="text-muted-foreground text-xs tracking-widest uppercase">Reason</p>
          <p className="mt-1 whitespace-pre-wrap">{profile.rejection_reason}</p>
        </section>
      ) : null}

      <p className="text-muted-foreground text-xs">
        If you believe this was a mistake, contact the admin directly so they can review.
      </p>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </main>
  );
}
