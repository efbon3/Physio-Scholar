import Link from "next/link";

import { signOutAction } from "@/app/(auth)/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/**
 * Landing page. Anonymous visitors see the create-account / sign-in
 * prompts; signed-in users see a "Start review" CTA pointing at the
 * session screen, and a small sign-out affordance.
 *
 * Before this, post-login users landed on the same anon UI and
 * typically re-clicked "Sign in" thinking auth hadn't worked — there
 * was no visible signal that they were already in.
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Physio-Scholar</h1>

      {user ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Link href="/review" className={cn(buttonVariants({ size: "lg" }))}>
              Start review
            </Link>
            <Link
              href="/systems"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Browse mechanisms
            </Link>
          </div>
          <form action={signOutAction} className="self-start">
            <button
              type="submit"
              className="text-muted-foreground text-sm underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Create account
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Sign in
          </Link>
        </div>
      )}
    </main>
  );
}
