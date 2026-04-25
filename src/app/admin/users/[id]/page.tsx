import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "User · Admin",
};

/**
 * Admin → user detail page.
 *
 * Surfaces every profile field — including DOB and address, which the
 * J4 privacy posture restricts to "owner + admin only". The admin
 * layout already gates entry, so this route renders the full row.
 *
 * Recent review aggregate (count + last activity) gives the admin a
 * quick read on whether the learner is engaging.
 */
type Params = { id: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function AdminUserDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, roll_number, date_of_birth, address, phone, avatar_url, year_of_study, institution_id, is_admin, is_faculty, consent_terms_accepted_at, consent_privacy_accepted_at, consent_analytics, created_at, updated_at, deletion_requested_at",
    )
    .eq("id", id)
    .single();

  if (error || !profile) notFound();

  const [{ count: reviewCount }, { data: latestReview }] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("profile_id", id),
    supabase
      .from("reviews")
      .select("created_at")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin · User</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {profile.full_name ?? "(no name)"}
        </h1>
        <p className="text-muted-foreground font-mono text-xs">{profile.id}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {profile.is_admin ? (
            <span className="bg-primary/10 rounded-full border px-2 py-0.5">Admin</span>
          ) : null}
          {profile.is_faculty ? (
            <span className="rounded-full border bg-emerald-100 px-2 py-0.5">Faculty</span>
          ) : null}
          {!profile.is_admin && !profile.is_faculty ? (
            <span className="text-muted-foreground rounded-full border px-2 py-0.5">Learner</span>
          ) : null}
        </div>
      </header>

      <section aria-label="Personal details" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Roll number" value={profile.roll_number} />
        <Field label="Year of study" value={profile.year_of_study} />
        <Field label="Date of birth" value={profile.date_of_birth} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Address" value={profile.address} className="sm:col-span-2" />
        <Field
          label="Institution"
          value={profile.institution_id}
          className="font-mono text-xs sm:col-span-2"
        />
      </section>

      <section
        aria-label="Activity"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <h2 className="font-heading text-lg font-medium">Activity</h2>
        <p className="text-sm">
          <strong className="font-medium">{reviewCount ?? 0}</strong> total reviews
        </p>
        <p className="text-sm">
          Last review:{" "}
          <span className="font-mono text-xs">{latestReview?.created_at ?? "never"}</span>
        </p>
      </section>

      <section
        aria-label="DPDPA + lifecycle"
        className="border-input flex flex-col gap-2 rounded-md border p-4 text-sm"
      >
        <h2 className="font-heading text-lg font-medium">Account state</h2>
        <p>
          Joined: <span className="font-mono text-xs">{profile.created_at}</span>
        </p>
        <p>
          Last update: <span className="font-mono text-xs">{profile.updated_at}</span>
        </p>
        <p>
          Terms accepted:{" "}
          <span className="font-mono text-xs">{profile.consent_terms_accepted_at ?? "—"}</span>
        </p>
        <p>
          Privacy accepted:{" "}
          <span className="font-mono text-xs">{profile.consent_privacy_accepted_at ?? "—"}</span>
        </p>
        <p>Analytics consent: {profile.consent_analytics ? "granted" : "declined"}</p>
        {profile.deletion_requested_at ? (
          <p className="text-destructive">
            Deletion requested at{" "}
            <span className="font-mono text-xs">{profile.deletion_requested_at}</span> — purge
            cascade pending.
          </p>
        ) : null}
      </section>

      <div>
        <Link
          href="/admin/users"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back to users
        </Link>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      <p className="text-muted-foreground text-xs tracking-widest uppercase">{label}</p>
      <p className="text-sm">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}
