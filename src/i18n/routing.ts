import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locale-prefixed routes for BOTH locales (`/es/...`, `/en/...`).
 *
 * `en` is the default since 2026-08-26 (owner's call): `/` redirects to
 * `/en` and an unprefixed URL falls back to English. Spanish is NOT demoted
 * — both locales are complete, both are prefixed, both carry the same
 * hreflang pair, and the switcher in the header moves between them on any
 * page. The default only decides what a visitor sees who expressed no
 * preference at all.
 *
 * Changing this one value moves three things at once, which is why they are
 * not configured separately anywhere: the `/` redirect (via the middleware),
 * the `x-default` hreflang target in `src/lib/seo.ts`, and the language the
 * root 404 renders for URLs with no locale prefix.
 *
 * `localePrefix: 'always'` keeps every canonical URL unambiguous, which is
 * what the hreflang pairs depend on — and it is why flipping the default
 * cannot orphan an existing URL: `/es/...` keeps working untouched.
 *
 * `localeDetection` is deliberately OFF: Accept-Language may *suggest* a
 * locale but must never force-redirect a visitor (WEBSITE_PLAN §5.3). So a
 * browser set to Spanish still lands on English and switches by choice —
 * that is the intent, not an oversight.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
