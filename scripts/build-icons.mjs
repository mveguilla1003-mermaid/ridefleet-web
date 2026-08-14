#!/usr/bin/env node
/**
 * Generates the seven app-icon files plus the web manifest, all derived from
 * ONE colour: `site.brandHex`.
 *
 * GUARD — this script FAILS (exit 1) if `site.brandHex` in src/lib/site.ts no
 * longer equals `--p-700` in src/styles/tokens.css. brandHex is the site's
 * single documented exception to the no-colours-outside-tokens rule (the
 * theme-color meta is parsed before any stylesheet loads), and this gate is
 * what keeps that exception honest: change the token without re-running this
 * script and the very next `npm run build:icons` stops the line.
 *
 * Outputs (all in public/):
 *   favicon.svg              32×32 rounded-rect mark, scalable
 *   favicon.ico              16 + 32 + 48 PNG-in-ICO container
 *   apple-touch-icon.png     180×180 full-bleed (iOS applies its own mask)
 *   icon-192.png             192×192 rounded-rect, transparent corners
 *   icon-512.png             512×512 rounded-rect, transparent corners
 *   icon-maskable-192.png    192×192 full-bleed, glyph inside the safe zone
 *   icon-maskable-512.png    512×512 full-bleed, glyph inside the safe zone
 *   manifest.webmanifest     references the four manifest icons + theme colour
 *
 * PNGs are rendered with the repo's own Playwright Chromium — no image
 * library dependency. Rerun after any change to the mark or to --p-700.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const pub = join(root, 'public');

/* ---- 1. The sync gate -------------------------------------------------- */

const tokens = readFileSync(join(root, 'src', 'styles', 'tokens.css'), 'utf8');
const tokenMatch = tokens.match(/--p-700\s*:\s*(#[0-9a-fA-F]{6})/);
if (!tokenMatch) {
  console.error('build:icons: could not find --p-700 in tokens.css');
  process.exit(1);
}
const tokenHex = tokenMatch[1].toLowerCase();
// Manifest background comes from the canvas token, not a literal, so tokens.css
// stays the only place that defines colours.
const canvasHex = (tokens.match(/--n-0\s*:\s*(#[0-9a-fA-F]{3,6})/) ?? [, '#ffffff'])[1];

const siteTs = readFileSync(join(root, 'src', 'lib', 'site.ts'), 'utf8');
const brandMatch = siteTs.match(/brandHex\s*:\s*'(#[0-9a-fA-F]{6})'/);
if (!brandMatch) {
  console.error('build:icons: could not find brandHex in src/lib/site.ts');
  process.exit(1);
}
const brandHex = brandMatch[1].toLowerCase();

if (brandHex !== tokenHex) {
  console.error(
    `build:icons: site.brandHex (${brandHex}) is OUT OF SYNC with --p-700 (${tokenHex}).\n` +
      'brandHex exists only because <meta name="theme-color"> cannot read a CSS ' +
      'custom property. Update src/lib/site.ts to match tokens.css, then rerun.'
  );
  process.exit(1);
}

/* ---- 2. The mark ------------------------------------------------------- */

// Same glyph as the shipped favicon: vehicle outline on the brand field.
// viewBox is 32; radius 8 (25%) matches the site's card radii proportions.
const GLYPH = `<g fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 13.5 6 8.2A2 2 0 0 1 7.9 6.8h8.2A2 2 0 0 1 18 8.2l1.5 5.3"/><path d="M3.5 13.5h17v3.2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><circle cx="7.2" cy="17.7" r="1.4"/><circle cx="16.8" cy="17.7" r="1.4"/></g>`;

/**
 * glyphScale: fraction of the canvas the 24-unit glyph box occupies.
 * rounded: 25% corner radius with transparent corners; full-bleed otherwise
 * (Apple and maskable icons must paint every pixel — the platform masks).
 */
function markSvg({ rounded, glyphScale }) {
  const g = 32 * glyphScale;
  const offset = (32 - g) / 2;
  const scale = g / 24;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="${rounded ? 8 : 0}" fill="${brandHex}"/>` +
    `<g transform="translate(${offset} ${offset}) scale(${scale})">${GLYPH}</g>` +
    `</svg>`
  );
}

const ICONS = [
  { file: 'apple-touch-icon.png', size: 180, rounded: false, glyphScale: 0.72 },
  { file: 'icon-192.png', size: 192, rounded: true, glyphScale: 0.75 },
  { file: 'icon-512.png', size: 512, rounded: true, glyphScale: 0.75 },
  // Maskable safe zone is a centred circle of 80% of the canvas — keep the
  // glyph at 60% so nothing is clipped by round or squircle masks.
  { file: 'icon-maskable-192.png', size: 192, rounded: false, glyphScale: 0.6 },
  { file: 'icon-maskable-512.png', size: 512, rounded: false, glyphScale: 0.6 }
];
const ICO_SIZES = [16, 32, 48];

/* ---- 3. Render PNGs with Playwright ------------------------------------ */

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};
const browser = await chromium.launch(launchOpts);

async function renderPng({ size, rounded, glyphScale }) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1
  });
  const svg = markSvg({ rounded, glyphScale });
  await page.setContent(
    `<style>*{margin:0}body{background:transparent}</style>` +
      `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${size}" height="${size}" style="display:block">`
  );
  const buf = await page.screenshot({ omitBackground: true });
  await page.close();
  return buf;
}

for (const icon of ICONS) {
  writeFileSync(join(pub, icon.file), await renderPng(icon));
  console.log(`  ${icon.file}`);
}

/* ---- 4. favicon.ico — PNG-in-ICO container ----------------------------- */

const icoPngs = [];
for (const size of ICO_SIZES) {
  icoPngs.push({ size, buf: await renderPng({ size, rounded: true, glyphScale: 0.75 }) });
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(icoPngs.length, 4);
const entries = [];
let offset = 6 + 16 * icoPngs.length;
for (const { size, buf } of icoPngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0);
  e.writeUInt8(size === 256 ? 0 : size, 1);
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bpp
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  entries.push(e);
  offset += buf.length;
}
writeFileSync(
  join(pub, 'favicon.ico'),
  Buffer.concat([header, ...entries, ...icoPngs.map((p) => p.buf)])
);
console.log('  favicon.ico');

await browser.close();

/* ---- 5. favicon.svg + manifest ----------------------------------------- */

writeFileSync(join(pub, 'favicon.svg'), markSvg({ rounded: true, glyphScale: 0.75 }) + '\n');
console.log('  favicon.svg');

// The description is the site's own about line (default locale), read from the
// catalog rather than duplicated here.
const esCore = JSON.parse(
  readFileSync(join(root, 'src', 'messages', 'es', '_core.json'), 'utf8')
);

const manifest = {
  name: 'Ride Fleet',
  short_name: 'Ride Fleet',
  description: esCore.footer.about,
  start_url: '/es',
  display: 'browser',
  theme_color: brandHex,
  background_color: canvasHex,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
writeFileSync(join(pub, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('  manifest.webmanifest');

console.log(`build:icons OK — 7 icons + manifest, brand ${brandHex} in sync with --p-700`);
