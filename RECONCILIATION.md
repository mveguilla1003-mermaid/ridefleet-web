# Design-system reconciliation

`site-v2/_system/design-system.css` was the canonical stylesheet, but each of the
five static pages shipped with its own inlined copy. Pages 04 and 05 were
byte-identical to canon. Pages 01, 02 and 03 had each independently patched
shared components — exactly the "one source, not five drifted copies" failure
`WEBSITE_PLAN.md` §7.1 warns about.

The rule applied here: **objectively-correct fixes are promoted into the one
canonical stylesheet; genuine visual variants become opt-in modifiers in that
same stylesheet.** Nothing was left forked, and no page keeps a private copy of
a shared component.

## Promoted — contrast and accessibility

| Change | From | Why |
| --- | --- | --- |
| `--n-600` `#736a8b` → `#675e7c` | 02 | 5.04 → 6.05 on white; the old value dropped under AA once meta text sat on `--n-200` |
| `.lang button` `--text-3` → `--text-2` | 03 | measured 4.44 on `--surface-3` — an outright AA failure. Now 8.13 AAA |
| `.lang .sep` glyph → 1px rule | 03 | a text `\|` at that weight cannot reach AA at any colour that still reads as a separator |
| `.app-crumbs svg` `--n-400` → `--n-500` | 02 | decorative-icon floor |
| `.band--ink .searchpill kbd` → `--ink-tx-2` | 03 | key cap legend was below AA on the ink band |

## Promoted — additive utilities and layout fixes

`.sec--pad-sm` / `.sec--pt-sm` / `.sec--pb-sm` / `.sec--flush-bottom` (02);
`.tbl--stack` phone row-to-block table (02); `.app` table column-shedding at
1080px and 640px (01); `.eyebrow` tightening ≤460px so the longest Spanish
eyebrow stays one line (01); `.callout` 164px → 190px so long English strings
stop growing the block upward into the row above (01); `.kpis` two-column with a
full-row first cell at ≤1180px (01); editorial rail column `minmax(96px|80px)` →
`minmax(124px)` plus `white-space:nowrap` on `.chapter-mark .of` (03);
`main:has(.sec--cta) + .site-footer` margin trim (01).

## Promoted as opt-in modifiers — real variants, not drift

`.cta-band--duo` (01: argument left, action right, ruled grid instead of a
blurred blob), `.cta-band--split` (02: asymmetric with tag row and action rail),
`.cta-close` / `.cta-grid` / `.cta-agenda` (03: rule-led light closing CTA with a
"what the 30 minutes contains" rail), `.trust--rail` (03: editorial trust rail
instead of a centred row of chips), `.partner-invite--flush` (01: solid,
left-aligned empty partner card).

Each keeps the canonical base intact and is applied by adding a class in markup,
so the base component still renders identically everywhere it is used unmodified.
