import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Target defaults to the local production server; point it at a deploy with
// BASE_URL=https://example.com npm run verify:a11y
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const ROUTES = ['', '/ride-fleet-manager', '/toll-bridge', '/valet', '/pricing',
  '/demo', '/demo/thank-you', '/design-partners', '/security', '/privacy', '/terms',
  '/cookies', '/accessibility'];
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
  // Reservation of rights against text and data mining. Must never become
  // `noindex` — search engines are welcome, model trainers are not.
  const xr = h('X-Robots-Tag');
  if (!/noai/.test(xr)) note(`headers: X-Robots-Tag lacks noai ("${xr}")`);
  if (/noindex/.test(xr)) note(`headers: X-Robots-Tag says noindex — that de-lists the site`);
}

/* ---- robots.txt keeps the AI crawlers out, and the search engines in ----
   Both halves matter: a regression that drops the AI block is invisible,
   and so is one that accidentally disallows everything. */
{
  const resp = await ctx.request.get(`${BASE}/robots.txt`);
  if (resp.status() !== 200) note(`robots.txt: HTTP ${resp.status()}`);
  else {
    const body = (await resp.body()).toString('utf8');
    for (const bot of ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Bytespider']) {
      if (!body.includes(bot)) note(`robots.txt: ${bot} is not listed`);
    }
    if (!/User-Agent:\s*\*/i.test(body)) note('robots.txt: no wildcard group');
    if (/User-Agent:\s*\*\s*\nDisallow:\s*\/\s*$/im.test(body))
      note('robots.txt: the wildcard group disallows everything — the site would de-list');
    if (!body.includes('/sitemap.xml')) note('robots.txt: sitemap not advertised');
  }
}

/* ---- The 404, in both locale prefixes ------------------------------------
   The pre-rebuild bug was an EMPTY 404: Next's default shell with no <html>,
   English only, unstyled. Assert on the RAW served HTML (request.get, no JS)
   so hydration can never mask a regression. The 404 is LOCALISED per prefix
   (the site renders dynamically and the middleware resolves the locale on
   the way in) and carries the real shell — so each prefix must serve its own
   language, header/footer/ES|EN switch must be present, and the response
   must bear a nonce (proof it did not fall back to a locale-blind static
   render), plus stylesheet, noindex, one h1, and the focus-ring check on a
   rendered pass. */
