import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Demo-request intake.
 *
 * PLACEHOLDER (E0.2.1 / Q4): there is no CRM selected yet, so this route
 * validates, spam-screens and LOGS the lead rather than pretending to deliver
 * it. `CRM_WEBHOOK_URL` is the single switch that turns it live — nothing else
 * in the form path changes.
 *
 * Spam screening is honeypot + submit-timing only. hCaptcha/Turnstile is a
 * deliberate M1 follow-up (E3.5.1); adding a key here without an account would
 * be a dead control.
 */

type Payload = Record<string, unknown>;

/* ---- Rate limit ---------------------------------------------------------
 * Defence in depth behind the honeypot and the timing floor, aimed at the
 * one thing abuse here actually costs: a pipeline full of junk leads.
 *
 * KNOWN LIMIT, stated rather than papered over: this counter lives in the
 * instance's memory. On serverless each warm instance keeps its own, and a
 * cold start resets it, so a distributed flood is only partly slowed. The
 * robust version needs a shared store (Vercel KV / Upstash); this stops the
 * trivial script, which is what actually shows up.
 *
 * Loopback callers are exempt. `next start` sets `x-forwarded-for` even
 * locally — so testing for a missing header was not enough — and without
 * the exemption verify:form throttles itself: its own eight submissions
 * survive one run and then trip the limit on the second, since the counter
 * outlives the run. Behind a real proxy a client IP is never loopback, so
 * nothing is weakened in production.
 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']);
const hits = new Map<string, number[]>();

function rateLimited(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return false;
  const ip = forwarded.split(',')[0].trim();
  if (!ip || LOOPBACK.has(ip)) return false;

  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound on a long-lived
  // instance; cheap because it only runs when the map is already large.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > RATE_MAX;
}

const REQUIRED = ['name', 'company', 'email', 'fleetSize', 'locale'] as const;
const MAX_LEN = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LEN) : '';
}

export async function POST(request: Request) {
  if (rateLimited(request)) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': '600' } }
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (clean(body.company_website)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Timing: a form completed in under 3 seconds was not typed by a human.
  const elapsed = Number(body.elapsedMs ?? 0);
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 3000) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const missing = REQUIRED.filter((field) => !clean(body[field]));
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: 'missing_fields', fields: missing },
      { status: 422 }
    );
  }

  if (!EMAIL.test(clean(body.email))) {
    return NextResponse.json(
      { ok: false, error: 'invalid_email', fields: ['email'] },
      { status: 422 }
    );
  }

  const lead = {
    receivedAt: new Date().toISOString(),
    name: clean(body.name),
    company: clean(body.company),
    email: clean(body.email),
    phone: clean(body.phone),
    role: clean(body.role),
    fleetSize: clean(body.fleetSize),
    businessModel: clean(body.businessModel),
    products: Array.isArray(body.products)
      ? body.products.map(clean).filter(Boolean)
      : [],
    demoLanguage: clean(body.demoLanguage),
    notes: clean(body.notes),
    consent: Boolean(body.consent),
    // Attribution — captured on every submission (WEBSITE_PLAN §8.3).
    locale: clean(body.locale),
    utm: {
      source: clean(body.utm_source),
      medium: clean(body.utm_medium),
      campaign: clean(body.utm_campaign),
      term: clean(body.utm_term),
      content: clean(body.utm_content)
    },
    referrer: clean(body.referrer),
    landingPath: clean(body.landingPath)
  };

  const webhook = process.env.CRM_WEBHOOK_URL;
  if (!webhook) {
    console.info('[lead] no CRM_WEBHOOK_URL configured — lead retained in logs only', lead);
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.CRM_WEBHOOK_TOKEN
          ? { authorization: `Bearer ${process.env.CRM_WEBHOOK_TOKEN}` }
          : {})
      },
      body: JSON.stringify(lead)
    });
    if (!res.ok) throw new Error(`crm responded ${res.status}`);
  } catch (error) {
    // The visitor already typed everything; never lose the lead to a 500.
    console.error('[lead] CRM delivery failed, lead retained in logs', error, lead);
    return NextResponse.json({ ok: true, delivered: false });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
