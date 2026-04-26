import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/**
 * Public landing page. Anonymous visitors see the create-account /
 * sign-in prompts. Signed-in users get redirected straight to /today
 * (the dashboard) — no intermediate "go to dashboard / start review"
 * tile screen, since the dashboard already exposes both. If the user
 * is signed in but not yet approved, the (app) layout's
 * requireApprovedUser() bounces them onward to /pending-approval.
 */
async function getCurrentUser() {
  // Same graceful fallback as the middleware: CI and unconfigured
  // Vercel previews have no Supabase env vars, so we skip the lookup
  // and render the anon UI.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/today");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Physio-Scholar</h1>

      <div className="flex flex-wrap gap-3">
        <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
          Create account
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Sign in
        </Link>
      </div>
    </main>
  );
}