const h1By404 = {};
for (const [prefix, expectLang] of [['es', 'es-PR'], ['en', 'en-US']]) {
  const url = `${BASE}/${prefix}/audit-404-probe`;
  const resp = await ctx.request.get(url);
  const tag = `${prefix}/404`;
  if (resp.status() !== 404) note(`${tag}: HTTP ${resp.status()}, expected 404`);
  const raw = (await resp.body()).toString('utf8');
  if (!raw.includes(`<html lang="${expectLang}"`)) note(`${tag}: served HTML is not ${expectLang}-localised`);
  if (!/nonce="/.test(raw)) note(`${tag}: no nonce in served HTML — 404 fell back to a static render`);
  if (!raw.includes('site-footer')) note(`${tag}: footer missing — the 404 lost the shell`);
  if (!/class="lang"/.test(raw)) note(`${tag}: ES|EN switch missing — the 404 lost the shell`);
  if (!/rel="stylesheet"/.test(raw)) note(`${tag}: no stylesheet in served HTML — unstyled 404`);
  if (!/noindex/.test(raw)) note(`${tag}: missing robots noindex`);
  if ((raw.match(/<h1[\s>]/g) ?? []).length !== 1) note(`${tag}: expected exactly one h1 in served HTML`);
  h1By404[prefix] = (raw.match(/<h1[^>]*>([^<]*)<\/h1>/) ?? [])[1] ?? '';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const focus = await page.evaluate(() => {
    const el = document.querySelector('a[href]');
    el.focus();
    const cs = getComputedStyle(el);
    return `${cs.outlineColor} / ${cs.outlineStyle}`;
  });
  if (!/rgb\(11, 99, 214\)/.test(focus)) note(`${tag}: focus ring = ${focus}`);
}
if (h1By404.es && h1By404.es === h1By404.en)
  note(`404: identical h1 under both prefixes ("${h1By404.es}") — localisation regressed`);

/* ---- Machine-measured text contrast --------------------------------------
   Rule 3 of the repo requires measured ratios; this makes the measuring
   automatic. Every visible text node over a SOLID composited background is
   checked: below WCAG AA (4.5:1 normal, 3:1 large) always fails; below AAA
   (7:1 / 4.5:1) fails unless the (colour, surface) pair is one of the AA
   decisions documented in tokens.css (each allowance cites its line).
   Gradient- and image-backed text is skipped and counted: product-mockup
   surfaces paint with multi-stop gradients and ::before overlays that
   computed-style compositing cannot see — pixel truth would need rendering,
   and a wrong guess here would drown real findings in false ones (measured:
   the naive worst-stop approach reported 1.0:1 on correctly-contrasted hero
   text). This gate found one real bug on day one: .foot-legal at 3.25:1. */
async function contrastScan(pageRef) {
  return pageRef.evaluate(() => {
    const parse = (s) => {
      const m = s.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
      return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratioOf = (c1, c2) => {
      const [hi, lo] = [lum(c1), lum(c2)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const comp = (top, bot) => ({
      r: top.r * top.a + bot.r * (1 - top.a),
      g: top.g * top.a + bot.g * (1 - top.a),
      b: top.b * top.a + bot.b * (1 - top.a),
      a: 1
    });
    const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

    // Solid background only: ascend compositing semi-transparent layers until
    // an opaque colour; bail on any background-image on the way up.
    function solidBg(el) {
      const semis = [];
      let node = el;
      while (node && node.nodeType === 1) {
        const cs = getComputedStyle(node);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
        const bc = parse(cs.backgroundColor);
        if (bc && bc.a > 0) {
          if (bc.a >= 1) {
            let c = bc;
            for (let i = semis.length - 1; i >= 0; i--) c = comp(semis[i], c);
            return c;
          }
          semis.push(bc);
        }
        node = node.parentElement;
      }
      let c = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = semis.length - 1; i >= 0; i--) c = comp(semis[i], c);
      return c;
    }

    /* AA-by-design pairs, each documented in tokens.css with its measured
       ratio. Keyed by exact fg colour + the surface's luminance band, so a
       colour drifting onto the wrong kind of surface still fails. */
    function allowedAA(fg, bg, bgL, large) {
      if (fg === '#675e7c' && bgL >= 0.55) return true; // tokens.css:19 meta text on light surfaces
      if (['#8a84a1', '#9a94b1', '#b7b2cd'].includes(fg) && bgL <= 0.05) return true; // tokens.css:78-81 ink text ramp
      if (fg === '#8a5606' && bgL >= 0.8) return true; // tokens.css:66 warn-tx
      if (fg === '#08674e' && bgL >= 0.8) return true; // tokens.css:64 ok-tx
      if (fg === '#086a5e' && bgL >= 0.8) return true; // tokens.css:58 teal-700 text
      if (fg === '#7d4d08' && bgL >= 0.8) return true; // tokens.css:46 gold-700 text (6.65 on gold-50)
      if (fg === '#0b63d6' && bgL >= 0.8) return true; // tokens.css:70 info-tx
      if (fg === '#a3660f' && bgL >= 0.8 && large) return true; // tokens.css:45 gold-600, large only
      if (fg === '#ffffff' && bg === '#6a35e0') return true; // tokens.css:33 button fill
      return false;
    }

    const fails = [];
    let checked = 0;
    let skipped = 0;
    const seenEl = new Set();
    const seenCombo = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = walker.nextNode())) {
      if (!t.textContent.trim()) continue;
      const el = t.parentElement;
      if (!el || seenEl.has(el)) continue;
      seenEl.add(el);
      if (el.closest('script,style,noscript')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const fs = parseFloat(cs.fontSize);
      if (!fs) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      const fg0 = parse(cs.color);
      if (!fg0 || fg0.a === 0) continue;
      const bg = solidBg(el);
      if (!bg) { skipped++; continue; }
      checked++;
      const fg = fg0.a < 1 ? comp(fg0, bg) : fg0;
      const ratio = ratioOf(fg, bg);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = fs >= 24 || (fs >= 18.66 && weight >= 700);
      const aa = large ? 3 : 4.5;
      const aaa = large ? 4.5 : 7;
      if (ratio >= aaa) continue;
      const fgH = hex(fg);
      const bgH = hex(bg);
      const hardFail = ratio < aa;
      if (!hardFail && allowedAA(fgH, bgH, lum(bg), large)) continue;
      const combo = `${fgH} on ${bgH} ${large ? 'L' : 'n'}`;
      if (seenCombo.has(combo)) continue;
      seenCombo.add(combo);
      const where = el.className ? `.${String(el.className).split(' ')[0]}` : el.tagName;
      fails.push(
        `${ratio.toFixed(2)} ${fgH} on ${bgH} (${large ? 'large' : 'normal'}${hardFail ? ', BELOW AA' : ''}) ${where} "${t.textContent.trim().slice(0, 30)}"`
      );
    }
    return { checked, skipped, fails };
  });
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
      // Nav links transition `all` over --dur-2 (180ms), outline included, so
      // an immediate read catches 0-1px mid-animation. Wait for the property
      // to arrive rather than guessing how long it takes: a fixed 300ms pause
      // passed on an idle machine and failed on a busy one, which is a flaky
      // gate — the same defect class as timing out an injected script.
      // Wait for the value to STOP CHANGING, not merely to become non-zero:
      // the transition steps 0 → 1px → 2px → 3px, so "> 0" still samples the
      // animation mid-flight. Two identical consecutive reads means the
      // outline has settled. (Third attempt at this check — the first used a
      // fixed pause, the second stopped at the first non-zero frame.)
      const ring = await page.evaluate(async () => {
        const read = () => {
          const cs = getComputedStyle(document.activeElement);
          return `${cs.outlineColor} / ${cs.outlineWidth} / ${cs.outlineStyle}`;
        };
        const deadline = Date.now() + 2000;
        let prev = read();
        let stable = 0;
        while (Date.now() < deadline && stable < 2) {
          await new Promise((r) => setTimeout(r, 60));
          const now = read();
          if (now === prev) stable += 1;
          else { stable = 0; prev = now; }
        }
        return prev;
      });
      if (!/rgb\(11, 99, 214\)/.test(ring)) note(`${tag}: keyboard focus ring on ${sel} = ${ring}`);
    }
    if (res.navLabels.long === res.navLabels.short)
      note(`${tag}: demo button labels long=${res.navLabels.long} short=${res.navLabels.short} — exactly one must be visible`);
    footerJoins.set(tag, res.footerMarginTop);

    const contrast = await contrastScan(page);
    for (const f of contrast.fails) note(`${tag}: contrast ${f}`);
  }
}

