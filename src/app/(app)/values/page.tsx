import Link from "next/link";

import { readAllMechanisms } from "@/lib/content/source";
import { extractValues } from "@/lib/content/values";

export const metadata = {
  title: "Values",
};

/**
 * Values mode landing — pick a mechanism to drill numeric quantities.
 *
 * Distinct from /facts: facts cover six categories (definitions,
 * functions, etc); /values is dedicated to numeric quantities with
 * units. Authored separately under `# Values` in mechanism markdown
 * so a learner who wants to drill *only* numbers gets a clean stream.
 */
export default async function ValuesPage() {
  const mechanisms = await readAllMechanisms();

  type Summary = {
    id: string;
    title: string;
    organSystem: string;
    count: number;
  };

  const summaries: Summary[] = [];
  for (const m of mechanisms) {
    const values = extractValues(m);
    if (values.length === 0) continue;
    summaries.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      organSystem: m.frontmatter.organ_system,
      count: values.length,
    });
  }

  const grouped = new Map<string, Summary[]>();
  for (const s of summaries) {
    const list = grouped.get(s.organSystem) ?? [];
    list.push(s);
    grouped.set(s.organSystem, list);
  }
  const groups = [...grouped.entries()]
    .map(([system, items]) => ({
      system,
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Values</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Numeric values</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Numbers, units, and ranges that get tested by name. One prompt at a time — recall the
          value, reveal, and tell yourself whether you knew it. Values feed the same review schedule
          as your other cards.
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-md border p-4 text-sm">
          No values authored yet. Add a <code>{"# Values"}</code> section to a mechanism markdown
          file under <code>content/mechanisms/</code> and they&apos;ll appear here.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-2">
                {g.items.map((s) => (
                  <li
                    key={s.id}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {s.count} value{s.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/values/session?mechanism=${encodeURIComponent(s.id)}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1 text-xs font-medium"
                    >
                      Drill
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
