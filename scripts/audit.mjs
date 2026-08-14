import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

// Target defaults to the local production server; point it at a deploy with
// BASE_URL=https://example.com npm run verify:a11y
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const ROUTES = ['', '/ride-fleet-manager', '/toll-bridge', '/voz-ai', '/demo',
  '/demo/thank-you', '/design-partners', '/security', '/privacy', '/terms', '/cookies', '/accessibility'];
// The CI sandbox preinstalls Chromium at a fixed path; anywhere else we fall
// back to Playwright's own managed browser (npx playwright install chromium).
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};
const b = await chromium.launch(launchOpts);
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const fail = [];
const note = (m) => fail.push(m);

/* ---- App icons: every declared file must actually download ---------------
   Declared-but-404 icons shipped once in the static era; HEAD is not enough
   either (a misrouted rewrite can 200 an HTML error page), so each body is
   checked against its format's magic bytes and a sane minimum size. */
const ICON_FILES = [
  ['favicon.svg', (buf) => buf.toString('utf8', 0, 200).includes('<svg'), 100],
  ['favicon.ico', (buf) => buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1, 500],
  ['apple-touch-icon.png', isPng, 500],
  ['icon-192.png', isPng, 500],
  ['icon-512.png', isPng, 1000],
  ['icon-maskable-192.png', isPng, 500],
  ['icon-maskable-512.png', isPng, 1000]
];
function isPng(buf) {
  return buf.length > 8 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG';
}
for (const [file, check, minBytes] of ICON_FILES) {
  const resp = await ctx.request.get(`${BASE}/${file}`);
  if (resp.status() !== 200) { note(`icon ${file}: HTTP ${resp.status()}`); continue; }
  const body = await resp.body();
  if (body.length < minBytes) note(`icon ${file}: only ${body.length} bytes`);
  else if (!check(body)) note(`icon ${file}: wrong magic bytes — not the format its name claims`);
}
{
  const resp = await ctx.request.get(`${BASE}/manifest.webmanifest`);
  if (resp.status() !== 200) note(`manifest: HTTP ${resp.status()}`);
  else {
    try {
      const m = JSON.parse((await resp.body()).toString('utf8'));
      if (!Array.isArray(m.icons) || m.icons.length < 4) note(`manifest: expected ≥4 icons, got ${m.icons?.length}`);
      if (!/^#[0-9a-f]{6}$/i.test(m.theme_color ?? '')) note(`manifest: bad theme_color ${m.theme_color}`);
    } catch { note('manifest: not valid JSON'); }
  }
}

/* ---- Security headers on page responses ----------------------------------
   The middleware must send the CSP (with a nonce) and its companions on
   every page. Asserted once — the middleware runs identically for all
   matched routes. HSTS is production-only, and `npm start`/deploys are
   production, so it is required here. */
{
  const resp = await ctx.request.get(`${BASE}/es`);
  const h = (name) => resp.headers()[name.toLowerCase()] ?? '';
  const cspHeader = h('Content-Security-Policy');
  if (!/script-src [^;]*'nonce-[A-Za-z0-9+/=]+'/.test(cspHeader))
    note(`headers: CSP missing or without a script-src nonce: "${cspHeader.slice(0, 80)}"`);
  if (!/default-src 'self'/.test(cspHeader)) note("headers: CSP lacks default-src 'self'");
  for (const [name, expected] of [
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY']
  ]) {
    if (h(name) !== expected) note(`headers: ${name} = "${h(name)}", expected "${expected}"`);
  }
  if (!h('Permissions-Policy')) note('headers: Permissions-Policy missing');
  if (!/max-age=\d+/.test(h('Strict-Transport-Security')))
    note('headers: Strict-Transport-Security missing');
}

/* ---- The 404, in both locale prefixes ------------------------------------
   The pre-rebuild bug was an EMPTY 404: Next's default shell with no <html>,
   English only, unstyled. Assert on the RAW served HTML (request.get, no JS)
   so hydration can never mask a regression, then render it once for the
   focus-ring check. */
for (const prefix of ['es', 'en']) {
  const url = `${BASE}/${prefix}/audit-404-probe`;
  const resp = await ctx.request.get(url);
  const tag = `${prefix}/404`;
  if (resp.status() !== 404) note(`${tag}: HTTP ${resp.status()}, expected 404`);
  const raw = (await resp.body()).toString('utf8');
  if (!raw.includes('lang="es-PR"')) note(`${tag}: served HTML lacks the es-PR block`);
  if (!raw.includes('lang="en-US"')) note(`${tag}: served HTML lacks the en-US block`);
  if (!/rel="stylesheet"/.test(raw)) note(`${tag}: no stylesheet in served HTML — unstyled 404`);
  if (!/noindex/.test(raw)) note(`${tag}: missing robots noindex`);
  if ((raw.match(/<h1[\s>]/g) ?? []).length !== 1) note(`${tag}: expected exactly one h1 in served HTML`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const focus = await page.evaluate(() => {
    const el = document.querySelector('a[href]');
    el.focus();
    const cs = getComputedStyle(el);
    return `${cs.outlineColor} / ${cs.outlineStyle}`;
  });
  if (!/rgb\(11, 99, 214\)/.test(focus)) note(`${tag}: focus ring = ${focus}`);
}

/* Footer separation must be ONE number across every route — this is the
   regression the CROSS-PAGE SHELL NORMALISATION block in additions.css
   exists to prevent (it used to be 52px on five routes and 112px on the
   other seven). Collected per render, asserted once after the loop. */
const footerJoins = new Map();

for (const locale of ['es', 'en']) {
  for (const r of ROUTES) {
    const url = `${BASE}/${locale}${r}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const tag = `${locale}${r || '/'}`;
    const res = await page.evaluate(() => {
      const out = {};
      const acc = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ||
        el.textContent.trim() || el.getAttribute('title') || '').trim();
      out.unnamed = [...document.querySelectorAll('a,button')].filter(el => !acc(el)).map(el => el.outerHTML.slice(0,90));
      out.unlabelled = [...document.querySelectorAll('input,select,textarea')].filter(el => {
        if (el.type === 'hidden') return false;
        if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
        return !(el.closest('label') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
      }).map(el => el.outerHTML.slice(0,90));
      out.hashHrefs = [...document.querySelectorAll('a[href="#"], a[href=""]')].length;
      out.deadAnchors = [...document.querySelectorAll('a[href^="#"]')]
        .map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.querySelector(h)).filter(h => h !== '#main');
      out.badPressed = [...document.querySelectorAll('[aria-pressed]')].map(e => e.getAttribute('aria-pressed'))
        .filter(v => v !== 'true' && v !== 'false');
      out.imgNoAlt = [...document.querySelectorAll('img:not([alt])')].length;
      out.lang = document.documentElement.lang;
      out.title = document.title;
      out.desc = document.querySelector('meta[name="description"]')?.content || '';
      out.canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      out.hreflang = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => l.hreflang).sort();
      out.h1 = [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0,40));
      const seq = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
      out.headingJumps = seq.filter((v,i) => i && v - seq[i-1] > 1).length;
      out.emoji = (document.body.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).slice(0,3);
      out.pairedSpans = document.querySelectorAll('span.es, span.en').length;
      // focus ring colour on the first focusable (keyboard sampling of the
      // rest of the shell happens outside this evaluate — script focus()
      // chains do not reliably match :focus-visible in Chromium).
      const el = document.querySelector('a[href], button');
      el.focus();
      const cs = getComputedStyle(el);
      out.focus = cs.outlineColor + ' / ' + cs.outlineWidth + ' / ' + cs.outlineStyle;
      // The demo button carries a long and a short label; exactly one may be
      // visible at a time (both visible = the double-label menu bug).
      const vis = (el) => el && getComputedStyle(el).display !== 'none';
      const long = document.querySelector('.nav-right .nav-long');
      const short = document.querySelector('.nav-right .nav-short');
      out.navLabels = { long: vis(long), short: vis(short) };
      const foot = document.querySelector('.site-footer');
      out.footerMarginTop = foot ? getComputedStyle(foot).marginTop : 'NO FOOTER';
      return out;
    });
    if (res.unnamed.length) note(`${tag}: ${res.unnamed.length} unnamed control(s): ${res.unnamed[0]}`);
    if (res.unlabelled.length) note(`${tag}: ${res.unlabelled.length} unlabelled field(s): ${res.unlabelled[0]}`);
    if (res.hashHrefs) note(`${tag}: ${res.hashHrefs} href="#"`);
    if (res.deadAnchors.length) note(`${tag}: dead anchors ${res.deadAnchors.join(',')}`);
    if (res.badPressed.length) note(`${tag}: bad aria-pressed ${res.badPressed}`);
    if (res.imgNoAlt) note(`${tag}: ${res.imgNoAlt} <img> without alt`);
    if (res.lang !== (locale === 'es' ? 'es-PR' : 'en-US')) note(`${tag}: lang=${res.lang}`);
    if (!res.title || res.title.length < 15) note(`${tag}: weak title "${res.title}"`);
    if (!res.desc || res.desc.length < 50) note(`${tag}: weak description (${res.desc.length})`);
    if (!res.canonical) note(`${tag}: no canonical`);
    // The site emits full BCP-47 tags from `localeTags` (es-PR / en-US), which
    // are valid hreflang values and match `<html lang>`; bare `es`/`en` was the
    // assertion's guess, not the spec. /demo/thank-you is noindex, so it
    // deliberately ships no alternates.
    if (r !== '/demo/thank-you' && JSON.stringify(res.hreflang) !== '["en-US","es-PR","x-default"]') note(`${tag}: hreflang ${res.hreflang}`);
    if (res.h1.length !== 1) note(`${tag}: ${res.h1.length} h1`);
    if (res.headingJumps) note(`${tag}: ${res.headingJumps} heading level jump(s)`);
    if (res.emoji.length) note(`${tag}: emoji ${res.emoji}`);
    if (res.pairedSpans) note(`${tag}: ${res.pairedSpans} paired .es/.en span(s)`);
    if (!/rgb\(11, 99, 214\)/.test(res.focus)) note(`${tag}: focus ring = ${res.focus}`);

    // Shell focus rings under REAL keyboard modality: park focus just before
    // the target with script, then arrive by Tab (script focus alone does not
    // reliably match :focus-visible, and keyboard is what the ring is for).
    for (const sel of ['.nav-links a', '.lang button, .lang a', '.site-footer a[href]']) {
      const parked = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return false;
        el.focus();
        return true;
      }, sel);
      if (!parked) { note(`${tag}: shell focus target missing: ${sel}`); continue; }
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      // Nav links transition `all` over --dur-2 (180ms), which includes the
      // outline — measuring immediately reads 0-1px mid-animation, so let the
      // ring settle first.
      await page.waitForTimeout(300);
      const ring = await page.evaluate(() => {
        const cs = getComputedStyle(document.activeElement);
        return cs.outlineColor + ' / ' + cs.outlineWidth + ' / ' + cs.outlineStyle;
      });
      if (!/rgb\(11, 99, 214\)/.test(ring)) note(`${tag}: keyboard focus ring on ${sel} = ${ring}`);
    }
    if (res.navLabels.long === res.navLabels.short)
      note(`${tag}: demo button labels long=${res.navLabels.long} short=${res.navLabels.short} — exactly one must be visible`);
    footerJoins.set(tag, res.footerMarginTop);
  }
}

const joinValues = new Set(footerJoins.values());
if (joinValues.size !== 1) {
  const byValue = {};
  for (const [tag, v] of footerJoins) (byValue[v] ??= []).push(tag);
  note(`footer join differs across pages: ${JSON.stringify(byValue)}`);
}

await b.close();
console.log(fail.length ? 'FINDINGS:\n' + fail.join('\n') : 'audit clean: 24 page renders + 2 404s + 7 icons + manifest');