/* ---- axe-core, WCAG A/AA rule set ----------------------------------------
   Runs in its own context with bypassCSP: the enforced page CSP rightly
   blocks injected inline scripts, and axe only READS the DOM, so bypassing
   is safe here and nowhere else. axe's color-contrast rule is disabled on
   purpose — the solid-background gate above is the contrast authority, and
   axe guesses on exactly the gradient surfaces that gate skips. */
const axeSource = readFileSync(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8'
);
const axeCtx = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  bypassCSP: true
});
const axePage = await axeCtx.newPage();
for (const locale of ['es', 'en']) {
  for (const r of ROUTES) {
    await axePage.goto(`${BASE}/${locale}${r}`, { waitUntil: 'domcontentloaded' });
    // evaluate(), not addScriptTag(). addScriptTag waits for the page to
    // settle, and the framed showcase refuses to load from any origin its
    // frame-ancestors does not list — which is every origin except
    // production. That refusal surfaced as a rejection from addScriptTag
    // roughly half the time, depending on whether the frame lost its race
    // with the injection: a genuinely flaky gate, and it failed CI before
    // it failed here. evaluate() runs the source directly and never waits
    // on subresources.
    await axePage.evaluate(axeSource);
    const result = await axePage.evaluate(() =>
      axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      })
    );
    for (const v of result.violations) {
      note(
        `${locale}${r || '/'}: axe ${v.id} (${v.impact}) ×${v.nodes.length} — ${v.help} e.g. ${v.nodes[0]?.target?.[0]}`
      );
    }
  }
}
await axeCtx.close();

const joinValues = new Set(footerJoins.values());
if (joinValues.size !== 1) {
  const byValue = {};
  for (const [tag, v] of footerJoins) (byValue[v] ??= []).push(tag);
  note(`footer join differs across pages: ${JSON.stringify(byValue)}`);
}

await b.close();
// Counted, not hard-coded: the summary said "24 renders" for a while after a
// 13th route was added, which is exactly the kind of quietly-wrong number this
// audit exists to catch elsewhere.
console.log(
  fail.length
    ? 'FINDINGS:\n' + fail.join('\n')
    : `audit clean: ${ROUTES.length * 2} page renders + 2 404s + ${ICON_FILES.length} icons + manifest + solid-bg contrast + axe WCAG A/AA`
);
