#!/usr/bin/env node
/**
 * Renders one 1200×630 Open Graph card per route per locale into public/og/,
 * named `<locale>-<slug>.png` (slug: '/' → 'home', nested '/' → '-'), which is
 * exactly the URL scheme `buildMetadata` in src/lib/seo.ts emits. Titles and
 * descriptions come from each route's own `<namespace>.meta` strings, so the
 * cards can never drift from the pages' real metadata — rerun after copy
 * changes.
 *
 * Every colour is parsed out of tokens.css (nothing hard-coded here):
 * white title on --p-900 is 14.70:1 and the --p-200 label on --p-900 is
 * 9.56:1 — both AAA, same method as the ratios annotated in tokens.css.
 *
 * The card typeface is the system stack, so glyph metrics differ slightly
 * between the machine that renders them and CI — that only matters if two
 * machines regenerate and diff the PNGs, not for correctness.
 */
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

/* ---- routes → message namespace (mirror of src/lib/site.ts routes) ------ */

const ROUTES = [
  { path: '/', ns: 'home' },
  { path: '/ride-fleet-manager', ns: 'rideFleetManager' },
  { path: '/toll-bridge', ns: 'tollBridge' },
  { path: '/voz-ai', ns: 'vozAi' },
  { path: '/demo', ns: 'demo' },
  { path: '/demo/thank-you', ns: 'thankYou' },
  { path: '/design-partners', ns: 'designPartners' },
  { path: '/security', ns: 'security' },
  { path: '/privacy', ns: 'legal.privacy' },
  { path: '/terms', ns: 'legal.terms' },
  { path: '/cookies', ns: 'legal.cookies' },
  { path: '/accessibility', ns: 'legal.accessibility' }
];

/* ---- message loading (same merge rules as scripts/check-i18n.mjs) ------- */

function loadLocale(locale) {
  const localeDir = join(root, 'src', 'messages', locale);
  const out = {};
  for (const file of readdirSync(localeDir).sort()) {
    if (!file.endsWith('.json')) continue;
    const ns = file.replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(join(localeDir, file), 'utf8'));
    if (ns.startsWith('_') || ns === 'supporting') Object.assign(out, data);
    else out[ns] = data;
  }
  return out;
}

const catalogs = { es: loadLocale('es'), en: loadLocale('en') };

function resolve(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* ---- colours from tokens.css ------------------------------------------- */

const tokens = readFileSync(join(root, 'src', 'styles', 'tokens.css'), 'utf8');
function token(name) {
  const m = tokens.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!m) {
    console.error(`build:og: token ${name} not found in tokens.css`);
    process.exit(1);
  }
  return m[1];
}
const field = token('--p-900'); // deep brand field
const glow = token('--p-700'); // radial accent
const label = token('--p-200'); // 9.56:1 on --p-900 — AAA
const titleColor = token('--n-0'); // 14.70:1 on --p-900 — AAA (per tokens.css)

const mark = readFileSync(join(root, 'public', 'favicon.svg'), 'utf8').trim();

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cardHtml({ title, description, localeLabel }) {
  return `<!doctype html><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: radial-gradient(1000px 700px at 88% -10%, ${glow}66, transparent 60%), ${field};
    color: ${titleColor};
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px 72px;
  }
  .top { display: flex; align-items: center; gap: 22px; }
  .top svg { width: 76px; height: 76px; }
  .brand { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; }
  .title {
    font-size: 68px; font-weight: 800; line-height: 1.06; letter-spacing: -0.025em;
    max-width: 1020px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .desc {
    margin-top: 26px; font-size: 30px; line-height: 1.35; color: ${label};
    max-width: 980px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .bottom { display: flex; justify-content: space-between; align-items: center;
    font-size: 27px; color: ${label}; font-weight: 600; letter-spacing: 0.02em; }
  .tag { border: 2px solid ${label}; border-radius: 999px; padding: 6px 22px; }
  </style>
  <div class="top">${mark}<div class="brand">Ride Fleet</div></div>
  <div><div class="title">${esc(title)}</div><div class="desc">${esc(description)}</div></div>
  <div class="bottom"><div>ridefleet.com</div><div class="tag">${localeLabel}</div></div>`;
}

/* ---- render ------------------------------------------------------------- */

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1
});

let count = 0;
const missing = [];
for (const locale of ['es', 'en']) {
  for (const { path, ns } of ROUTES) {
    const meta = resolve(catalogs[locale], `${ns}.meta`);
    if (!meta?.title) {
      missing.push(`${locale}:${ns}.meta.title`);
      continue;
    }
    // The page <title> carries a " · Ride Fleet" suffix on several routes; the
    // card already shows the wordmark, so strip it from the headline.
    const title = meta.title.replace(/\s*[·—-]\s*Ride Fleet.*$/u, '');
    await page.setContent(
      cardHtml({
        title,
        description: meta.description ?? '',
        localeLabel: locale.toUpperCase()
      }),
      { waitUntil: 'networkidle' }
    );
    const slug = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-');
    await page.screenshot({ path: join(outDir, `${locale}-${slug}.png`) });
    count++;
  }
}
await browser.close();

if (missing.length) {
  console.error(`build:og: missing meta for ${missing.join(', ')}`);
  process.exit(1);
}
console.log(
  `build:og OK — ${count} cards (${ROUTES.length} routes × 2 locales) in public/og/`
);
