#!/usr/bin/env node
/**
 * End-to-end verification of the demo form — the site's only conversion.
 *
 * Two layers:
 *   1. API contract, straight at /api/lead: bad JSON, missing fields,
 *      invalid email, honeypot discard, under-3s timing discard, and the
 *      happy path (delivered:false while CRM_WEBHOOK_URL is unset).
 *   2. Browser flow in the real UI: an empty submit must trap focus in the
 *      role="alert" summary with one link per broken field and go nowhere;
 *      a real submission must reach /es/demo/thank-you with a non-skipped
 *      API response; a bot-style submission (honeypot filled) must ALSO
 *      reach thank-you — being indistinguishable is the design — while the
 *      API quietly answers skipped:true.
 *
 * Timing note: both browser submissions wait out the 3-second human floor
 * first, so a discard in the honeypot case is attributable to the honeypot
 * alone, not to submitting too fast.
 *
 * Needs the production server running (npm start), like the other gates.
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const fail = [];
const note = (m) => fail.push(m);

/* ---- 1. API contract ---------------------------------------------------- */

async function post(body) {
  const res = await fetch(`${BASE}/api/lead`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON reply is its own failure */ }
  return { status: res.status, json };
}

// Clearly-labeled test data: this lead lands in the server log by design.
const VALID = {
  name: 'Prueba verify:form',
  company: 'Suite de verificación',
  email: 'verify-form@example.com',
  phone: '+1 787 555 0100',
  fleetSize: '10-49',
  businessModel: 'rental',
  products: ['toll-bridge'],
  demoLanguage: 'es',
  notes: 'Enviado por scripts/verify-form.mjs',
  consent: true,
  locale: 'es',
  company_website: '',
  elapsedMs: 8000
};

{
  const r = await post('this is not json');
  if (r.status !== 400 || r.json?.error !== 'bad_json')
    note(`api: bad JSON → ${r.status} ${JSON.stringify(r.json)}, expected 400 bad_json`);
}
{
  const r = await post({ locale: 'es', elapsedMs: 9000 });
  const fields = r.json?.fields ?? [];
  if (r.status !== 422 || r.json?.error !== 'missing_fields')
    note(`api: empty payload → ${r.status} ${JSON.stringify(r.json)}, expected 422 missing_fields`);
  for (const f of ['name', 'company', 'email', 'fleetSize'])
    if (!fields.includes(f)) note(`api: missing_fields does not list "${f}"`);
}
{
  const r = await post({ ...VALID, email: 'not-an-address' });
  if (r.status !== 422 || r.json?.error !== 'invalid_email')
    note(`api: bad email → ${r.status} ${JSON.stringify(r.json)}, expected 422 invalid_email`);
}
{
  const r = await post({ ...VALID, company_website: 'http://spam.example' });
  if (r.status !== 200 || r.json?.skipped !== true)
    note(`api: honeypot → ${r.status} ${JSON.stringify(r.json)}, expected 200 skipped:true`);
}
{
  const r = await post({ ...VALID, elapsedMs: 400 });
  if (r.status !== 200 || r.json?.skipped !== true)
    note(`api: 400ms submit → ${r.status} ${JSON.stringify(r.json)}, expected 200 skipped:true`);
}
{
  const r = await post(VALID);
  if (r.status !== 200 || r.json?.ok !== true || r.json?.delivered !== false || r.json?.skipped)
    note(`api: valid lead → ${r.status} ${JSON.stringify(r.json)}, expected ok:true delivered:false (no CRM configured)`);
}

/* ---- 2. Browser flow ----------------------------------------------------- */

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};
const browser = await chromium.launch(launchOpts);
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();

const HUMAN_FLOOR_MS = 3600; // API discards < 3000ms; leave margin

async function fillHappyForm() {
  await page.fill('#f-name', 'Prueba verify:form');
  await page.fill('#f-company', 'Suite de verificación');
  await page.fill('#f-email', 'verify-form@example.com');
  await page.fill('#f-phone', '+1 787 555 0100');
  await page.selectOption('#f-op', 'rental');
  await page.selectOption('#f-size', '10-49');
  await page.check('#f-consent');
}

// 2a. Empty submit: role="alert" summary takes focus, one link per field, no navigation.
await page.goto(`${BASE}/es/demo`, { waitUntil: 'networkidle' });
await page.click('#submitBtn');
await page.waitForSelector('#errSum');
const summary = await page.evaluate(() => ({
  focused: document.activeElement?.id === 'errSum',
  links: document.querySelectorAll('#errSum a[href^="#f-"]').length,
  path: location.pathname
}));
if (!summary.focused) note('form: error summary did not take focus on empty submit');
if (summary.links !== 7) note(`form: error summary lists ${summary.links} fields, expected 7`);
if (!summary.path.endsWith('/es/demo')) note(`form: empty submit navigated to ${summary.path}`);

// 2b. Small-fleet routing note appears for 1-9 and goes away again.
await page.selectOption('#f-size', '1-9');
if ((await page.locator('#routing').count()) !== 1) note('form: 1-9 fleet size did not show the routing note');
await page.selectOption('#f-size', '10-49');
if ((await page.locator('#routing').count()) !== 0) note('form: routing note did not clear after leaving 1-9');

// 2c. Happy path: real submission lands on thank-you, API says delivered (not skipped).
await page.goto(`${BASE}/es/demo`, { waitUntil: 'networkidle' });
await fillHappyForm();
await page.waitForTimeout(HUMAN_FLOOR_MS);
const [happyResp] = await Promise.all([
  page.waitForResponse((r) => r.url().endsWith('/api/lead')),
  page.click('#submitBtn')
]);
const happyJson = await happyResp.json();
if (!(happyJson.ok === true && happyJson.delivered === false && !happyJson.skipped))
  note(`form: happy path API reply ${JSON.stringify(happyJson)}, expected ok:true delivered:false, not skipped`);
await page.waitForURL('**/es/demo/thank-you', { timeout: 10000 }).catch(() => {
  note(`form: happy path did not reach /es/demo/thank-you (at ${page.url()})`);
});

// 2d. Honeypot: bot fills the invisible field → API discards, UI still thanks it.
await page.goto(`${BASE}/es/demo`, { waitUntil: 'networkidle' });
await fillHappyForm();
await page.evaluate(() => {
  // React controlled input: go through the native setter so state updates.
  const el = document.getElementById('company_website');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, 'http://spam.example');
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(HUMAN_FLOOR_MS);
const [botResp] = await Promise.all([
  page.waitForResponse((r) => r.url().endsWith('/api/lead')),
  page.click('#submitBtn')
]);
const botJson = await botResp.json();
if (botJson.skipped !== true)
  note(`form: honeypot submission reply ${JSON.stringify(botJson)}, expected skipped:true`);
await page.waitForURL('**/es/demo/thank-you', { timeout: 10000 }).catch(() => {
  note('form: honeypot submission should still reach thank-you (bots must not learn they were caught)');
});

await browser.close();
console.log(
  fail.length
    ? 'FINDINGS:\n' + fail.join('\n')
    : 'form clean: 6 API contracts + empty-submit a11y + routing note + happy path + honeypot discard'
);
process.exit(fail.length ? 1 : 0);
