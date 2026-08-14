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
npm run verify:shots   # 12 routes × 2 locales × 4 viewports → verify/shots/*.png
npm run verify:a11y    # 24 renders + both 404s + icon downloads (below)
```

The last two need the production server already running (`npm start`). In the CI
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
button never shows both its long and short label at once; and the footer joins
every page at the same computed margin.

## Generated assets

```bash
npm run build:icons    # 7 icon files + manifest.webmanifest from site.brandHex
npm run build:og       # one 1200×630 OG card per route per locale → public/og/
```

`build:icons` FAILS if `site.brandHex` drifts from `--p-700` in tokens.css —
brandHex is the one sanctioned colour outside tokens.css (theme-color is parsed
before any stylesheet loads), and the gate keeps the exception honest. `build:og`
titles every card from the route's own `meta` strings; rerun it after copy
changes. Both write committed files in `public/`.

Current status: all gates pass. 1963 message keys are in parity; 96 full-page
screenshots render clean with no console errors and no element left unrevealed.

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

The eleven partner logo slots on `/design-partners` render as visibly empty dashed
boxes. That is deliberate — replace them with real logos as partners sign, and note
that the page's own copy commits to a cohort of three to five, so eleven slots is
more room than the promise. Reconcile one or the other before launch.

The demo form posts to `/api/lead`, which currently validates and logs. Point it at
your CRM or form provider before you take real leads.

`/privacy`, `/terms` and `/cookies` were drafted to be structurally complete and
legally reviewable, not to be legally correct out of the box. They take positions —
a 24-month retention window and Puerto Rico governing law among them — that a lawyer
needs to confirm or replace. `/security` likewise describes intended controls;
anything not yet true should be badged or cut.

Features still in progress carry an inline "En construcción / Building" badge next to
the claim itself, never in a footnote. Remove each badge as the feature ships.
`grep -rn "buildingBadge\|badge-building" src` finds them all.
