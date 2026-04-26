import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Public landing page. Anonymous visitors pick a role first — that
 * choice flows through to /signup as `?role=…` so the form arrives
 * pre-selected. Signed-in users skip this entirely and get redirected
 * to /today; the (app) layout's gates take over from there
 * (/complete-profile → /pending-approval → /today).
 *
 * Role choice on this page is purely a hint about which queue the
 * admin should review the user in. It does NOT grant the matching
 * is_admin / is_faculty flag — that's the admin's call during
 * approval, and the 20260506 column-lock trigger blocks self-elevation
 * via the REST API too.
 */
async function getCurrentUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

type RoleTile = {
  role: "student" | "faculty" | "admin";
  title: string;
  blurb: string;
};

const ROLE_TILES: readonly RoleTile[] = [
  {
    role: "student",
    title: "I'm a student",
    blurb: "MBBS learner who wants to study with the spaced-repetition tools.",
  },
  {
    role: "faculty",
    title: "I'm faculty",
    blurb: "Teaching staff who'll review cohort progress and author content.",
  },
  {
    role: "admin",
    title: "I'm an admin",
    blurb: "Approving sign-ups, managing users, and overseeing the platform.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/today");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Physio-Scholar</h1>
        <p className="text-muted-foreground text-base">
          Mechanism-based active recall for first-year MBBS physiology.
        </p>
      </header>

      <section aria-labelledby="role-prompt" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="role-prompt" className="text-xl font-medium tracking-tight">
            Tell us who you are
          </h2>
          <p className="text-muted-foreground text-sm">
            Pick the option that fits. Faculty and admin sign-ups are subject to additional
            verification by an existing admin.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {ROLE_TILES.map((tile) => (
            <li key={tile.role}>
              <Link
                href={`/signup?role=${tile.role}`}
                className="border-input hover:bg-muted/40 flex h-full flex-col gap-2 rounded-md border p-4 transition-colors"
                data-testid={`home-role-${tile.role}`}
              >
                <span className="text-base font-medium">{tile.title}</span>
                <span className="text-muted-foreground text-xs leading-relaxed">{tile.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline-offset-2 hover:underline">
          Sign in
        </Link>
        .
      </p>
    </main>
  );
}
