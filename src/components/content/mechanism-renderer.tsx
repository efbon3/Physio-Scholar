import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Mechanism } from "@/lib/content/loader";

type TabKey = "core" | "working" | "deepDive" | "clinicalIntegration";

const TAB_LABEL: Record<TabKey, string> = {
  core: "Core",
  working: "Working",
  deepDive: "Deep Dive",
  clinicalIntegration: "Clinical",
};

const TAB_ORDER: readonly TabKey[] = ["core", "working", "deepDive", "clinicalIntegration"];

/**
 * Static mechanism renderer. Shows the four reading layers as tabs.
 *
 * Phase 2 stops at "static reading." The interactive learning loop
 * (cards, hints, self-explanation, SRS) is Phase 3. So this component
 * is deliberately presentational — no state machine, no scheduler, no
 * answer capture.
 *
 * Uses the `:target`-driven CSS-only tab pattern — each layer is a
 * section with an id, and the header links are anchors that scroll to
 * them. That keeps the component usable without JS and trivial to cache
 * with Serwist's HTML-first strategy.
 */
export function MechanismRenderer({ mechanism }: { mechanism: Mechanism }) {
  const availableLayers = TAB_ORDER.filter((key) => mechanism.layers[key]);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          {mechanism.frontmatter.organ_system}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {mechanism.frontmatter.title}
        </h1>
        <p className="text-sm">
          Competencies:{" "}
          <span className="font-mono">{mechanism.frontmatter.nmc_competencies.join(" · ")}</span>
        </p>
      </header>

      <nav aria-label="Mechanism layers">
        <ul className="flex flex-wrap gap-2 text-sm">
          {availableLayers.map((key) => (
            <li key={key}>
              <a
                href={`#layer-${key}`}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1 transition-colors"
              >
                {TAB_LABEL[key]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {availableLayers.map((key) => (
        <section key={key} id={`layer-${key}`} className="flex scroll-mt-8 flex-col gap-3">
          <h2 className="font-heading text-xl font-medium">{TAB_LABEL[key]}</h2>
          <div className="leading-7 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-medium [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{mechanism.layers[key] ?? ""}</ReactMarkdown>
          </div>
        </section>
      ))}

      {mechanism.layers.sources ? (
        <footer className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs">
          <h3 className="text-sm font-medium">Sources</h3>
          <div className="[&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{mechanism.layers.sources}</ReactMarkdown>
          </div>
        </footer>
      ) : null}
    </article>
  );
}
