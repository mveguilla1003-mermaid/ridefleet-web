#!/usr/bin/env node
/**
 * Derives a per-route lastModified date for the sitemap from git history —
 * the newest commit touching any of the route's real inputs (its page
 * directory, its page stylesheet if it has one, and its message namespaces
 * in both locales). Writes src/lib/lastmod.json.
 *
 * The file is COMMITTED, not build-time-only, on purpose: Vercel builds from
 * a shallow clone, where per-file `git log -1` would return the tip commit's
 * date for every file — plausible-looking and wrong for all of them. So this
 * script only regenerates when the full history is available (local checkouts;
 * `npm run build` triggers it via the npm `prebuild` hook) and leaves the
 * committed file untouched everywhere else. Dates may lag by however long it
 * has been since someone built locally, but every date it ships is a real
 * commit date, never a fabricated one.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outPath = join(root, 'src', 'lib', 'lastmod.json');

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

let usable = false;
try {
  usable = git('rev-parse', '--is-shallow-repository') === 'false';
} catch {
  usable = false; // no git at all (tarball deploys)
}

if (!usable) {
  console.log(
    `build:lastmod — shallow or absent git history; keeping the committed ${existsSync(outPath) ? 'lastmod.json' : 'nothing (no lastmod.json yet)'}`
  );
  process.exit(0);
}

/** Route key (matching src/lib/site.ts `routes`) → the files that shape it. */
const INPUTS = {
  home: ['src/app/[locale]/page.tsx', 'src/styles/pages/home.css', 'src/messages/es/home.json', 'src/messages/en/home.json'],
  rideFleetManager: ['src/app/[locale]/ride-fleet-manager', 'src/styles/pages/ride-fleet-manager.css', 'src/messages/es/rideFleetManager.json', 'src/messages/en/rideFleetManager.json'],
  tollBridge: ['src/app/[locale]/toll-bridge', 'src/styles/pages/toll-bridge.css', 'src/messages/es/tollBridge.json', 'src/messages/en/tollBridge.json'],
  vozAi: ['src/app/[locale]/voz-ai', 'src/styles/pages/voz-ai.css', 'src/messages/es/vozAi.json', 'src/messages/en/vozAi.json'],
  valet: ['src/app/[locale]/valet', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  pricing: ['src/app/[locale]/pricing', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  demo: ['src/app/[locale]/demo/page.tsx', 'src/app/[locale]/demo/DemoForm.tsx', 'src/styles/pages/book-demo.css', 'src/messages/es/demo.json', 'src/messages/en/demo.json'],
  demoThankYou: ['src/app/[locale]/demo/thank-you', 'src/messages/es/demo.json', 'src/messages/en/demo.json'],
  designPartners: ['src/app/[locale]/design-partners', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  security: ['src/app/[locale]/security', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  privacy: ['src/app/[locale]/privacy', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  terms: ['src/app/[locale]/terms', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  cookies: ['src/app/[locale]/cookies', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json'],
  accessibility: ['src/app/[locale]/accessibility', 'src/messages/es/supporting.json', 'src/messages/en/supporting.json']
};

const out = {};
for (const [key, paths] of Object.entries(INPUTS)) {
  const date = git('log', '-1', '--format=%cI', '--', ...paths);
  if (date) out[key] = date;
}

const previous = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
const next = JSON.stringify(out, null, 2) + '\n';
if (next !== previous) {
  writeFileSync(outPath, next);
  console.log(`build:lastmod — wrote ${Object.keys(out).length} route dates (commit the change)`);
} else {
  console.log(`build:lastmod — ${Object.keys(out).length} route dates, unchanged`);
}
