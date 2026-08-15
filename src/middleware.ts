import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

/**
 * i18n routing + a nonce-based Content-Security-Policy.
 *
 * The nonce is minted per request and travels two ways:
 *  - on the REQUEST headers (x-nonce + Content-Security-Policy), which is how
 *    Next's app-router renderer discovers it and stamps it onto every script
 *    tag it emits — and why pages render dynamically now: a per-request nonce
 *    cannot exist in prerendered HTML;
 *  - on the RESPONSE header, which is what the browser enforces.
 *
 * Directive notes:
 *  - script-src: 'strict-dynamic' trusts whatever the nonced bootstrap loads
 *    (Next's chunk loader) and makes browsers that support it ignore the
 *    'self' fallback, which stays for older ones. Dev needs 'unsafe-eval'
 *    for react-refresh.
 *  - style-src keeps 'unsafe-inline': the UI primitives use style=""
 *    attributes (governed by style-src, and hashes cannot cover attributes),
 *    and Next injects <style> tags in dev. CSS injection is the only thing
 *    this concedes.
 *  - The JSON-LD <script type="application/ld+json"> blocks are data, not
 *    executable scripts — CSP does not block them, so they need no nonce.
 *  - frame-src: the product showcase is framed from the app origin, so that
 *    origin is listed. Any future embed (the scheduler, site.schedulerUrl)
 *    must be added here too or it will be blocked with no visible cause
 *    beyond a console error.
 */
/**
 * Origin of the framed product showcase. Kept as a literal rather than
 * derived from site.showcaseUrl because the middleware runs on the edge
 * runtime and a CSP typo fails silently — the frame just never paints.
 */
const SHOWCASE_ORIGIN = 'https://ridefleetmanager.com';

export default function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `connect-src 'self'`,
    `frame-src 'self' ${SHOWCASE_ORIGIN}`,
    ...(isDev ? [] : ['upgrade-insecure-requests'])
  ].join('; ');

  request.headers.set('x-nonce', nonce);
  request.headers.set('Content-Security-Policy', csp);

  const response = handleI18nRouting(request);
  response.headers.set('Content-Security-Policy', csp);

  // Companions to the CSP. frame-ancestors already blocks framing in every
  // current browser; X-Frame-Options is the legacy spelling for older ones.
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  // The site uses none of these; saying so explicitly also silences
  // permission prompts from anything a future embed might try.
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  // Reservation of rights against text and data mining, as a header so it
  // travels with every response rather than only with robots.txt. `noai`
  // is an emerging convention rather than a standard, and honouring it is
  // voluntary — it does not block anything on its own. `noindex` is
  // deliberately NOT here: search engines are welcome.
  response.headers.set('X-Robots-Tag', 'noai, noimageai');
  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  return response;
}

export const config = {
  // Everything except Next internals, the API routes and static files.
  matcher: ['/((?!api|_next|_vercel|fonts|.*\\..*).*)']
};
