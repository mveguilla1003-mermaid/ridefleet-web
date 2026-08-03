import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locale-prefixed routes for BOTH locales (`/es/...`, `/en/...`).
 *
 * Spanish is the primary market locale (Puerto Rico first), so `es` is the
 * default and `/` redirects to `/es`. `localePrefix: 'always'` keeps every
 * canonical URL unambiguous, which is what the hreflang pairs in
 * `src/lib/seo.ts` depend on.
 *
 * `localeDetection` is deliberately OFF: Accept-Language may *suggest* a
 * locale but must never force-redirect a visitor (WEBSITE_PLAN §5.3).
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  localeDetection: false
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
