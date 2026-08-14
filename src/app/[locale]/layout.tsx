import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { localeTags } from '@/lib/site';
import { organizationSchema } from '@/lib/seo';
import { IconSprite } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';
import { PageEffects } from '@/components/PageEffects';
// Global stylesheets are imported by the ROOT layout so they also reach the
// root 404, which renders outside this segment.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <html lang={localeTags[locale as Locale]}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <IconSprite />
          <a className="skip-link" href="#main">
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <StickyCta />
          <PageEffects />
          <JsonLd data={organizationSchema(locale as Locale)} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
