import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Card, QuestionFormat } from "@/lib/content/cards";
import { cn } from "@/lib/utils";

type Props = {
  mechanismId: string;
  cards: readonly Card[];
};

type FormatCard = {
  format: QuestionFormat;
  title: string;
  description: string;
  href: (mechanismId: string) => string;
};

const FORMATS: readonly FormatCard[] = [
  {
    format: "mcq",
    title: "Multiple choice",
    description:
      "Four-option questions with misconception-aware feedback on wrong answers. Graded automatically.",
    href: (id) => `/test/${encodeURIComponent(id)}/mcq`,
  },
  {
    format: "descriptive",
    title: "Descriptive",
    description:
      "Type a free-text answer, compare against the model answer, then self-rate Green/Yellow/Red.",
    href: (id) => `/review?mechanism=${encodeURIComponent(id)}&format=descriptive`,
  },
  {
    format: "fill_blank",
    title: "Fill in the blank",
    description:
      "Short numeric or term answer. Graded automatically with partial credit for unit errors.",
    href: (id) => `/test/${encodeURIComponent(id)}/fill-blank`,
  },
];

/**
 * Zone 2 of the two-zone mechanism page (build spec §2.3). Shows
 * three format cards; each links into a session scoped to this
 * mechanism + format. When no published questions of a given format
 * exist, the card shows a grayed-out empty state instead of a link.
 *
 * Server component — receives the already-parsed cards from the
 * mechanism page so format counts are computed once at request time
 * rather than re-parsed in the client bundle.
 */
export function FormatPicker({ mechanismId, cards }: Props) {
  const counts = countsByFormat(cards);
  const total = cards.filter((c) => c.status === "published").length;

  return (
    <section
      aria-labelledby="test-yourself-heading"
      className="border-border flex flex-col gap-4 rounded-md border p-4"
    >
      <header className="flex items-center justify-between">
        <h2 id="test-yourself-heading" className="text-lg font-semibold">
          Test yourself
        </h2>
        <p className="text-muted-foreground text-xs">
          {total === 0
            ? "No questions authored yet"
            : `${total} question${total === 1 ? "" : "s"} across ${nonZeroFormats(counts)} format${
                nonZeroFormats(counts) === 1 ? "" : "s"
              }`}
        </p>
      </header>

      <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {FORMATS.map((f) => {
          const n = counts[f.format];
          const disabled = n === 0;
          return (
            <li
              key={f.format}
              className="border-border bg-card flex min-w-0 flex-1 flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{f.title}</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  {n} {n === 1 ? "question" : "questions"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
              {disabled ? (
                <span
                  aria-disabled="true"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  No questions yet
                </span>
              ) : (
                <Link href={f.href(mechanismId)} className={cn(buttonVariants({ size: "sm" }))}>
                  Start {f.title.toLowerCase()}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Test sessions update your daily review queue. Toggle &ldquo;Practice only&rdquo; inside a
        session to drill without changing your schedule.
      </p>
    </section>
  );
}

function countsByFormat(cards: readonly Card[]): Record<QuestionFormat, number> {
  const counts: Record<QuestionFormat, number> = {
    mcq: 0,
    descriptive: 0,
    fill_blank: 0,
  };
  for (const c of cards) {
    if (c.status !== "published") continue;
    counts[c.format] += 1;
  }
  return counts;
}

function nonZeroFormats(counts: Record<QuestionFormat, number>): number {
  return Object.values(counts).filter((n) => n > 0).length;
}
