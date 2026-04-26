import type { Card } from "@/lib/content/cards";

/**
 * Cohort topic-heatmap aggregator. Pure function: takes the raw
 * per-card aggregates the DB returns + the authored card universe,
 * and rolls up by mechanism + organ_system.
 *
 * The DB only knows card_ids (the authored mechanism markdown isn't
 * mirrored to Postgres). So we join in memory: card_id → mechanism_id
 * via the loaded Card[], mechanism_id → organ_system via the
 * mechanismMeta lookup the page builds at request time.
 *
 * Output is grouped by organ_system, with mechanisms inside each
 * group sorted by retention ascending (the cohort's weakest topics
 * surface first — that's where intervention is most useful).
 */

export type CohortCardAggregate = {
  card_id: string;
  reviews_total: number;
  reviews_last_30d: number;
  retention_pct_30d: number | null;
  unique_learners: number;
};

export type MechanismMeta = {
  mechanismId: string;
  title: string;
  organSystem: string;
};

export type MechanismHeat = {
  mechanismId: string;
  title: string;
  reviewsTotal: number;
  reviewsLast30d: number;
  retentionPct30d: number | null;
  uniqueLearners: number;
  cardCount: number;
};

export type SystemHeat = {
  organSystem: string;
  reviewsTotal: number;
  reviewsLast30d: number;
  retentionPct30d: number | null;
  uniqueLearners: number;
  mechanisms: MechanismHeat[];
};

export type CohortHeatmap = {
  systems: SystemHeat[];
  totalReviews: number;
  hasAnyReviews: boolean;
};

/**
 * Combine retention percentages two-stage average style: we need the
 * underlying success/total counts, not the per-card percentage, to roll
 * up correctly. The DB sends back retention_pct_30d which we can't
 * re-aggregate directly — but we can approximate the rolled-up retention
 * by treating each card's pct as weighted by reviews_last_30d. That's
 * algebraically equivalent to (sum_success / sum_attempts) under the
 * assumption that pct = success/attempts × 100.
 */
function weightedRetention(
  parts: readonly { pct: number | null; weight: number }[],
): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const p of parts) {
    if (p.pct === null) continue;
    weightedSum += p.pct * p.weight;
    totalWeight += p.weight;
  }
  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}

export function buildCohortHeatmap({
  aggregates,
  cards,
  mechanismMeta,
}: {
  aggregates: readonly CohortCardAggregate[];
  cards: readonly Card[];
  mechanismMeta: ReadonlyMap<string, MechanismMeta>;
}): CohortHeatmap {
  // card_id → aggregate lookup
  const aggByCard = new Map<string, CohortCardAggregate>();
  for (const a of aggregates) aggByCard.set(a.card_id, a);

  // Group cards into mechanisms; only include mechanisms whose meta is
  // known (drops orphaned aggregate rows from retired mechanisms).
  const cardsByMechanism = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = cardsByMechanism.get(c.mechanism_id) ?? [];
    arr.push(c);
    cardsByMechanism.set(c.mechanism_id, arr);
  }

  const mechanismHeats: MechanismHeat[] = [];
  for (const [mechanismId, mechCards] of cardsByMechanism) {
    const meta = mechanismMeta.get(mechanismId);
    if (!meta) continue;
    const parts: CohortCardAggregate[] = [];
    let reviewsTotal = 0;
    let reviewsLast30d = 0;
    const learners = new Set<string>();
    for (const c of mechCards) {
      const agg = aggByCard.get(c.id);
      if (!agg) continue;
      parts.push(agg);
      reviewsTotal += agg.reviews_total;
      reviewsLast30d += agg.reviews_last_30d;
      // unique_learners is per-card; we can't union sets from aggregates
      // alone. Use the max as a lower-bound proxy for the mechanism.
      // This is acknowledged-imprecise — a future migration could expose
      // a per-mechanism unique_learners count if the heatmap needs it.
      if (agg.unique_learners > learners.size) {
        learners.clear();
        for (let i = 0; i < agg.unique_learners; i += 1) learners.add(`#${i}`);
      }
    }
    mechanismHeats.push({
      mechanismId,
      title: meta.title,
      reviewsTotal,
      reviewsLast30d,
      retentionPct30d: weightedRetention(
        parts.map((p) => ({ pct: p.retention_pct_30d, weight: p.reviews_last_30d })),
      ),
      uniqueLearners: learners.size,
      cardCount: mechCards.length,
    });
  }

  // Group mechanisms by organ system
  const systemMap = new Map<string, MechanismHeat[]>();
  for (const m of mechanismHeats) {
    const meta = mechanismMeta.get(m.mechanismId);
    if (!meta) continue;
    const arr = systemMap.get(meta.organSystem) ?? [];
    arr.push(m);
    systemMap.set(meta.organSystem, arr);
  }

  const systems: SystemHeat[] = [];
  let totalReviews = 0;
  for (const [organSystem, mechanisms] of systemMap) {
    let reviewsTotal = 0;
    let reviewsLast30d = 0;
    let learners = 0;
    for (const m of mechanisms) {
      reviewsTotal += m.reviewsTotal;
      reviewsLast30d += m.reviewsLast30d;
      if (m.uniqueLearners > learners) learners = m.uniqueLearners;
    }
    totalReviews += reviewsTotal;
    mechanisms.sort((a, b) => {
      const aPct = a.retentionPct30d ?? 101;
      const bPct = b.retentionPct30d ?? 101;
      if (aPct !== bPct) return aPct - bPct;
      return a.title.localeCompare(b.title);
    });
    systems.push({
      organSystem,
      reviewsTotal,
      reviewsLast30d,
      retentionPct30d: weightedRetention(
        mechanisms.map((m) => ({ pct: m.retentionPct30d, weight: m.reviewsLast30d })),
      ),
      uniqueLearners: learners,
      mechanisms,
    });
  }
  systems.sort((a, b) => {
    const aPct = a.retentionPct30d ?? 101;
    const bPct = b.retentionPct30d ?? 101;
    if (aPct !== bPct) return aPct - bPct;
    return a.organSystem.localeCompare(b.organSystem);
  });

  return {
    systems,
    totalReviews,
    hasAnyReviews: totalReviews > 0,
  };
}
