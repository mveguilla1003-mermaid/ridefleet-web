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
scripts/                   the three verification gates (below)
```

Routing is `localePrefix: 'always'` with `localeDetection: false`: `/es/...` and
`/en/...` are both real, crawlable URLs, and `Accept-Language` never force-redirects
anyone. `hreflang` is emitted as full BCP-47 tags (`es-PR`, `en-US`) plus `x-default`
pointing at the Spanish URL, matching `<html lang>` on every page.

Styling is plain CSS with a token layer — no Tailwind, no CSS-in-JS. Nothing outside
`tokens.css` introduces a colour, radius, shadow or spacing value.

## Verification gates

```bash
npm run check:i18n     # key parity across locales, no empty values, no emoji
npm run build          # typecheck + production build
npm run verify:shots   # 12 routes × 2 locales × 4 viewports → verify/shots/*.png
npm run verify:a11y    # 24 renders: labels, focus ring, headings, metadata
```

The last two need the production server already running (`npm start`) and use the
sandbox's preinstalled Chromium via an explicit `executablePath` — do not run
`npx playwright install`. `verify:a11y` checks accessible names on every link and
button, labels on every form control, no `href="#"`, no dead in-page anchors, `img`
alt text, `<html lang>`, title and description length, canonical, the `hreflang`
set, exactly one `h1`, no heading-level jumps, no emoji, and that the computed
focus outline is the blue `rgb(11, 99, 214)` rather than brand purple.

Current status: all four gates pass. 30 static pages build; 1963 message keys are in
parity; 96 full-page screenshots render clean with no console errors and no element
left unrevealed.

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
