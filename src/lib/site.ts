import type { Locale } from '@/i18n/routing';

/**
 * Single source of truth for site-wide constants.
 *
 * PLACEHOLDER REGISTER — values that are deliberately not real yet. Each one is
 * read from an env var so it can be switched on without a code change, and each
 * has a matching row in README.md. Nothing here fabricates proof.
 */
export const site = {
  name: 'Ride Fleet',
  /**
   * The ONLY colour constant outside tokens.css — documented exception to the
   * no-colours-outside-tokens rule. `<meta name="theme-color">` is parsed by
   * the browser before any stylesheet loads, so it cannot read a custom
   * property. Must equal `--p-700` in tokens.css; `npm run build:icons` FAILS
   * if the two ever drift apart, and the generated icons + manifest inherit
   * this value so the whole icon set re-syncs in the same run.
   */
  brandHex: '#5a26c9',
  /** Set NEXT_PUBLIC_SITE_URL in the deploy environment. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ridefleet.com').replace(
    /\/$/,
    ''
  ),
  /** PLACEHOLDER Q11 — the tracked demo line. Masked until provisioned. */
  phoneDisplay: process.env.NEXT_PUBLIC_DEMO_PHONE_DISPLAY ?? '+1 787 XXX-XXXX',
  phoneHref: process.env.NEXT_PUBLIC_DEMO_PHONE_E164 ?? '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hola@ridefleet.com',
  /** PLACEHOLDER Q6 — scheduler embed. Empty renders the form-only path. */
  schedulerUrl: process.env.NEXT_PUBLIC_SCHEDULER_URL ?? '',
  locationLabel: 'San Juan, Puerto Rico · AST (UTC−4)',
  founded: 2026
} as const;

/** True once the owner has provisioned the tracked line (E0.3.1). */
export const hasPhone = site.phoneHref.length > 0;

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
};

/** BCP-47 tags used for `lang`, `hreflang` and Open Graph. */
export const localeTags: Record<Locale, string> = {
  es: 'es-PR',
  en: 'en-US'
};

/**
 * Every route the site ships. `key` is the i18n message key under `nav`;
 * `href` is the locale-less pathname consumed by the typed `Link`.
 */
export const routes = {
  home: '/',
  rideFleetManager: '/ride-fleet-manager',
  tollBridge: '/toll-bridge',
  vozAi: '/voz-ai',
  demo: '/demo',
  demoThankYou: '/demo/thank-you',
  designPartners: '/design-partners',
  security: '/security',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  accessibility: '/accessibility'
} as const;

export type RouteKey = keyof typeof routes;

/** Primary navigation. No `href="#"` ever ships (WEBSITE_PLAN §5.1). */
export const primaryNav: { key: RouteKey; navKey: string }[] = [
  { key: 'home', navKey: 'home' },
  { key: 'rideFleetManager', navKey: 'rideFleetManager' },
  { key: 'tollBridge', navKey: 'tollBridge' },
  { key: 'vozAi', navKey: 'vozAi' }
];

export const footerNav: {
  headingKey: string;
  links: { key: RouteKey; labelKey: string; hash?: string }[];
}[] = [
  {
    headingKey: 'products',
    links: [
      { key: 'rideFleetManager', labelKey: 'rideFleetManager' },
      { key: 'tollBridge', labelKey: 'tollBridge' },
      { key: 'vozAi', labelKey: 'vozAi' }
    ]
  },
  {
    headingKey: 'explore',
    links: [
      { key: 'home', labelKey: 'home' },
      { key: 'home', labelKey: 'router', hash: 'router' },
      { key: 'tollBridge', labelKey: 'calculator', hash: 'calculadora' },
      { key: 'vozAi', labelKey: 'callLine', hash: 'llamar' },
      // The separately-billed add-on had no route into it from anywhere on
      // the site; a deep link is the cheapest way to make it discoverable.
      { key: 'rideFleetManager', labelKey: 'marketIntelligence', hash: 'market' },
      { key: 'security', labelKey: 'security' }
    ]
  },
  {
    headingKey: 'getStarted',
    links: [
      { key: 'demo', labelKey: 'bookDemo' },
      { key: 'demo', labelKey: 'faq', hash: 'faq' },
      { key: 'designPartners', labelKey: 'designPartners' }
    ]
  }
];

export const legalNav: { key: RouteKey; labelKey: string }[] = [
  { key: 'privacy', labelKey: 'privacy' },
  { key: 'terms', labelKey: 'terms' },
  { key: 'cookies', labelKey: 'cookies' },
  { key: 'accessibility', labelKey: 'accessibility' }
];
