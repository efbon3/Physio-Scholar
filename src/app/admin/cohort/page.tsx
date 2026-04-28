import Link from "next/link";

import {
  buildCohortHeatmap,
  type CohortCardAggregate,
  type MechanismMeta,
} from "@/lib/cohort/heatmap";
import { extractCards } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cohort · Admin",
};

/**
 * Cohort analytics — class roster + per-topic retention heatmap. Read by
 * faculty (for their institution) and admins (any institution they pick
 * via the dropdown). Uses two SECURITY DEFINER RPCs that enforce
 * `can_view_cohort()` server-side, so the page itself only has to pick
 * an institution and render.
 *
 * Phase-6-aware design: the framework is in place today; once the
 * offline-sync gate flips and reviews start landing in Supabase, the
 * roster and heatmap auto-populate. Empty-state copy makes that
 * explicit so a faculty member opening this surface in early pilot
 * doesn't think the screen is broken.
 */
export default async function AdminCohortPage({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string | string[] }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const institutionParam = Array.isArray(params.institution)
    ? params.institution[0]
    : params.institution;

  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  // Pick an institution: query param > caller's own > first available.
  let selectedInstitutionId: string | null = institutionParam ?? null;
  if (!selectedInstitutionId) {
    const { data: me } = await supabase.auth.getUser();
    if (me.user) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("id", me.user.id)
        .single();
      selectedInstitutionId = myProfile?.institution_id ?? null;
    }
  }
  if (!selectedInstitutionId && institutions && institutions.length > 0) {
    selectedInstitutionId = institutions[0].id;
  }

  type RosterRow = {
    profile_id: string;
    full_name: string | null;
    year_of_study: number | null;
    reviews_total: number;
    reviews_last_7d: number;
    retention_pct_30d: number | null;
    last_review_at: string | null;
  };
  type AggRow = {
    card_id: string;
    reviews_total: number;
    reviews_last_30d: number;
    retention_pct_30d: number | null;
    unique_learners: number;
  };

  let roster: RosterRow[] = [];
  let aggregates: AggRow[] = [];
  let rosterError: string | null = null;
  let aggregatesError: string | null = null;

  if (selectedInstitutionId) {
    const [rosterRes, aggRes] = await Promise.all([
      supabase.rpc("cohort_class_roster", { p_institution_id: selectedInstitutionId }),
      supabase.rpc("cohort_card_aggregates", { p_institution_id: selectedInstitutionId }),
    ]);
    if (rosterRes.error) rosterError = rosterRes.error.message;
    if (aggRes.error) aggregatesError = aggRes.error.message;
    roster = rosterRes.data ?? [];
    aggregates = aggRes.data ?? [];
  }

  // Build the topic heatmap from authored mechanisms + the per-card aggregates.
  const mechanisms = await readAllMechanisms();
  const cards = mechanisms.flatMap(extractCards);
  const mechanismMeta = new Map<string, MechanismMeta>();
  for (const m of mechanisms) {
    mechanismMeta.set(m.frontmatter.id, {
      mechanismId: m.frontmatter.id,
      title: m.frontmatter.title,
      organSystem: m.frontmatter.organ_system,
    });
  }
  const heatmap = buildCohortHeatmap({
    aggregates: aggregates as CohortCardAggregate[],
    cards,
    mechanismMeta,
  });

  const totalLearners = roster.length;
  const activeThisWeek = roster.filter((r) => (r.reviews_last_7d ?? 0) > 0).length;
  const totalReviews = roster.reduce((sum, r) => sum + (r.reviews_total ?? 0), 0);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Cohort analytics</h1>
        <p className="text-muted-foreground text-sm">
          Class-level retention + activity, scoped to one institution at a time.
        </p>
      </header>

      {institutions && institutions.length > 1 ? (
        <section aria-label="Institution picker" className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs tracking-widest uppercase">
            Institution
          </span>
          <ul className="flex flex-wrap gap-1">
            {institutions.map((inst) => (
              <li key={inst.id}>
                <Link
                  href={`/admin/cohort?institution=${encodeURIComponent(inst.id)}`}
                  aria-current={inst.id === selectedInstitutionId ? "page" : undefined}
                  className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                    inst.id === selectedInstitutionId
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {inst.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!selectedInstitutionId ? (
        <p className="text-muted-foreground text-sm">
          No institution available. Add an institution under <code>/admin</code> first.
        </p>
      ) : (
        <>
          <section aria-label="Cohort headline counts">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Stat label="Learners" value={`${totalLearners}`} />
              <Stat label="Active this week" value={`${activeThisWeek}`} />
              <Stat label="Total reviews" value={`${totalReviews}`} />
              <Stat
                label="Reviews · 30d"
                value={`${heatmap.systems.reduce((s, sys) => s + sys.reviewsLast30d, 0)}`}
              />
            </dl>
          </section>

          <section aria-label="Class roster" className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-medium">Class roster</h2>
            {rosterError ? (
              <p className="text-destructive text-sm">Roster failed: {rosterError}</p>
            ) : roster.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No learners enrolled in this institution yet — once accounts are created and reviews
                flow in via Phase 6 sync, the table populates automatically.
              </p>
            ) : (
              <div className="border-border overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-muted-foreground text-left text-xs tracking-widest uppercase">
                      <th className="px-3 py-2">Learner</th>
                      <th className="px-3 py-2">Year</th>
                      <th className="px-3 py-2 text-right">Reviews · 7d</th>
                      <th className="px-3 py-2 text-right">Reviews</th>
                      <th className="px-3 py-2 text-right">Retention 30d</th>
                      <th className="px-3 py-2">Last review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((r) => (
                      <tr key={r.profile_id} className="border-border/40 border-t">
                        <td className="px-3 py-2">
                          <span className="font-medium">{r.full_name ?? "(no name)"}</span>
                          <div className="text-muted-foreground font-mono text-xs">
                            {r.profile_id}
                          </div>
                        </td>
                        <td className="px-3 py-2">{r.year_of_study ?? "—"}</td>
                        <td className="px-3 py-2 text-right">{r.reviews_last_7d ?? 0}</td>
                        <td className="px-3 py-2 text-right">{r.reviews_total ?? 0}</td>
                        <td className="px-3 py-2 text-right">
                          {r.retention_pct_30d === null ? "—" : `${r.retention_pct_30d}%`}
                        </td>
                        <td className="px-3 py-2">
                          {r.last_review_at ? formatDate(r.last_review_at) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-label="Topic heatmap" className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-medium">Topic heatmap</h2>
            <p className="text-muted-foreground text-xs">
              Per-mechanism retention rolled up by organ system. Weakest topics surface first within
              each system — that&apos;s where intervention has the most leverage.
            </p>
            {aggregatesError ? (
              <p className="text-destructive text-sm">Aggregates failed: {aggregatesError}</p>
            ) : !heatmap.hasAnyReviews ? (
              <p className="text-muted-foreground text-sm">
                No cohort review data yet. Chapters appear here as soon as the cohort starts rating
                cards (Phase 6 syncs reviews to Supabase).
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {heatmap.systems.map((sys) => (
                  <li
                    key={sys.organSystem}
                    className="border-border flex flex-col gap-2 rounded-md border p-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium capitalize">{sys.organSystem}</h3>
                      <span className="text-muted-foreground text-xs">
                        {sys.reviewsLast30d} review{sys.reviewsLast30d === 1 ? "" : "s"} · 30d ·{" "}
                        {sys.retentionPct30d === null
                          ? "no retention data"
                          : `${sys.retentionPct30d}% retention`}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {sys.mechanisms.map((m) => (
                        <li
                          key={m.mechanismId}
                          className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                          <Link
                            href={`/mechanisms/${encodeURIComponent(m.mechanismId)}`}
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            {m.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">{m.reviewsLast30d} · 30d</span>
                            <span
                              className="font-medium"
                              aria-label={
                                m.retentionPct30d === null
                                  ? `${m.title}: no retention data`
                                  : `${m.title}: ${m.retentionPct30d}% retention`
                              }
                            >
                              {m.retentionPct30d === null ? "—" : `${m.retentionPct30d}%`}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background flex flex-col gap-0.5 rounded-md border p-3">
      <dt className="text-muted-foreground text-xs tracking-widest uppercase">{label}</dt>
      <dd className="text-2xl font-medium">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
