import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SystemSelectorForm } from "./system-selector-form";

export const metadata = {
  title: "Settings",
};

const ALL_SYSTEMS = [
  "cardiovascular",
  "respiratory",
  "renal",
  "gastrointestinal",
  "endocrine",
  "nervous",
  "musculoskeletal",
  "reproductive",
  "blood",
  "immune",
  "integumentary",
] as const;

/**
 * Settings page — currently a single surface for the per-student
 * "active organ systems" preference (J0). More preferences will land
 * here as Phase J progresses; the page is built as a single flat form
 * for now since one setting doesn't justify subnav.
 *
 * Defaults: in CI / preview envs without Supabase, we render the form
 * with all systems checked so the page stays interactive end-to-end.
 */
export default async function SettingsPage() {
  let activeSystems: string[] = [...ALL_SYSTEMS];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) redirect("/login?next=/settings");

      const { data: profile } = await supabase
        .from("profiles")
        .select("study_systems")
        .eq("id", user.id)
        .single();
      if (profile?.study_systems && profile.study_systems.length > 0) {
        activeSystems = profile.study_systems;
      }
    } catch {
      // Supabase unreachable — render with the all-on default.
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Settings</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          What are you studying?
        </h1>
        <p className="text-muted-foreground text-sm leading-7">
          Pick the organ systems you want in your review queue. Cards from any system you uncheck
          are hidden from review and exam mode until you turn the system back on. The system itself
          stays browsable from the Systems tab — this is just for your active recall load.
        </p>
      </header>

      <SystemSelectorForm
        allSystems={ALL_SYSTEMS as unknown as string[]}
        initiallyChecked={activeSystems}
      />
    </main>
  );
}
