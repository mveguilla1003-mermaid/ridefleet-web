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
 *  - frame-src: when the scheduler embed goes live (site.schedulerUrl), its
 *    origin must be added here or the embed will be silently blocked.
 */
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
    `frame-src 'self'`,
    ...(isDev ? [] : ['upgrade-insecure-requests'])
  ].join('; ');

  request.headers.set('x-nonce', nonce);
  request.headers.set('Content-Security-Policy', csp);

  const response = handleI18nRouting(request);
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  // Everything except Next internals, the API routes and static files.
  matcher: ['/((?!api|_next|_vercel|fonts|.*\\..*).*)']
};
