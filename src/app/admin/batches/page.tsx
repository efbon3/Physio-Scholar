import { createClient } from "@/lib/supabase/server";

import { BatchRow } from "./batch-row";
import { CreateBatchForm } from "./create-batch-form";

export const metadata = {
  title: "Batches · Admin",
};

type BatchRecord = {
  id: string;
  name: string;
  year_of_study: number | null;
  created_at: string;
};

/**
 * Admin → batches. CRUD over public.batches scoped to the admin's
 * own institution (RLS enforces — same-institution callers read,
 * admins write). Each row supports rename, set year of study, and
 * delete. The member count next to each row is the number of
 * profiles whose batch_id points at that row, which the admin uses
 * to decide whether deleting is safe.
 */
export default async function AdminBatchesPage() {
  const supabase = await createClient();

  const { data: batches, error } = await supabase
    .from("batches")
    .select("id, name, year_of_study, created_at")
    .order("year_of_study", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  // Member counts — one count(*) per batch, joined by batch_id.
  // Done as a single profiles query grouped client-side rather than
  // N round-trips.
  let memberCountByBatch = new Map<string, number>();
  if (batches && batches.length > 0) {
    const { data: members } = await supabase
      .from("profiles")
      .select("batch_id")
      .in(
        "batch_id",
        batches.map((b) => b.id),
      );
    memberCountByBatch = new Map<string, number>();
    for (const m of members ?? []) {
      if (!m.batch_id) continue;
      memberCountByBatch.set(m.batch_id, (memberCountByBatch.get(m.batch_id) ?? 0) + 1);
    }
  }

  const rows = (batches ?? []) as BatchRecord[];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Batches</h1>
        <p className="text-muted-foreground text-sm">
          Sub-cohorts inside your institution. Students belong to one batch via their profile;
          assignments and announcements can target a list of batches so faculty can broadcast to
          everyone or narrow to a specific year. Empty target list = whole institution sees the row.
        </p>
      </header>

      <section aria-label="Add batch" className="mb-6">
        <CreateBatchForm />
      </section>

      {error ? (
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No batches yet. Add one above to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((b) => (
            <BatchRow
              key={b.id}
              id={b.id}
              name={b.name}
              yearOfStudy={b.year_of_study}
              memberCount={memberCountByBatch.get(b.id) ?? 0}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
