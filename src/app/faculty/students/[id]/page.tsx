import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Student detail · Faculty",
};

type SummaryRow = {
  profile_id: string;
  full_name: string | null;
  nickname: string | null;
  year_of_study: number | null;
  reviews_total: number;
  reviews_last_7d: number;
  retention_pct_30d: number | null;
  last_review_at: string | null;
};

type CardAgg = {
  card_id: string;
  reviews_total: number;
  reviews_last_30d: number;
  retention_pct_30d: number | null;
  last_review_at: string | null;
};

type RecentReview = {
  id: string;
  card_id: string;
  rating: "again" | "hard" | "good" | "easy" | "dont_know";
  hints_used: number;
  time_spent_seconds: number;
  created_at: string;
};

const RECENT_REVIEW_LIMIT = 30;

/**
 * Per-student drill-down for faculty.
 *
 * Three RPCs at request time, all institution-gated server-side:
 *   - student_profile_summary  → header (name, year, headline stats)
 *   - student_card_aggregates  → mechanism-by-mechanism mastery
 *   - student_recent_reviews   → activity log
 *
 * The student_profile_summary RPC returns zero rows when the caller
 * is unauthorised OR the target isn't a student of the named
 * institution. We treat zero rows as 404 — same posture the rest of
 * the app uses for "doesn't exist or you can't see it."
 */
