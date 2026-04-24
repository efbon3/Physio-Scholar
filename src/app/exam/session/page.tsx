import Link from "next/link";
import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { assembleExamSession, EXAM_PATTERNS, type ExamPattern } from "@/lib/content/exam";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { ExamSession } from "./exam-session";

export const metadata = {
  title: "Exam drill",
};

type SearchParams = { type?: string; count?: string };

function normaliseType(raw: string | undefined): ExamPattern | null {
  if (!raw) return null;
  return EXAM_PATTERNS.some((p) => p.key === raw) ? (raw as ExamPattern) : null;
}

function normaliseCount(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 20;
  return Math.max(1, Math.min(200, n));
}

export default async function ExamSessionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pattern = normaliseType(params.type);
  if (!pattern) redirect("/exam");

  const count = normaliseCount(params.count);

  // Auth guard — middleware covers this too, but keeping the double-check
  // matches how /review is structured and survives the CI "no Supabase"
  // pass-through case gracefully.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) redirect("/login?next=/exam");
    } catch {
      // env present but unreachable → fall through to render without auth,
      // matching the defensive behaviour of /review.
    }
  }

  const mechanisms = await readAllMechanisms();
  const allCards: Card[] = mechanisms.flatMap(extractCards);

  // Build a fresh session each page load. Combining Date.now() with a
  // per-request random uuid means two refreshes in the same millisecond
  // still get different seeds — Date.now() alone can collide.
  //
  // React's purity rule flags Date.now() / randomUUID() because client
  // components must be deterministic across renders — but server
  // components legitimately re-run per request, and a time+random
  // salt is exactly what we want here. Disabling at the call site
  // with a justification rather than globally.
  // eslint-disable-next-line react-hooks/purity
  const sessionSalt = `${Date.now()}-${crypto.randomUUID()}`;
  const questions = assembleExamSession({
    cards: allCards,
    pattern,
    count,
    sessionSalt,
  });

  if (questions.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-medium">No questions available</h1>
        <p className="text-muted-foreground text-sm">
          No cards are tagged for{" "}
          <span className="font-medium">{pattern === "mbbs" ? "MBBS" : "pre-PG"}</span> with enough
          misconceptions to build MCQs. Ask your admin to author more content, or try the other exam
          type.
        </p>
        <Link
          href="/exam"
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
        >
          Back
        </Link>
      </main>
    );
  }

  return <ExamSession pattern={pattern} questions={questions} />;
}
