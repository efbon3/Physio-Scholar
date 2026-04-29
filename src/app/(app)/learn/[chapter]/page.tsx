import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ChapterTabs, type MechanismTabKey } from "@/components/content/mechanism-tabs";
import { readLearningChapterById } from "@/lib/content/learning-fs";

type Params = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: Params) {
  const { chapter: id } = await params;
  const m = await readLearningChapterById(id);
  return { title: m ? `Learning · ${m.frontmatter.title}` : "Chapter not found" };
}

/**
 * Learning chapter detail — the four reading layers as tabs (Core /
 * Working / Deep Dive / Clinical Integration). Read-only; no test
 * sessions, no SRS. Mirrors the textbook-reading half of the
 * Assessment page but in a focused surface so the learner isn't
 * pulled into "test yourself" affordances while reading.
 *
 * Markdown is rendered server-side so react-markdown + remark-gfm
 * stay out of the client bundle; ChapterTabs receives prerendered
 * ReactNodes per panel and only owns the show/hide state.
 */
export default async function LearningChapterPage({ params }: Params) {
  const { chapter: id } = await params;
  const chapter = await readLearningChapterById(id);
  if (!chapter) notFound();

  const { layers, frontmatter } = chapter;

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

  const hasAnyLayer = Object.keys(panels).length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/learn" className="underline-offset-2 hover:underline">
          ← Back to Learning
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          {frontmatter.organ_system}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{frontmatter.title}</h1>
      </header>

      {hasAnyLayer ? (
        <ChapterTabs panels={panels} />
      ) : (
        <p className="text-muted-foreground text-sm">
          No reading content authored for this chapter yet. Add `# Layer 1 — Core` (and Layer 2/3/4
          as appropriate) sections to the markdown file.
        </p>
      )}

      {layers.sources ? (
        <footer className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs">
          <h3 className="text-sm font-medium">Sources</h3>
          <div className="[&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{layers.sources}</ReactMarkdown>
          </div>
        </footer>
      ) : null}
    </main>
  );
}
