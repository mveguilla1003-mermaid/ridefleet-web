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
  /**
   * The public origin. Live at demo.ridefleetmanager.com since 2026-08-26 —
   * a subdomain of the product domain, not ridefleet.com, which is still
   * unregistered. NEXT_PUBLIC_SITE_URL overrides it in the deploy environment
   * (Vercel holds exactly this value), so the fallback only shows up in local
   * builds; it is written out rather than left at the old placeholder because
   * canonical tags, the sitemap and robots.txt all derive from it, and a wrong
   * fallback publishes a host that does not exist without failing any gate.
   * Moving it obliges `npm run build:og` — the card artwork prints this host.
   */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://demo.ridefleetmanager.com'
  ).replace(/\/$/, ''),
  /**
   * The Valet demo line — a real number that costs money per minute, so where
   * it appears is a deliberate, narrow decision (RFM brief, 2026-08-26):
   *
   *   It is a DEMO of the AI voice agent. Anyone may call it and talk to the
   *   agent. It is NOT support, NOT reservations, NOT customer service.
   *
   * That rules out the header, the footer, any contact page, and the global
   * mobile bar — anywhere somebody with a rental problem could reach it by
   * mistake. It ships on /valet only, beside copy that says "demo" out loud.
   * Do not add a second call site without asking the owner first.
   */
  phoneDisplay: process.env.NEXT_PUBLIC_DEMO_PHONE_DISPLAY ?? '+1 (904) 921-2162',
  phoneHref: process.env.NEXT_PUBLIC_DEMO_PHONE_E164 ?? '+19049212162',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hola@ridefleet.com',
  /**
   * Cal.com booking page, live since 2026-08-25. The event is 60 minutes,
   * which is why every "30 minutes" promise on the site moved to 60 — the
   * agenda on /demo is cut into five slots that sum to it. If this ever points
   * at an event of a different length, those slots and ~35 strings move too.
   * Opened in a new tab, never framed: an iframe would need its origin in
   * frame-src, and /cookies promises no third-party loads.
   */
  schedulerUrl:
    process.env.NEXT_PUBLIC_SCHEDULER_URL ??
    'https://cal.com/ridefleetmanager-demo/60min',
  /**
   * The product showcase, framed on the home page. It is NOT copied into
   * this repo on purpose: its chapter copy comes from the same file that
   * feeds the in-product training, so a duplicate would drift the day
   * someone corrects a training line. Its origin must stay listed in the
   * middleware's `frame-src`.
   */
  showcaseUrl: 'https://ridefleetmanager.com/showcase',

  /**
   * SecurityMetrics scan certificate, linked from /security. The token in the
   * query string is the certificate's public identifier, not a secret — it is
   * how their portal addresses a certificate, and the page it opens is public.
   * Whatever this points at, the copy beside it must keep describing what the
   * certificate ACTUALLY says: a quarterly vulnerability scan of the network
   * the team works from. It is not a PCI certification of the product.
   */
  certificateUrl:
    'https://www.securitymetrics.com/site_certificate?id=2576693&tk=eab3ba2c935c073e44d258a19cd4601a',
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
  // Voz AI was renamed Valet on 2026-08-17 and took over /valet. The airport
  // pickup arc that used to own that path is now a section inside the same
  // page — one product doing one job, not two routes. /voz-ai still resolves:
  // next.config.js redirects it here permanently, in both locales.
  valet: '/valet',
  pricing: '/pricing',
  demo: '/demo',
  demoThankYou: '/demo/thank-you',
  // /design-partners was deleted on 2026-08-17 with the founding-partner
  // programme it recruited for. next.config.mjs redirects it to /demo: the
  // page's only action was "apply with your operation", and that is the same
  // conversation the demo form starts. 12 routes.
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
  { key: 'valet', navKey: 'valet' },
  { key: 'pricing', navKey: 'pricing' }
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
      { key: 'valet', labelKey: 'valet' }
    ]
  },
  {
    headingKey: 'explore',
    links: [
      { key: 'home', labelKey: 'home' },
      { key: 'home', labelKey: 'router', hash: 'router' },
      { key: 'tollBridge', labelKey: 'calculator', hash: 'calculadora' },
      // Airport pickup is a section of the Valet page now, not its own route,
      // so this is a deep link rather than a page link.
      { key: 'valet', labelKey: 'pickup', hash: 'recogida' },
      { key: 'rideFleetManager', labelKey: 'rideUniversity', hash: 'university' },
      { key: 'rideFleetManager', labelKey: 'marketIntelligence', hash: 'market' },
      { key: 'security', labelKey: 'security' }
    ]
  },
  {
    headingKey: 'getStarted',
    links: [
      { key: 'demo', labelKey: 'bookDemo' },
      { key: 'demo', labelKey: 'faq', hash: 'faq' },
      { key: 'pricing', labelKey: 'pricing' }
    ]
  }
];

export const legalNav: { key: RouteKey; labelKey: string }[] = [
  { key: 'privacy', labelKey: 'privacy' },
  { key: 'terms', labelKey: 'terms' },
  { key: 'cookies', labelKey: 'cookies' },
  { key: 'accessibility', labelKey: 'accessibility' }
];
