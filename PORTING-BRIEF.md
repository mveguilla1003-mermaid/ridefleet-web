# Porting brief — static page → React route

Read this before touching anything. It is the same contract for every page.

## The job

Port one approved static page from `/home/claude/site-v2/NN-*.html` into this
Next.js App Router repo, with every visible string moved into next-intl message
catalogs. The static page is the **specification**: the rendered result must be
visually indistinguishable from it at 1440px, and its already-verified responsive
behaviour must survive.

## Files you own (write ONLY these)

- `src/app/[locale]/<route>/page.tsx` (home is `src/app/[locale]/page.tsx`)
- `src/app/[locale]/<route>/*.tsx` — any additional components this page needs
- `src/messages/es/<namespace>.json`
- `src/messages/en/<namespace>.json`

## Files you must NOT touch

`src/app/[locale]/layout.tsx`, `src/app/layout.tsx`, `src/components/*`,
`src/lib/*`, `src/i18n/*`, `src/styles/*` (including `pages/*.css`),
`src/messages/index.ts`, `src/messages/{es,en}/_core.json`,
`src/messages/{es,en}/supporting.json`, `scripts/*`, `package.json`,
`next.config.mjs`. Another agent owns each of those. If you believe one needs a
change, say so in your final report instead of editing it.

## How the markup translates

The static page has ONE `<style>` block: the shared design system followed by a
page-specific tail. Both are already extracted — the shared part into
`src/styles/{tokens,base,components}.css` (loaded by the layout) and the tail
into `src/styles/pages/<route>.css`. **Import your page CSS at the top of your
`page.tsx`:** `import '@/styles/pages/<route>.css';`. Do not copy any CSS into
your files and do not add inline `<style>`.

Keep the class names from the static HTML verbatim — the CSS depends on them.
Convert `class` → `className`, `for` → `htmlFor`, self-close void elements,
and turn inline `style="..."` into a style object only where the static page
genuinely used one.

Read `RECONCILIATION.md` first. Three pages had their shared components rewritten
in place; those rewrites now exist as **opt-in modifier classes**, so if your
static page's closing CTA or trust strip does not look like the canonical base,
the matching modifier is already in `components.css` — add the class:

- `01-home.html` closing CTA → `class="cta-band cta-band--duo"`, action column
  `class="cta-act"`; its partner card → `class="partner-invite partner-invite--flush"`
- `02-ride-fleet-manager.html` closing CTA → `class="cta-band cta-band--split"`
- `03-toll-bridge.html` trust strip → `class="trust trust--rail"`; its closing
  CTA already uses `.cta-close` / `.cta-grid` / `.cta-agenda`, unchanged
- Any 6-column data table that must survive a phone → add `tbl--stack`

## Icons

`import { Icon } from '@/components/Icons'` and render `<Icon name="i-…" />`.
The sprite is injected once by the layout — never inline an `<svg><symbol>` set.
`ICON_NAMES` in that file lists all 52; if the static page used a symbol id that
is not in the union, TypeScript will tell you — pick the nearest existing icon
and note the substitution in your report. **Never add a new icon.**

## Shared components

`src/components/ui.tsx` exports `Section`, `Band`, `SectionHead`, `Eyebrow`,
`ButtonLink`, `ButtonAnchor`, `ArrowLink`, `Chip`, `BuildingBadge`, `Faq`,
`Rule`, `SampleDataNote`, `VisuallyHidden`. Read the file — use them wherever
the static markup matches, and drop to plain JSX where it does not. Internal
links MUST use `Link` from `@/i18n/routing` (never `next/link`, never a bare
`<a href="/…">`) so the locale prefix is applied. Route paths come from
`routes` in `@/lib/site` — never hardcode `/toll-bridge`.

## i18n — the hard rule

The static pages carried both languages as paired `<span class="es">` /
`<span class="en">` elements. **Not one of those may survive.** Every visible
string, every `aria-label`, every `alt`, every `<title>`/`<desc>` inside an
inline SVG, and every string inside sample data goes into your two namespace
JSON files, and is read with `useTranslations('<namespace>')` in a server
component. No string literals in JSX.

- Keys are `camelCase`, nested by section, e.g. `hero.title`, `router.q1.label`.
- Both files must have **identical key sets**. `npm run check:i18n` fails the
  build otherwise, and it also fails on empty values, on emoji, and on an
  `es` value byte-identical to its `en` value unless the value is a proper noun,
  a plate, a number or a currency amount.
- Your namespace MUST include `meta.title` and `meta.description` — real ones,
  not stubs; `buildMetadata` reads them.
- Lists render from arrays in the catalog. next-intl cannot map arrays with
  `t()`, so read them with `useMessages()` and cast, or key them as
  `items.0.title`, `items.1.title` and map over a fixed-length index array.
  Pick one and be consistent.
- **No emoji anywhere.** Markets are text labels, never flags.

## Metadata

```tsx
export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildMetadata({ locale: params.locale as Locale, path: routes.<key>, namespace: '<namespace>' });
}
```
Call `setRequestLocale(params.locale)` as the first statement of your page
component so the route stays static. Add the JSON-LD your page warrants via
`<JsonLd data={…} />` and the helpers in `@/lib/seo` — `softwareSchema` on a
product page, `faqSchema` where a real FAQ exists, `breadcrumbSchema` on any
page below the root. Never emit FAQ schema for questions not on the page.

## Guardrails that are not negotiable

1. **No fabricated proof.** Empty partner slots stay visibly empty (`.logo-slot`,
   `common.logoSlot`). No invented customer names, logos, quotes or metrics.
2. **Every product surface is labelled sample data** — `<SampleDataNote>` with
   `a11y.sampleData`, near the surface, not in a footnote.
3. **Unshipped features carry `<BuildingBadge label={t('common.building')} />`
   inline in the claim**, not in a footnote.
4. **No `href="#"`.** Every link resolves to a real route in `routes`, or to an
   in-page `#anchor` that exists on that page.
5. **Focus rings are blue (`--focus`), never brand purple.** Do not restyle them.
6. Every control has a programmatic name. Icon-only buttons get
   `<VisuallyHidden>`. Toggles derive `aria-pressed` from state, never from a
   hardcoded value.
7. Anything interactive that needs state goes in its own file with
   `'use client'` at the top. Keep the page itself a server component.
8. The phone number is masked until provisioned — read `site.phoneDisplay` and
   gate any `tel:` link on `hasPhone` from `@/lib/site`. Never type a number.

## Definition of done for your task

`npx tsc --noEmit` is clean for your files, and you have re-read your own
`page.tsx` looking specifically for surviving hardcoded copy. Report: the
namespace you created, the key count, any icon substitutions, and any place
where the static page did something you could not reproduce faithfully.
