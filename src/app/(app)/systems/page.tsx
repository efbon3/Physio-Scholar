import Link from "next/link";

import { readAllMechanisms } from "@/lib/content/source";

export const metadata = {
  title: "Systems",
};

type SystemGroup = {
  system: string;
  mechanisms: { id: string; title: string }[];
};

export default async function SystemsPage() {
  const mechanisms = await readAllMechanisms();

  // Group by organ_system; sort systems alphabetically, mechanisms alphabetically.
  const grouped = new Map<string, SystemGroup>();
  for (const m of mechanisms) {
    const key = m.frontmatter.organ_system;
    if (!grouped.has(key)) grouped.set(key, { system: key, mechanisms: [] });
    grouped.get(key)!.mechanisms.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
    });
  }
  const groups = [...grouped.values()].sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Systems</h1>
        <p className="text-sm">Browse mechanisms by organ system.</p>
      </header>

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">No mechanisms have been published yet.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-1">
                {g.mechanisms
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((m) => (
                    <li key={m.id}>
                      <Link
                        className="underline underline-offset-2"
                        href={`/systems/${g.system}/${m.id}`}
                      >
                        {m.title}
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
