import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp']
  },
  // Voz AI became Valet on 2026-08-17 and moved from /voz-ai to /valet. These
  // are permanent because the old path is never coming back: search engines
  // should transfer the ranking rather than index both, and anyone holding an
  // old link — RFM's docs, a signature, a deck — still lands on the page.
  // Locale-prefixed only: `localePrefix: 'always'`, so a bare /voz-ai never
  // existed and needs no rule.
  async redirects() {
    return [
      {
        source: '/:locale(es|en)/voz-ai',
        destination: '/:locale/valet',
        permanent: true
      },
      // The founding-partner programme closed, so /design-partners went with
      // it. Its only call to action was "apply with your operation", which is
      // the conversation /demo starts — better than a 404 for anyone holding
      // the old link.
      {
        source: '/:locale(es|en)/design-partners',
        destination: '/:locale/demo',
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // The site asks for no camera, microphone or geolocation, so it says
          // so rather than leaving the defaults open. A future scheduler embed
          // needs none of these either.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Vercel terminates TLS and redirects HTTP, but the header is what
          // stops the first request of a session from going out in the clear.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
