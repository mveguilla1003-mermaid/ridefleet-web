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
      // focus ring colour on the first focusable
      const el = document.querySelector('a[href], button');
      el.focus();
      const cs = getComputedStyle(el);
      out.focus = cs.outlineColor + ' / ' + cs.outlineWidth + ' / ' + cs.outlineStyle;
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
  }
}
await b.close();
console.log(fail.length ? 'FINDINGS:\n' + fail.join('\n') : 'audit clean across 24 page renders');
