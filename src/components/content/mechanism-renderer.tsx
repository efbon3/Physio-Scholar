import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { extractCards } from "@/lib/content/cards";
import type { Mechanism } from "@/lib/content/loader";

import { FormatPicker } from "./format-picker";
import { MechanismStats } from "./mechanism-stats";
import { MechanismTabs, type MechanismTabKey } from "./mechanism-tabs";

type Props = {
  mechanism: Mechanism;
  /**
   * Signed-in learner id. Passed in from the server page (falls back to
   * "preview" in CI / unconfigured previews, same sentinel the review
   * page uses) so the Dexie-backed MechanismStats is scoped correctly.
   */
  profileId: string;
};

/**
 * Mechanism detail page — static reading surfaces (Phase 2) plus the
 * Phase 5 additions: a proper tablist for the four reading layers,
 * per-mechanism stats pulled from Dexie, and a "Study this mechanism"
 * CTA that launches `/review?mechanism=<id>` filtered to just these
 * cards.
 *
 * Markdown rendering stays on the server so the `react-markdown` +
 * `remark-gfm` parsers stay out of the client bundle. The `MechanismTabs`
 * client component receives the already-rendered ReactNodes as panels
 * and only owns the show/hide state + keyboard interactions.
 */
export function MechanismRenderer({ mechanism, profileId }: Props) {
  const { layers, frontmatter } = mechanism;

  const panels: Partial<Record<MechanismTabKey, React.ReactNode>> = {};
  if (layers.core) {
    panels.core = <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.core}</ReactMarkdown>;
  }
  if (layers.working) {
    panels.working = <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.working}</ReactMarkdown>;
  }
  if (layers.deepDive) {
    panels.deepDive = <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.deepDive}</ReactMarkdown>;
  }
  if (layers.clinicalIntegration) {
    panels.clinicalIntegration = (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.clinicalIntegration}</ReactMarkdown>
    );
  }

  const cards = extractCards(mechanism);
  const cardIds = cards.map((c) => c.id);
  const hasCards = cardIds.length > 0;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          {frontmatter.organ_system}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {frontmatter.title}
        </h1>
        <p className="text-sm">
          Competencies:{" "}
          <span className="font-mono">{frontmatter.nmc_competencies.join(" · ")}</span>
        </p>
      </header>

      <section
        aria-label="Your progress on this chapter"
        className="border-border bg-muted/40 flex flex-col gap-4 rounded-md border p-4"
      >
        <MechanismStats cardIds={cardIds} profileId={profileId} />
        {!hasCards ? (
          <p className="text-muted-foreground text-xs">
            No questions have been authored for this chapter yet. The textbook layers below are
            still readable; the &ldquo;Test yourself&rdquo; panel appears once the
            <code> # Questions</code> section lands in the markdown.
          </p>
        ) : null}
      </section>

      <MechanismTabs panels={panels} />

      {hasCards ? <FormatPicker mechanismId={frontmatter.id} cards={cards} /> : null}

      {layers.sources ? (
        <footer className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs">
          <h3 className="text-sm font-medium">Sources</h3>
          <div className="[&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.sources}</ReactMarkdown>
          </div>
        </footer>
      ) : null}
    </article>
  );
}
