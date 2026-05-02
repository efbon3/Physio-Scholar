/**
 * Walks content/chapters/, groups loaded chapters by organ_system,
 * and prints a per-chapter card count broken down by format. Used for
 * publishing summaries — runs the same loader path as the production
 * pages, so the output matches what learners see on /systems.
 */
import { readAllChapters } from "../src/lib/content/fs";
import { extractCards } from "../src/lib/content/cards";

async function main() {
  const chapters = await readAllChapters();
  const grouped = new Map<string, typeof chapters>();
  for (const m of chapters) {
    const key = m.frontmatter.organ_system;
    const arr = grouped.get(key) ?? [];
    arr.push(m);
    grouped.set(key, arr);
  }

  const sortedSystems = [...grouped.keys()].sort();
  let grandTotal = 0;
  for (const system of sortedSystems) {
    const inSystem = grouped
      .get(system)!
      .slice()
      .sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
    let systemTotal = 0;
    console.log(`\n=== ${system.toUpperCase()} ===`);
    for (const m of inSystem) {
      const cards = extractCards(m);
      const byFormat = { mcq: 0, fill_blank: 0, descriptive: 0 } as Record<string, number>;
      for (const c of cards) byFormat[c.format] = (byFormat[c.format] ?? 0) + 1;
      const total = cards.length;
      systemTotal += total;
      console.log(
        `  ${m.frontmatter.id.padEnd(50)}  ${m.frontmatter.title.padEnd(60)}  ` +
          `mcq=${byFormat.mcq.toString().padStart(3)}  ` +
          `fill=${byFormat.fill_blank.toString().padStart(3)}  ` +
          `desc=${byFormat.descriptive.toString().padStart(3)}  ` +
          `tot=${total.toString().padStart(3)}`,
      );
    }
    console.log(`  ${" ".repeat(50)}  ${" ".repeat(60)}  ----`);
    console.log(`  ${" ".repeat(50)}  ${"system total".padEnd(60)}  tot=${systemTotal}`);
    grandTotal += systemTotal;
  }
  console.log(`\nGRAND TOTAL: ${grandTotal} cards across ${chapters.length} chapters\n`);
}

main();
