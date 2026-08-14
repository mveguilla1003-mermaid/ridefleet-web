import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { localeTags, routes } from '@/lib/site';
import { IconSprite } from '@/components/Icons';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';
import { Section, Eyebrow, ButtonLink, ArrowLink } from '@/components/ui';

/**
 * Global 404 — lives at the ROOT, outside `[locale]`, on purpose: unknown
 * URLs resolve to the root not-found boundary in Next 14.2 (a nested
 * `[locale]/not-found.tsx` never renders for them), and the pass-through
 * root layout means this file owns the full document.
 *
 * It is LOCALISED per request, not bilingual: every page renders dynamically
 * (the nonce CSP requires it), and the next-intl middleware resolves the
 * locale from the URL prefix on the way in — so /es/nope renders Spanish and
 * /en/nope English, each with the REAL shell (header, ES|EN switch, footer,
 * sticky CTA) wired through NextIntlClientProvider. Paths the middleware
 * matcher skips (dotted files) fall back to the default locale. This
 * replaces an earlier both-languages-in-one-page 404 from before the site
 * went dynamic; if the site ever returns to static rendering, that is the
 * design to bring back.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    robots: { index: false, follow: false }
    // icons + manifest are inherited from the root layout's metadata.
  };
}

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const t = await getTranslations('notFound');
  const nav = await getTranslations('nav');
  const a11y = await getTranslations('a11y');

  return (
    <html lang={localeTags[locale]}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <IconSprite />
          <a className="skip-link" href="#main">
            {a11y('skipToContent')}
          </a>
          <Header />
          <main id="main">
            <Section>
              <div style={{ maxWidth: 'var(--container-narrow)' }}>
                <Eyebrow tone="neutral">{t('eyebrow')}</Eyebrow>
                <h1>{t('title')}</h1>
                <p className="lede">{t('lede')}</p>
                <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
                  <ButtonLink href={routes.demo}>{t('cta')}</ButtonLink>
                  <ButtonLink href={routes.home} tone="secondary">
                    {nav('home')}
                  </ButtonLink>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--sp-5)',
                    marginTop: 'var(--sp-8)'
                  }}
                >
                  <ArrowLink href={routes.rideFleetManager}>
                    {nav('rideFleetManager')}
                  </ArrowLink>
                  <ArrowLink href={routes.tollBridge} tone="gold">
                    {nav('tollBridge')}
                  </ArrowLink>
                  <ArrowLink href={routes.vozAi} tone="teal">
                    {nav('vozAi')}
                  </ArrowLink>
                </div>
              </div>
            </Section>
          </main>
          <Footer />
          <StickyCta />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
