import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { resolveFlagAction } from "./actions";

export const metadata = {
  title: "Content flags · Admin",
};

/**
 * Admin → content flags queue.
 *
 * Shows open flags first (the triage surface), then recent resolved /
 * rejected for audit. Each flag links to the Chapter detail page so
 * the admin can read the card in context before resolving.
 *
 * The list is a Supabase query, not paginated — pilot cohort is small
 * enough that 100+ flags fits on one scroll. Pagination lands if the
 * volume actually justifies it.
 */
type FlagRow = {
  id: string;
  profile_id: string;
  card_id: string;
  reason: string;
  notes: string | null;
  status: "open" | "resolved" | "rejected";
  created_at: string;
  resolved_at: string | null;
};

export default async function AdminFlagsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_flags")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Shell>
        <p className="text-destructive text-sm">Failed to load flags: {error.message}</p>
      </Shell>
    );
  }

  const flags = (data ?? []) as FlagRow[];
  const open = flags.filter((f) => f.status === "open");
  const closed = flags.filter((f) => f.status !== "open");

  return (
    <Shell>
      <section aria-label="Open flags" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Open ({open.length})</h2>
        {open.length === 0 ? (
          <p className="text-muted-foreground text-sm">No open flags.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {open.map((f) => (
              <FlagCard key={f.id} flag={f} />
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Closed flags" className="flex flex-col gap-3 border-t pt-4">
        <h2 className="font-heading text-xl font-medium">Recently closed ({closed.length})</h2>
        {closed.length === 0 ? (
          <p className="text-muted-foreground text-sm">No closed flags yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {closed.slice(0, 20).map((f) => (
              <li
                key={f.id}
                className="border-border/60 text-muted-foreground flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-xs"
              >
                <span>
                  <span className="text-foreground font-medium">{f.card_id}</span> — {f.reason}
                </span>
                <span>
                  {f.status} · {f.resolved_at ? formatDate(f.resolved_at) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function FlagCard({ flag }: { flag: FlagRow }) {
  const [chapterId] = flag.card_id.split(":");
  return (
    <li className="border-border flex flex-col gap-2 rounded-md border p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">
            <span className="font-mono text-xs">{flag.card_id}</span>
            <span className="text-muted-foreground"> · {formatDate(flag.created_at)}</span>
          </p>
          <p>
            <span className="text-muted-foreground text-xs">Reason: </span>
            {flag.reason}
          </p>
          {flag.notes ? <p className="text-muted-foreground text-xs">Notes: {flag.notes}</p> : null}
          <p className="text-muted-foreground font-mono text-xs">
            By profile {flag.profile_id.slice(0, 8)}…
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/systems/cardiovascular/${chapterId}`}
            className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs"
          >
            View Chapter
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={resolveFlagAction}>
          <input type="hidden" name="id" value={flag.id} />
          <input type="hidden" name="resolution" value="resolved" />
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-xs"
          >
            Mark resolved
          </button>
        </form>
        <form action={resolveFlagAction}>
          <input type="hidden" name="id" value={flag.id} />
          <input type="hidden" name="resolution" value="rejected" />
          <button
            type="submit"
            className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs"
          >
            Reject
          </button>
        </form>
      </div>
    </li>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Content flags</h1>
      </header>
      {children}
      <footer data-print="hide" className="border-border mt-8 border-t pt-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          ← Back to admin
        </Link>
      </footer>
    </main>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
