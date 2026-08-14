#!/usr/bin/env node
/**
 * Visual regression: pixel-diffs the fresh verify:shots captures against a
 * baseline directory and fails when any page changed beyond the allowance.
 *
 * The baseline is NOT committed — full-page shots for 96 renders would bloat
 * the repo by tens of MB per change, and shots rendered on different machines
 * differ in font rasterisation anyway. Instead, CI compares each run against
 * the `shots-baseline` artifact of the LAST SUCCESSFUL run on main (same
 * runner image → same fonts) and uploads its own shots as the next baseline.
 * The first run, or a run after baselines expire, simply has nothing to
 * compare against and says so.
 *
 * Intentional restyles: land them with `[visual-baseline]` in the commit
 * message — the workflow skips the diff for that push and the run's shots
 * become the new baseline.
 *
 * Env: BASELINE_DIR (default verify/baseline), CURRENT_DIR (default
 * verify/shots), MAX_DIFF_PCT (default 1, percent of pixels per page).
 * Diff images for failures land in verify/diffs.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = process.env.BASELINE_DIR ?? join(root, 'verify', 'baseline');
const CURRENT = process.env.CURRENT_DIR ?? join(root, 'verify', 'shots');
const DIFFS = join(root, 'verify', 'diffs');
const MAX_DIFF_PCT = Number(process.env.MAX_DIFF_PCT ?? 1);

if (!existsSync(BASELINE)) {
  console.log(`diff-shots: no baseline at ${BASELINE} — nothing to compare against, skipping`);
  process.exit(0);
}
if (!existsSync(CURRENT)) {
  console.error(`diff-shots: no current shots at ${CURRENT} — run verify:shots first`);
  process.exit(1);
}

mkdirSync(DIFFS, { recursive: true });

const current = readdirSync(CURRENT).filter((f) => f.endsWith('.png')).sort();
const baseline = new Set(readdirSync(BASELINE).filter((f) => f.endsWith('.png')));

const fails = [];
const notes = [];
let compared = 0;

for (const name of current) {
  if (!baseline.has(name)) {
    notes.push(`new page (no baseline): ${name}`);
    continue;
  }
  baseline.delete(name);
  const a = PNG.sync.read(readFileSync(join(BASELINE, name)));
  const b = PNG.sync.read(readFileSync(join(CURRENT, name)));
  if (a.width !== b.width || a.height !== b.height) {
    fails.push(`${name}: size changed ${a.width}x${a.height} → ${b.width}x${b.height}`);
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.1
  });
  compared++;
  const pct = (changed / (a.width * a.height)) * 100;
  if (pct > MAX_DIFF_PCT) {
    writeFileSync(join(DIFFS, name), PNG.sync.write(diff));
    fails.push(`${name}: ${pct.toFixed(2)}% of pixels changed (allowance ${MAX_DIFF_PCT}%)`);
  }
}
for (const name of baseline) notes.push(`page disappeared (baseline only): ${name}`);

for (const n of notes) console.log(`  · ${n}`);
if (fails.length) {
  console.error(`VISUAL REGRESSIONS (diff images in verify/diffs):\n${fails.map((f) => `  ✗ ${f}`).join('\n')}`);
  console.error('Intentional restyle? Land it with [visual-baseline] in the commit message.');
  process.exit(1);
}
console.log(`diff-shots clean: ${compared} pages within ${MAX_DIFF_PCT}% of baseline${notes.length ? `, ${notes.length} note(s)` : ''}`);
