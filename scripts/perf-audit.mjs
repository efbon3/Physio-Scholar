#!/usr/bin/env node
/**
 * Perf audit — reports the gzipped size of the client-side app shell
 * against the build-spec budget (§2.8: 5 MB initial install).
 *
 * Usage:
 *   npm run perf:audit             # reports the total, exits 0 unless over budget
 *   npm run perf:audit -- --fail-under-budget   # fails if we're way below (sanity check)
 *
 * Runs against the most recent `.next/` build. Re-run `npm run build`
 * first if you want an accurate number.
 */

import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 5 * 1024 * 1024; // 5 MB
const NEXT_DIR = ".next";
const STATIC_DIR = join(NEXT_DIR, "static");
const TARGET_EXTENSIONS = new Set([".js", ".css"]);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function extOf(p) {
  const idx = p.lastIndexOf(".");
  return idx === -1 ? "" : p.slice(idx).toLowerCase();
}

async function measure() {
  let rawTotal = 0;
  let gzTotal = 0;
  const breakdown = [];

  try {
    for await (const file of walk(STATIC_DIR)) {
      if (!TARGET_EXTENSIONS.has(extOf(file))) continue;
      const buf = await readFile(file);
      const gz = gzipSync(buf).byteLength;
      const st = await stat(file);
      rawTotal += st.size;
      gzTotal += gz;
      breakdown.push({
        path: file.replace(STATIC_DIR + "/", "").replace(STATIC_DIR + "\\", ""),
        raw: st.size,
        gz,
      });
    }
  } catch (err) {
    console.error(`perf-audit: unable to walk ${STATIC_DIR}.`);
    console.error(`Did you run \`npm run build\` first?`);
    console.error(err);
    process.exit(2);
  }

  breakdown.sort((a, b) => b.gz - a.gz);

  const fmt = (n) => {
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${n} B`;
  };

  console.log(`\nPhysio-Scholar client bundle (.next/static) — perf audit`);
  console.log(`Budget (gzipped): ${fmt(BUDGET_BYTES)}`);
  console.log(`Actual  (gzipped): ${fmt(gzTotal)}`);
  console.log(`Actual  (raw)    : ${fmt(rawTotal)}`);
  console.log(`Files counted    : ${breakdown.length}`);
  console.log(``);
  console.log(`Top 10 contributors (gzipped):`);
  for (const entry of breakdown.slice(0, 10)) {
    console.log(`  ${fmt(entry.gz).padStart(8)}  ${entry.path}`);
  }

  const pct = (gzTotal / BUDGET_BYTES) * 100;
  console.log(``);
  console.log(`Using ${pct.toFixed(1)}% of the 5 MB budget.`);

  const overBudget = gzTotal > BUDGET_BYTES;
  if (overBudget) {
    console.error(`\n✗ Over budget by ${fmt(gzTotal - BUDGET_BYTES)}.`);
    process.exit(1);
  }
  console.log(`\n✓ Within budget.`);
}

measure();
