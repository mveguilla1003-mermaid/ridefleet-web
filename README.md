# Ride Fleet — marketing site

Next.js 14 App Router marketing site for Ride Fleet Manager, Toll Bridge and Voz AI.
Built from the approved `site-v2` design ("Direction C — Product-Led Premium") and
`WEBSITE_PLAN.md` §8. Spanish is the default locale; English is a full peer, not a
translation afterthought.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000 → redirects to /es
npm run build && npm start
```

Node 18.17+ is required (Next 14 baseline). No database, no CMS: every string lives
in `src/messages/`, every constant in `src/lib/site.ts`.

## What is where

```
src/app/[locale]/          one folder per route, all locale-prefixed
src/app/api/lead/          POST endpoint the demo form submits to
src/components/            header, footer, sticky CTA, icons, shared UI primitives
src/i18n/routing.ts        locales, defaultLocale, typed Link/redirect/usePathname
src/lib/site.ts            single source of truth for constants + the placeholders
src/lib/seo.ts             title/description/canonical/hreflang/OG/Twitter builder
src/messages/<locale>/     one JSON file per namespace, ES and EN in strict parity
src/styles/                tokens → base → components → additions, plus per-page CSS
scripts/                   the verification gates + the icon/OG generators (below)
```

Routing is `localePrefix: 'always'` with `localeDetection: false`: `/es/...` and
`/en/...` are both real, crawlable URLs, and `Accept-Language` never force-redirects
anyone. `hreflang` is emitted as full BCP-47 tags (`es-PR`, `en-US`) plus `x-default`
pointing at the Spanish URL, matching `<html lang>` on every page.

The middleware also enforces a nonce-based Content-Security-Policy (see
`src/middleware.ts` for the directive-by-directive reasoning). The nonce is minted
per request, which is why every page renders dynamically — the root layout reads
`headers()` on purpose; without it the prerendered HTML shipped inline scripts with
no nonce and the browser blocked hydration site-wide. That trades static-file TTFB
for a strict CSP; revisit only as a pair (static + no nonces, or dynamic + nonces).
When the scheduler embed goes live, its origin must be added to `frame-src`.

Styling is plain CSS with a token layer — no Tailwind, no CSS-in-JS. Nothing outside
`tokens.css` introduces a colour, radius, shadow or spacing value.

## Verification gates

```bash
npm run check:i18n     # key parity across locales, no empty values, no emoji
npm run build          # typecheck + production build
npm run verify:shots   # 13 routes × 2 locales × 4 viewports → verify/shots/*.png
npm run verify:a11y    # every route × 2 + both 404s + icon downloads (below)
npm run verify:form    # the demo form, end to end (below)
```

The last three need the production server already running (`npm start`). In the CI
sandbox they use its preinstalled Chromium; on any other machine they fall back to
Playwright's managed browser (`npx playwright install chromium` once).
`verify:a11y` checks accessible names on every link and button, labels on every
form control, no `href="#"`, no dead in-page anchors, `img` alt text, `<html
lang>`, title and description length, canonical, the `hreflang` set, exactly one
`h1`, no heading-level jumps, no emoji, and that the computed focus outline is the
blue `rgb(11, 99, 214)` rather than brand purple — sampled under real keyboard
modality on the header nav, the ES|EN switch and the footer, not just the first
focusable. It also asserts: the 404 under both locale prefixes is a real
server-rendered bilingual page (status 404, both language blocks and a stylesheet
in the RAW served HTML, noindex, one `h1`); all seven icon files actually download
with the magic bytes their names claim (plus a well-formed manifest); the demo
button never shows both its long and short label at once; the footer joins every
page at the same computed margin; every visible text node over a solid background
meets WCAG AAA or one of the AA-by-design pairs documented in tokens.css (each
allowance in `scripts/audit.mjs` cites its tokens.css line; gradient-backed mockup
text is skipped, not guessed at); and the full axe-core WCAG A/AA rule set passes
(color-contrast off — the solid-background gate is the authority there).

`verify:diff` (CI only, by default) pixel-diffs the fresh `verify:shots` captures
against the baseline artifact of the last successful run on `main` and fails any
page where more than 1% of pixels changed, uploading diff images as an artifact.
Baselines are run artifacts, never committed: full-page shots would bloat the
repo, and shots from different machines differ in font rasterisation anyway.
Intentional restyles land with `[visual-baseline]` in the commit message — and
remember that editing copy on a prose page moves pixels exactly as CSS does. To
use locally: put reference shots in `verify/baseline` and run `npm run
verify:diff`.

A run publishes its shots as the next baseline when the sweep captured cleanly
and the diff did not object — deliberately **not** only when the whole job is
green. Tying it to the whole job made one failure poison the next commit: a run
whose diff was skipped but whose audit failed published nothing, so the
following commit compared against a stale baseline and failed for changes it
had not made.

`verify:form` exercises the site's one conversion end to end: the API contract of
`/api/lead` (bad JSON, missing fields, invalid email, honeypot and under-3-seconds
discards, happy path), and the real UI — an empty submit must trap focus in the
`role="alert"` summary and go nowhere; a real submission must land on thank-you
with a non-skipped API reply; a honeypot submission must ALSO land on thank-you
(bots must not learn they were caught) while the API answers `skipped:true`.

## Generated assets

```bash
npm run build:icons    # 7 icon files + manifest.webmanifest from site.brandHex
npm run build:og       # one 1200×630 OG card per route per locale → public/og/
npm run check:og       # fails if any card's text has moved on since it rendered
```

`build:icons` FAILS if `site.brandHex` drifts from `--p-700` in tokens.css —
brandHex is the one sanctioned colour outside tokens.css (theme-color is parsed
before any stylesheet loads), and the gate keeps the exception honest. `build:og`
titles every card from the route's own `meta` strings and records a hash of each
card's text in `public/og/manifest.json`; `check:og` (a CI gate) recomputes those
hashes so editing a meta description without rerunning `build:og` fails the build
instead of silently shipping a stale social card. The hash covers the TEXT, not
the pixels, because the cards use the system font stack — the same content
renders to different bytes on different machines. Both write committed files in
`public/`.

Adding a route means touching the route list in four scripts — `capture.mjs`,
`audit.mjs`, `build-og.mjs` and `build-lastmod.mjs` — plus `routes` in
`src/lib/site.ts`, which the sitemap and navigation derive from. There is no
single registry; if you add a page and skip one of them, that page silently
falls out of a gate.

Current status: all gates pass, with every message key in locale parity and
every full-page screenshot rendering clean — no console errors, no element left
unrevealed.

## Placeholders — these are yours to fill

Every one of these is read from an environment variable, so switching it on is a
deploy-config change, not a code change. Nothing here fabricates proof: until you
set them, the site shows an honest gap rather than an invented value.

| Env var | Today | What it needs |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://ridefleet.com` | the real production origin, no trailing slash |
| `NEXT_PUBLIC_DEMO_PHONE_DISPLAY` | `+1 787 XXX-XXXX` | the tracked demo line, as you want it printed |
| `NEXT_PUBLIC_DEMO_PHONE_E164` | *(empty)* | same number in E.164. **While empty, no `tel:` link renders anywhere** — the masked number is display-only by design |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hola@ridefleet.com` | confirm this mailbox exists |
| `NEXT_PUBLIC_SCHEDULER_URL` | *(empty)* | the scheduler embed. Empty renders the form-only path, with space already reserved so adding it costs no layout shift |

Four more items live outside env config:

The five partner logo slots on `/design-partners` render as visibly empty dashed
boxes. That is deliberate — replace them with real logos as partners sign. The
count matches the largest cohort the page's own copy promises ("three to five");
it used to be eleven, which advertised more vacancies than the promise and
contradicted the page's claim that it only advertises real scarcity.

The demo form posts to `/api/lead`, which validates, spam-screens, rate-limits and
delivers. **Until one of the two destinations below is configured, a submitted
lead reaches nobody — it is written to the server log and nothing else.**

| Destination | Set | Notes |
|---|---|---|
| HubSpot | `HUBSPOT_PORTAL_ID` + `HUBSPOT_FORM_GUID` | Preferred. Both are public form ids, not secrets, and the Forms API needs no key. The lead arrives as a contact. |
| Any other CRM | `CRM_WEBHOOK_URL` (+ `CRM_WEBHOOK_TOKEN` for a Bearer header) | Flat JSON POST of the whole lead. |

HubSpot is checked first. Delivery failures never fail the visitor's submission —
the lead falls back to the log and the form still thanks them.

Only standard HubSpot contact properties are used, so this works against a brand
new portal with nothing configured. Everything the qualifying form asks that
HubSpot has no standard property for — fleet size, business model, products of
interest, demo language, consent, UTM set — is folded into the note rather than
mapped onto custom properties, because a property name the portal does not know
is rejected silently and the lead would look delivered and arrive empty. Promote
individual lines to real properties later if sales wants to filter on them; see
`src/lib/crm.ts`.

`/privacy`, `/terms` and `/cookies` were drafted to be structurally complete and
legally reviewable, not to be legally correct out of the box. They take positions —
a 24-month retention window and Puerto Rico governing law among them — that a lawyer
needs to confirm or replace. `/security` likewise describes intended controls;
anything not yet true should be badged or cut.

Features still in progress carry an inline "En construcción / Under construction"
badge next to the claim itself, never in a footnote. Remove each badge as the
feature ships.
`grep -rn "buildingBadge\|badge-building" src` finds them all.
