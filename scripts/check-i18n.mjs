#!/usr/bin/env node
/**
 * CI gate: the build fails on untranslated or orphaned keys.
 *
 * Three checks, all of which were real failure modes in the static pages:
 *   1. KEY PARITY   — every key present in one locale exists in the other.
 *   2. EMPTY VALUES — no key resolves to an empty or whitespace-only string.
 *   3. UNTRANSLATED — an es value identical to its en value is flagged, unless
 *      it is on the allow-list of legitimate shared strings (product names,
 *      plate numbers, currency, units).
 *
 * Exit code 1 fails `npm run verify`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, '..', 'src', 'messages');

function loadLocale(locale) {
  const localeDir = join(dir, locale);
  const out = {};
  for (const file of readdirSync(localeDir).sort()) {
    if (!file.endsWith('.json')) continue;
    const ns = file.replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(join(localeDir, file), 'utf8'));
    // `_core.json` and `supporting.json` hold several namespaces at top level.
    if (ns.startsWith('_') || ns === 'supporting') Object.assign(out, data);
    else out[ns] = data;
  }
  return out;
}

const es = loadLocale('es');
const en = loadLocale('en');

/** Strings that are correctly identical in both locales. */
const SHARED_OK = new Set([
  'Ride Fleet',
  'Ride Fleet Manager',
  'Toll Bridge',
  // Renamed from "Voz AI" on 2026-08-17. Product names are not translated.
  'Valet',
  'Market Intelligence',
  'Ride University',
  'AutoExpreso',
  'SunPass',
  'Puerto Rico',
  'Florida',
  'San Juan',
  'Demo',
  'ES',
  'EN',
  'Cookies',
  'Error 404'
]);

/** Key paths whose values may legitimately match across locales. */
const SHARED_KEY_PATTERNS = [
  /\.plate$/,
  /\.plates\./,
  /\.amount$/,
  /\.value$/,
  /\.number$/,
  /\.code$/,
  /^nav\.switchTo\./,
  /^nav\.rideFleetManager$/,
  /^nav\.tollBridge$/,
  /^nav\.valet$/,
  /^nav\.bookDemoShort$/
];

function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item && typeof item === 'object') flatten(item, `${path}.${i}`, out);
        else out.set(`${path}.${i}`, String(item));
      });
    } else {
      out.set(path, String(value));
    }
  }
  return out;
}

const flatEs = flatten(es);
const flatEn = flatten(en);

const errors = [];
const warnings = [];

for (const key of flatEs.keys()) {
  if (!flatEn.has(key)) errors.push(`missing in en.json: ${key}`);
}
for (const key of flatEn.keys()) {
  if (!flatEs.has(key)) errors.push(`missing in es.json: ${key}`);
}

for (const [locale, flat] of [
  ['es', flatEs],
  ['en', flatEn]
]) {
  for (const [key, value] of flat) {
    if (!value.trim()) errors.push(`empty value in ${locale}.json: ${key}`);
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(value)) {
      errors.push(`emoji in ${locale}.json: ${key}`);
    }
    if (/^(TODO|TBD|lorem|placeholder|stub)$/i.test(value.trim())) {
      errors.push(`unfilled placeholder in ${locale}.json: ${key}`);
    }
  }
}

for (const [key, value] of flatEs) {
  const other = flatEn.get(key);
  if (other === undefined || value !== other) continue;
  if (SHARED_OK.has(value.trim())) continue;
  if (SHARED_KEY_PATTERNS.some((re) => re.test(key))) continue;
  // Pure numbers, currency and short codes are locale-neutral.
  if (/^[\s\d.,:%$/·—–-]+$/.test(value)) continue;
  if (value.trim().length <= 3) continue;
  warnings.push(`possibly untranslated (es === en): ${key} — "${value}"`);
}

const strict = process.env.I18N_STRICT !== '0';

if (warnings.length) {
  console.log(`\n${warnings.length} untranslated-string warning(s):`);
  for (const w of warnings) console.log(`  · ${w}`);
}

if (errors.length) {
  console.error(`\n${errors.length} i18n error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

if (strict && warnings.length) {
  console.error(
    '\nStrict mode: untranslated strings fail the build. Translate them, or add the key to SHARED_KEY_PATTERNS with a reason.'
  );
  process.exit(1);
}

console.log(
  `\ni18n OK — ${flatEs.size} keys, both locales in parity, no empty values, no emoji.`
);
