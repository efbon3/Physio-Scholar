import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = {
  title: "Complete your profile",
};

/**
 * First-run profile-completion form. Sits between signup and
 * /pending-approval — once the learner submits this, the (app)
 * layout's gate moves them onto the admin-approval holding page.
 *
 * This route is deliberately outside the (app) layout so the gate's
 * /complete-profile redirect doesn't loop. We re-check auth here
 * because middleware can be a pass-through in CI / preview envs.
 *
 * Behaviour:
 *   - No Supabase env (CI / preview) → bounce to /today (no auth at all).
 *   - Anonymous → /login.
 *   - Already completed profile → /today (the gate will sort approval).
 *   - Otherwise → render the form, prefilled with whatever the
 *     `handle_new_user` trigger or signup action wrote.
 */
export default async function CompleteProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/today");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, nickname, phone, college_name, roll_number, date_of_birth, address, avatar_url, profile_completed_at, is_admin, rejected_at",
    )
    .eq("id", user.id)
    .single();

  // Rejection is terminal — they can't fill in / re-fill in their
  // profile after the admin denied access. Send them to the
  // access-denied page; the gate will keep them there.
  if (profile?.rejected_at) {
    redirect("/access-denied");
  }
  if (profile?.is_admin || profile?.profile_completed_at) {
    redirect("/today");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Step 1 of 2</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Complete your profile
        </h1>
        <p className="text-muted-foreground text-sm">
          A few details so the admin can verify you. After you submit this, your account moves into
          the approval queue — you&apos;ll be able to start studying as soon as someone approves
          you.
        </p>
        <p className="text-muted-foreground text-xs">
          Signed in as <span className="font-medium">{user.email}</span>.
        </p>
      </header>

      <CompleteProfileForm
        userId={user.id}
        snapshot={{
          fullName: profile?.full_name ?? "",
          nickname: profile?.nickname ?? "",
          phone: profile?.phone ?? "",
          collegeName: profile?.college_name ?? "",
          rollNumber: profile?.roll_number ?? "",
          dateOfBirth: profile?.date_of_birth ?? "",
          address: profile?.address ?? "",
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />

      <footer className="border-border border-t pt-4">
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </footer>
    </main>
  );
}
