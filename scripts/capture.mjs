import { chromium } from 'playwright';

// Target defaults to the local production server; point it at a deploy with
// BASE_URL=https://example.com npm run verify:a11y
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

const ROUTES = ['', '/ride-fleet-manager', '/toll-bridge', '/voz-ai', '/demo',
  '/demo/thank-you', '/design-partners', '/security', '/privacy', '/terms',
  '/cookies', '/accessibility'];
const VIEWPORTS = [[390, 844], [768, 1024], [1024, 900], [1440, 1000]];
const OUT = '/home/claude/ridefleet-web/verify/shots';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const problems = [];

for (const locale of ['es', 'en']) {
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
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
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'captures clean: no non-200, no unrevealed .reveal, no console errors');