export default async function FacultyStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const { id: studentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/faculty/students/${studentId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id")
    .eq("id", user.id)
    .single();
  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");
  if (!profile.institution_id) redirect("/faculty/students");

  // Three RPCs in parallel.
  const [summaryRes, aggRes, recentRes] = await Promise.all([
    supabase.rpc("student_profile_summary", {
      p_institution_id: profile.institution_id,
      p_student_id: studentId,
    }),
    supabase.rpc("student_card_aggregates", {
      p_institution_id: profile.institution_id,
      p_student_id: studentId,
    }),
    supabase.rpc("student_recent_reviews", {
      p_institution_id: profile.institution_id,
      p_student_id: studentId,
      p_limit: RECENT_REVIEW_LIMIT,
    }),
  ]);

  const summaryRows = (summaryRes.data ?? []) as SummaryRow[];
  if (summaryRows.length === 0) notFound();
  const summary = summaryRows[0];

  const aggregates = (aggRes.data ?? []) as CardAgg[];
  const recent = (recentRes.data ?? []) as RecentReview[];

  // Map card_id → mechanism for the breakdown. The authored content
  // isn't in the DB, so we read it server-side and join in memory.
  const mechanisms = await readAllMechanisms();
  const cardsById = new Map<string, Card>();
  const mechanismTitles = new Map<string, string>();
  for (const m of mechanisms) {
    mechanismTitles.set(m.frontmatter.id, m.frontmatter.title);
    for (const card of extractCards(m)) cardsById.set(card.id, card);
  }

  // Roll the per-card aggregates up to the mechanism level. A
  // mechanism's retention is the weighted mean of its cards'
  // retention (weighted by reviews_last_30d).
  const mechanismRollup = rollUpToMechanisms(aggregates, cardsById);

  const greetingName = summary.nickname || summary.full_name || "(no name)";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/faculty/students" className="underline-offset-2 hover:underline">
          ← Back to students
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Student</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{greetingName}</h1>
        {summary.full_name && summary.nickname ? (
          <p className="text-muted-foreground text-sm">Full name: {summary.full_name}</p>
        ) : null}
        {summary.year_of_study ? (
          <p className="text-muted-foreground text-sm">Year {summary.year_of_study}</p>
        ) : null}
      </header>

      <section aria-label="Headline counts">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Reviews · 7d" value={`${summary.reviews_last_7d}`} />
          <Stat label="Reviews · total" value={`${summary.reviews_total}`} />
          <Stat
            label="Retention · 30d"
            value={summary.retention_pct_30d === null ? "—" : `${summary.retention_pct_30d}%`}
          />
          <Stat
            label="Last review"
            value={summary.last_review_at ? formatRelative(summary.last_review_at) : "Never"}
          />
        </dl>
      </section>

      <section aria-label="Mechanism breakdown" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Mechanism breakdown</h2>
        {mechanismRollup.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            This student hasn&apos;t reviewed any cards yet. Once they start, the per-mechanism
            breakdown appears here.
          </p>
        ) : (
          <div className="border-border overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs tracking-widest uppercase">
                  <th className="px-3 py-2">Mechanism</th>
                  <th className="px-3 py-2 text-right">Reviews · 30d</th>
                  <th className="px-3 py-2 text-right">Reviews · total</th>
                  <th className="px-3 py-2 text-right">Retention 30d</th>
                  <th className="px-3 py-2">Last review</th>
                </tr>
              </thead>
              <tbody>
                {mechanismRollup.map((m) => (
                  <tr key={m.mechanismId} className="border-border/40 border-t">
                    <td className="px-3 py-2">
                      {mechanismTitles.get(m.mechanismId) ?? m.mechanismId}
                    </td>
                    <td className="px-3 py-2 text-right">{m.reviewsLast30d}</td>
                    <td className="px-3 py-2 text-right">{m.reviewsTotal}</td>
                    <td className="px-3 py-2 text-right">
                      {m.retentionPct30d === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={m.retentionPct30d < 70 ? "font-medium text-amber-700" : ""}
                        >
                          {m.retentionPct30d}%
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {m.lastReviewAt ? formatRelative(m.lastReviewAt) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="Recent activity" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">No review history yet.</p>
        ) : (
          <ul className="border-border divide-border divide-y rounded-md border text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                <RatingPill rating={r.rating} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {cardLabel(r.card_id, cardsById, mechanismTitles)}
                  </p>
                  <p className="text-muted-foreground font-mono text-[11px]">{r.card_id}</p>
                </div>
                <p className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatRelative(r.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-md border p-3">
      <dt className="text-muted-foreground text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="font-heading text-xl font-semibold">{value}</dd>
    </div>
  );
}

function RatingPill({ rating }: { rating: RecentReview["rating"] }) {
  const styles: Record<RecentReview["rating"], { label: string; cls: string }> = {
    easy: { label: "Easy", cls: "bg-emerald-100 text-emerald-900" },
    good: { label: "Good", cls: "bg-emerald-50 text-emerald-800" },
    hard: { label: "Hard", cls: "bg-amber-100 text-amber-900" },
    again: { label: "Again", cls: "bg-red-100 text-red-900" },
    dont_know: { label: "Don't know", cls: "bg-slate-100 text-slate-700" },
  };
  const s = styles[rating];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function cardLabel(
  cardId: string,
  cardsById: Map<string, Card>,
  mechanismTitles: Map<string, string>,
): string {
  const card = cardsById.get(cardId);
  if (card) {
    const mTitle = mechanismTitles.get(card.mechanism_id) ?? card.mechanism_id;
    return `${mTitle} · Q${card.index}`;
  }
  // Card no longer in the published bank (retired or removed). Fall
  // back to the mechanism prefix from the id, if present.
  const sep = cardId.indexOf(":");
  if (sep > 0) {
    const prefix = cardId.slice(0, sep);
    return mechanismTitles.get(prefix) ?? cardId;
  }
  return cardId;
}

type MechanismRollup = {
  mechanismId: string;
  reviewsTotal: number;
  reviewsLast30d: number;
  retentionPct30d: number | null;
  lastReviewAt: string | null;
};

function rollUpToMechanisms(
  aggregates: readonly CardAgg[],
  cardsById: Map<string, Card>,
): MechanismRollup[] {
  const byMechanism = new Map<
    string,
    {
      reviewsTotal: number;
      reviewsLast30d: number;
      retentionWeightedSum: number;
      retentionWeight: number;
      lastReviewAt: string | null;
    }
  >();

  for (const agg of aggregates) {
    const card = cardsById.get(agg.card_id);
    // Fall back to splitting the id when the card is no longer
    // published — the rollup still surfaces the activity even if
    // we lost the title lookup.
    const mechanismId = card?.mechanism_id ?? agg.card_id.split(":")[0] ?? agg.card_id;
    const bucket = byMechanism.get(mechanismId) ?? {
      reviewsTotal: 0,
      reviewsLast30d: 0,
      retentionWeightedSum: 0,
      retentionWeight: 0,
      lastReviewAt: null,
    };
    bucket.reviewsTotal += agg.reviews_total;
    bucket.reviewsLast30d += agg.reviews_last_30d;
    if (agg.retention_pct_30d !== null) {
      bucket.retentionWeightedSum += agg.retention_pct_30d * agg.reviews_last_30d;
      bucket.retentionWeight += agg.reviews_last_30d;
    }
    if (agg.last_review_at && (!bucket.lastReviewAt || agg.last_review_at > bucket.lastReviewAt)) {
      bucket.lastReviewAt = agg.last_review_at;
    }
    byMechanism.set(mechanismId, bucket);
  }

  const out: MechanismRollup[] = [];
  for (const [mechanismId, b] of byMechanism.entries()) {
    out.push({
      mechanismId,
      reviewsTotal: b.reviewsTotal,
      reviewsLast30d: b.reviewsLast30d,
      retentionPct30d:
        b.retentionWeight > 0 ? Math.round(b.retentionWeightedSum / b.retentionWeight) : null,
      lastReviewAt: b.lastReviewAt,
    });
  }
  // Sort: lowest retention first (the mechanisms the student needs help with).
  out.sort((a, b) => {
    const ar = a.retentionPct30d ?? 200; // null sinks below real rows
    const br = b.retentionPct30d ?? 200;
    return ar - br;
  });
  return out;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
