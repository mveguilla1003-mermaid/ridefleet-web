import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Target defaults to the local production server; point it at a deploy with
// BASE_URL=https://example.com npm run verify:a11y
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

const ROUTES = ['', '/ride-fleet-manager', '/toll-bridge', '/valet',
  '/pricing', '/demo', '/demo/thank-you', '/security',
  '/privacy', '/terms', '/cookies', '/accessibility'];
const VIEWPORTS = [[390, 844], [768, 1024], [1024, 900], [1440, 1000]];
// Shots land inside the repo so the script works from any checkout location.
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'verify', 'shots');
mkdirSync(OUT, { recursive: true });

// The CI sandbox preinstalls Chromium at a fixed path; anywhere else we fall
// back to Playwright's own managed browser (npx playwright install chromium).
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};
const browser = await chromium.launch(launchOpts);
const problems = [];
const framingNoted = new Set();

for (const locale of ['es', 'en']) {
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    // The framed showcase sets `frame-ancestors` to the production origins,
    // so it refuses to render from 127.0.0.1 — every local and CI run logs
    // that refusal. It is the far end being correctly locked down, not a
    // defect here, so it is reported once rather than failing the sweep.
    // The trade-off is real: a genuinely broken embed looks the same from
    // localhost, so the embed is only provable on a deployed origin.
    const framingRefusal = /Refused to frame .*ridefleetmanager\.com/;
    page.on('console', m => {
      if (m.type() !== 'error') return;
      const text = m.text();
      if (framingRefusal.test(text)) { framingNoted.add(text.slice(0, 120)); return; }
      errs.push(text);
    });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    for (const r of ROUTES) {
      const url = `${BASE}/${locale}${r}`;
      const resp = await page.goto(url, { waitUntil: 'networkidle' });
      if (resp.status() !== 200) problems.push(`${resp.status()} ${url}`);
      // force the whole page through the reveal sweep
      // `html{scroll-behavior:smooth}` means a plain scrollTo animates, and a
      // fast loop just retargets the animation without ever reaching the
      // bottom — so the sweep must be explicitly instant.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 200));
      });
      // Blank any embedded frame before the shot. The product showcase
      // auto-advances every 7s, so its content differs on every capture —
      // left visible it would fail verify:diff on every run for a reason
      // that has nothing to do with our own markup. `visibility` rather
      // than `display` so the frame keeps its box and the page below it
      // does not shift.
      // Freeze motion. The scroll sweep above arms every `.reveal`, but their
      // transitions were still running 200ms later, and two elements animate
      // forever regardless: the voice waveform bars on /valet and the
      // turn-ready ring's arc on the home page. Shooting mid-animation made
      // 46 of 112 captures differ between two runs of IDENTICAL code —
      // measured, not guessed. The noise stayed under the 1% allowance
      // locally, but it is exactly the kind of drift that fails on a loaded
      // CI runner and teaches people to re-run until green.
      //
      // Killing `animation`/`transition` outright (rather than zeroing their
      // duration) leaves every element at the state its CSS declares, so
      // `.reveal.is-in` still lands fully revealed and the ring still draws
      // its arc — verified by eye against the pre-freeze captures.
      await page.addStyleTag({
        content: `iframe{visibility:hidden}
          *,*::before,*::after{
            animation:none !important;
            transition:none !important;
            caret-color:transparent !important;
          }`
      });

      const hidden = await page.evaluate(() =>
        document.querySelectorAll('.reveal:not(.is-in)').length);
      if (hidden) problems.push(`${hidden} unrevealed .reveal on ${url}`);
      const name = `${locale}${r.replace(/\//g, '_') || '_home'}--${w}.png`;
      await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
    }
    if (errs.length) problems.push(`console @${locale}/${w}: ${[...new Set(errs)].slice(0,4).join(' | ')}`);
    await ctx.close();
  }
}
await browser.close();
for (const note of framingNoted) {
  console.log(`  · expected off-production: ${note}`);
}
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'captures clean: no non-200, no unrevealed .reveal, no console errors');
