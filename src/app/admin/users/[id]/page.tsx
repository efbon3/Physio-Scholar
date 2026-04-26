import Link from "next/link";
import { notFound } from "next/navigation";

import { parseRequestedRole, requestedRoleLabel, REQUESTED_ROLES } from "@/lib/auth/requested-role";
import { createClient } from "@/lib/supabase/server";

import { approveUserAction, revokeApprovalAction } from "../actions";

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
      "id, full_name, nickname, roll_number, college_name, date_of_birth, address, phone, avatar_url, year_of_study, institution_id, is_admin, is_faculty, approved_at, profile_completed_at, requested_role, consent_terms_accepted_at, consent_privacy_accepted_at, consent_analytics, created_at, updated_at, deletion_requested_at",
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
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin · User</p>
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              width={64}
              height={64}
              className="border-border h-16 w-16 rounded-full border object-cover"
            />
          ) : null}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {profile.full_name ?? "(no name)"}
            </h1>
            {profile.nickname ? (
              <p className="text-muted-foreground text-sm">&ldquo;{profile.nickname}&rdquo;</p>
            ) : null}
            <p className="text-muted-foreground font-mono text-xs">{profile.id}</p>
          </div>
        </div>
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
          {profile.approved_at ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              Approved
            </span>
          ) : profile.profile_completed_at ? (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Awaiting approval
            </span>
          ) : (
            <span className="text-muted-foreground rounded-full border px-2 py-0.5">
              Profile incomplete
            </span>
          )}
        </div>
      </header>

      <section aria-label="Personal details" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nickname" value={profile.nickname} />
        <Field label="Roll number" value={profile.roll_number} />
        <Field label="College" value={profile.college_name} className="sm:col-span-2" />
        <Field label="Phone" value={profile.phone} />
        <Field label="Year of study" value={profile.year_of_study} />
        <Field label="Date of birth" value={profile.date_of_birth} />
        <Field label="Address" value={profile.address} className="sm:col-span-2" />
        <Field
          label="Institution id"
          value={profile.institution_id}
          className="font-mono text-xs sm:col-span-2"
        />
        <Field
          label="Requested role"
          value={requestedRoleLabel(parseRequestedRole(profile.requested_role))}
        />
      </section>

      <ApprovalControls profile={profile} />

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
          Profile completed:{" "}
          <span className="font-mono text-xs">{profile.profile_completed_at ?? "—"}</span>
        </p>
        <p>
          Approved at: <span className="font-mono text-xs">{profile.approved_at ?? "—"}</span>
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

/**
 * Approval / role-grant controls. We render one button per role so the
 * admin's intent is explicit — clicking "Approve as admin" is a more
 * deliberate action than a single "Approve" that silently picks up the
 * requested_role. The currently-granted role is highlighted; revoke
 * clears approval and both flags.
 */
function ApprovalControls({
  profile,
}: {
  profile: {
    id: string;
    is_admin: boolean;
    is_faculty: boolean;
    approved_at: string | null;
    profile_completed_at: string | null;
    requested_role: string;
  };
}) {
  const requested = parseRequestedRole(profile.requested_role);
  const currentRole = profile.is_admin ? "admin" : profile.is_faculty ? "faculty" : "student";
  const profileIncomplete = !profile.profile_completed_at;

  return (
    <section
      aria-label="Approval"
      className="border-input flex flex-col gap-3 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-medium">Approval</h2>
        <p className="text-muted-foreground text-xs">
          User requested <strong>{requestedRoleLabel(requested)}</strong>.{" "}
          {profile.approved_at
            ? `Currently approved as ${currentRole}.`
            : profileIncomplete
              ? "Waiting for the user to complete their profile before approval."
              : "Not yet approved."}
        </p>
      </div>

      {profileIncomplete ? null : (
        <div className="flex flex-wrap gap-2">
          {REQUESTED_ROLES.map((role) => {
            const isCurrentTier = profile.approved_at !== null && currentRole === role;
            return (
              <form
                key={role}
                action={async () => {
                  "use server";
                  await approveUserAction(profile.id, role);
                }}
              >
                <button
                  type="submit"
                  disabled={isCurrentTier}
                  className={
                    isCurrentTier
                      ? "inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-xs"
                  }
                  data-testid={`admin-grant-${role}`}
                >
                  {isCurrentTier
                    ? `${requestedRoleLabel(role)} ✓`
                    : profile.approved_at
                      ? `Switch to ${requestedRoleLabel(role).toLowerCase()}`
                      : `Approve as ${requestedRoleLabel(role).toLowerCase()}`}
                </button>
              </form>
            );
          })}

          {profile.approved_at ? (
            <form
              action={async () => {
                "use server";
                await revokeApprovalAction(profile.id);
              }}
            >
              <button
                type="submit"
                className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs"
              >
                Revoke approval
              </button>
            </form>
          ) : null}
        </div>
      )}
    </section>
  );
}
